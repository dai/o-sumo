"""Publish validated generated files from a fresh remote base, without rebasing."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path, PurePosixPath
import subprocess
import tempfile
from typing import Callable, Sequence


class PublishError(RuntimeError):
    """A publication could not safely complete."""


@dataclass(frozen=True)
class PublishResult:
    changed: bool
    commit_sha: str
    attempts: int


def _git(repository: Path, *args: str, check: bool = True) -> subprocess.CompletedProcess:
    result = subprocess.run(
        ["git", "-C", str(repository), *args], capture_output=True, text=True,
        encoding="utf-8", errors="replace",
    )
    if check and result.returncode:
        # Git stderr can contain authenticated remote URLs. Never relay it.
        raise PublishError(f"Git {args[0]} failed (exit {result.returncode}); check repository access and Git configuration.")
    return result


def _remote_head(repository: Path, branch: str) -> str | None:
    result = _git(repository, "ls-remote", "--exit-code", "origin", f"refs/heads/{branch}", check=False)
    if result.returncode == 2:
        return None
    if result.returncode:
        raise PublishError("Cannot read remote branch; check origin access and authentication.")
    return result.stdout.split()[0]


def _fetch(repository: Path, branch: str) -> str:
    _git(repository, "fetch", "--no-tags", "origin", f"refs/heads/{branch}")
    return _git(repository, "rev-parse", "FETCH_HEAD").stdout.strip()


def publish(
    repository: Path, *, generate: Callable[[Path], None],
    validate: Callable[[Path], None], allowed_paths: Sequence[str], message: str,
    branch: str = "main", max_attempts: int = 3, bootstrap: bool = False,
) -> PublishResult:
    """Regenerate and validate after each remote race; push only fast forwards.

    Callbacks receive a disposable checkout. They must read mutable inputs from
    that checkout on every invocation. Allowed paths are exact file paths.
    A no-op is confirmed against the remote after generation and validation.
    """
    repository = Path(repository).resolve()
    if branch not in {"main", "automation/news-state"}:
        raise ValueError("Unsupported publication branch")
    if bootstrap and branch != "automation/news-state":
        raise ValueError("Bootstrap is only supported for automation/news-state")
    if not 1 <= max_attempts <= 3:
        raise ValueError("max_attempts must be between 1 and 3")
    allowed = set(allowed_paths)
    if not allowed or any(
        not p or "\\" in p or ":" in p or PurePosixPath(p).is_absolute()
        or any(part in {"..", ".git"} for part in PurePosixPath(p).parts)
        or str(PurePosixPath(p)) != p for p in allowed
    ):
        raise ValueError("allowed_paths must contain exact normalized repository-relative files")

    for attempt in range(1, max_attempts + 1):
        exists = _remote_head(repository, branch) is not None
        if not exists and not bootstrap:
            raise PublishError(f"Remote branch {branch} is missing")
        base = _fetch(repository, branch if exists else "main")
        with tempfile.TemporaryDirectory(prefix="data-publish-") as temporary:
            checkout = Path(temporary) / "checkout"
            _git(repository, "worktree", "add", "--detach", str(checkout), base)
            try:
                generate(checkout)
                validate(checkout)
                # Diff against the base catches staged edits as well as unstaged
                # changes, including both sides of renames. Ignored build files
                # remain disposable and are never staged.
                tracked = _git(checkout, "diff", "--name-only", "--no-renames", "-z", base).stdout
                untracked = _git(checkout, "ls-files", "--others", "--exclude-standard", "-z").stdout
                changed = set(filter(None, (tracked + untracked).split("\0")))
                outside = changed - allowed
                if outside:
                    raise PublishError("Generated changes outside allowed_paths: " + ", ".join(sorted(outside)))
                if not changed:
                    if _remote_head(repository, branch) == (base if exists else None):
                        return PublishResult(False, base, attempt)
                    continue
                _git(checkout, "--literal-pathspecs", "add", "--", *sorted(changed))
                _git(checkout, "-c", "user.name=github-actions[bot]", "-c",
                     "user.email=41898282+github-actions[bot]@users.noreply.github.com",
                     "-c", "commit.gpgsign=false", "commit", "-m", message)
                commit = _git(checkout, "rev-parse", "HEAD").stdout.strip()
                pushed = _git(checkout, "push", "origin", f"HEAD:refs/heads/{branch}", check=False)
                if not pushed.returncode:
                    return PublishResult(True, commit, attempt)
                # Retry only races, not credential/server/hook failures. A fresh
                # checkout regenerates against every concurrent writer's data.
                current = _remote_head(repository, branch)
                if current == (base if exists else None):
                    raise PublishError("Push failed without a remote advance; check branch protection, permissions, and server hooks.")
            finally:
                _git(repository, "worktree", "remove", "--force", str(checkout))
    raise PublishError(f"Remote branch kept advancing; publication exhausted {max_attempts} attempts")
