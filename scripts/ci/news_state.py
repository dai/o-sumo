"""Pure durable news state transitions; Git persistence belongs to the caller."""
from __future__ import annotations

from copy import deepcopy
from datetime import date, datetime, timedelta, timezone
import re
from urllib.parse import urlsplit

JST = timezone(timedelta(hours=9))
FINAL_SCHEDULE = "5 10 * * *"
STATE_KEYS = {"schemaVersion", "latestGood", "lastAttemptAt", "lastSuccessAt", "consecutiveFailures", "processedRuns", "lastRunId", "lastPublishedDate", "lastPublishedSha", "initializedAt"}


def timestamp(value):
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})", value):
        raise ValueError("timestamp must be an explicit ISO date-time with timezone")
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return parsed.astimezone(timezone.utc)


def _now(value):
    if not isinstance(value, datetime) or value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("time must be timezone-aware")
    return value.astimezone(timezone.utc)


def _date(value):
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        raise ValueError("date must be YYYY-MM-DD")
    return date.fromisoformat(value)


def _integer(value):
    return type(value) is int and value >= 0


def _run_id(value):
    if not isinstance(value, str) or not re.fullmatch(r"[1-9][0-9]*", value):
        raise ValueError("run_id must be a positive decimal GitHub run ID")
    return int(value)


def validate_payload(payload, *, require_success=True):
    if not isinstance(payload, dict) or set(payload) - {"updatedAt", "sources", "items", "lastFailureStreak"} or not {"updatedAt", "sources", "items"} <= set(payload):
        raise ValueError("invalid public news schema")
    timestamp(payload["updatedAt"])
    if not _integer(payload.get("lastFailureStreak", 0)):
        raise ValueError("invalid public failure streak")
    sources = payload["sources"]
    if not isinstance(sources, list) or not sources:
        raise ValueError("sources must be a nonempty list")
    ids = set()
    for source in sources:
        if not isinstance(source, dict) or not isinstance(source.get("id"), str) or not source["id"] or source["id"] in ids or type(source.get("ok")) is not bool:
            raise ValueError("invalid source")
        ids.add(source["id"])
        if "label" in source and not isinstance(source["label"], str):
            raise ValueError("invalid source label")
        if "count" in source and not _integer(source["count"]):
            raise ValueError("invalid source count")
    if require_success and not any(source["ok"] for source in sources):
        raise ValueError("latestGood must have a successful source")
    if not isinstance(payload["items"], list):
        raise ValueError("items must be a list")
    item_ids = set()
    for item in payload["items"]:
        if not isinstance(item, dict) or any(not isinstance(item.get(key), str) or not item[key] for key in ("id", "title", "url", "sourceId")):
            raise ValueError("invalid news item")
        if item["id"] in item_ids or item["sourceId"] not in ids:
            raise ValueError("duplicate item or unknown source")
        item_ids.add(item["id"])
        url = urlsplit(item["url"])
        if url.scheme not in ("https", "http") or not url.netloc:
            raise ValueError("invalid news URL")
        if "publishedAt" not in item:
            raise ValueError("missing publication date")
        if item["publishedAt"] is not None:
            _date(item["publishedAt"])
        for key in ("publishedAtRaw", "sourceLabel"):
            if key in item and not isinstance(item[key], str):
                raise ValueError("invalid news text")


def validate_state(state):
    if not isinstance(state, dict) or set(state) != STATE_KEYS or type(state["schemaVersion"]) is not int or state["schemaVersion"] != 1:
        raise ValueError("invalid durable state schema")
    validate_payload(state["latestGood"])
    success = timestamp(state["lastSuccessAt"])
    attempt = timestamp(state["lastAttemptAt"])
    timestamp(state["initializedAt"])
    if success != timestamp(state["latestGood"]["updatedAt"]) or success > attempt:
        raise ValueError("inconsistent successful acquisition time")
    if not _integer(state["consecutiveFailures"]):
        raise ValueError("invalid failure count")
    runs = state["processedRuns"]
    if not isinstance(runs, dict):
        raise ValueError("invalid processed run ledger")
    for run_id, entry in runs.items():
        _run_id(run_id)
        if not isinstance(entry, dict) or set(entry) != {"attemptedAt", "outcome"} or entry["outcome"] not in ("success", "failure"):
            raise ValueError("invalid processed run")
        if timestamp(entry["attemptedAt"]) > attempt:
            raise ValueError("processed run is newer than last attempt")
    if runs:
        if state["lastRunId"] not in runs or _run_id(state["lastRunId"]) != max(map(_run_id, runs)) or timestamp(runs[state["lastRunId"]]["attemptedAt"]) != attempt:
            raise ValueError("invalid last run")
    elif state["lastRunId"] is not None:
        raise ValueError("last run is absent from ledger")
    published, sha = state["lastPublishedDate"], state["lastPublishedSha"]
    if published is not None:
        if _date(published) > success.astimezone(JST).date() or not isinstance(sha, str) or not re.fullmatch(r"[0-9a-f]{40}|[0-9a-f]{64}", sha):
            raise ValueError("invalid publication marker")
    elif sha is not None:
        raise ValueError("publication SHA without date")


def initialize(payload, now):
    """Migrate a validated main payload without inventing a fresh acquisition."""
    validate_payload(payload)
    now = _now(now)
    if timestamp(payload["updatedAt"]) > now:
        raise ValueError("future acquisition timestamp")
    state = {"schemaVersion": 1, "latestGood": deepcopy(payload), "lastAttemptAt": payload["updatedAt"], "lastSuccessAt": payload["updatedAt"], "consecutiveFailures": payload.get("lastFailureStreak", 0), "processedRuns": {}, "lastRunId": None, "lastPublishedDate": None, "lastPublishedSha": None, "initializedAt": now.isoformat()}
    validate_state(state)
    return state


def record_attempt(state, candidate, run_id, attempted_at):
    validate_state(state)
    run_number, attempted_at = _run_id(run_id), _now(attempted_at)
    result = deepcopy(state)
    if run_id in state["processedRuns"] or (state["lastRunId"] is not None and run_number < _run_id(state["lastRunId"])) or attempted_at < timestamp(state["lastAttemptAt"]):
        return result
    if candidate is not None:
        validate_payload(candidate, require_success=False)
        acquired = timestamp(candidate["updatedAt"])
        if acquired > attempted_at or acquired < timestamp(state["lastSuccessAt"]):
            # A stale or future-dated candidate cannot replace the recorded
            # latestGood; count it as a failed attempt so the durable state
            # remains consistent and `select_publication` decides whether to
            # publish using the existing `consecutiveFailures` guard.
            candidate = None
        elif not any(source["ok"] for source in candidate["sources"]):
            candidate = None
    outcome = "success" if candidate is not None else "failure"
    result["processedRuns"][run_id] = {"attemptedAt": attempted_at.isoformat(), "outcome": outcome}
    result["lastRunId"] = run_id
    result["lastAttemptAt"] = attempted_at.isoformat()
    if candidate is None:
        result["consecutiveFailures"] += 1
    else:
        result["latestGood"] = deepcopy(candidate)
        result["latestGood"]["lastFailureStreak"] = 0
        result["lastSuccessAt"] = candidate["updatedAt"]
        result["consecutiveFailures"] = 0
    validate_state(result)
    return result


def publication_date(state):
    validate_state(state)
    return timestamp(state["lastSuccessAt"]).astimezone(JST).date().isoformat()


def select_publication(state, event_name, event_schedule, now):
    validate_state(state)
    now = _now(now)
    age = now - timestamp(state["lastSuccessAt"])
    eligible_event = (event_name == "schedule" and event_schedule == FINAL_SCHEDULE) or (event_name == "workflow_dispatch" and now.astimezone(JST).hour >= 19)
    target = publication_date(state)
    return eligible_event and timedelta(0) <= age < timedelta(hours=24) and state["consecutiveFailures"] < 3 and (state["lastPublishedDate"] is None or target > state["lastPublishedDate"])


def publication_payload(state):
    validate_state(state)
    result = deepcopy(state["latestGood"])
    result["lastFailureStreak"] = state["consecutiveFailures"]
    return result


def mark_published(state, target_date, sha):
    """Call only after successful external publication (including confirmed no-op)."""
    validate_state(state)
    _date(target_date)
    if target_date != publication_date(state):
        raise ValueError("publication must match latest good acquisition date")
    if state["lastPublishedDate"] is not None and target_date < state["lastPublishedDate"]:
        raise ValueError("publication date cannot move backwards")
    result = deepcopy(state)
    result["lastPublishedDate"], result["lastPublishedSha"] = target_date, sha
    validate_state(result)
    return result
