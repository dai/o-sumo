#!/usr/bin/env bash
set -euo pipefail

source_root=$PWD
root=$(mktemp -d)
root=$(cd "$root" && pwd -P)
case "$root" in
  /tmp/*|/c/Users/*/AppData/Local/Temp/*) ;;
  *) echo "refusing unsafe temp cleanup target: $root" >&2; exit 1 ;;
esac
cleanup() {
  if [ -n "$root" ] && [ "$root" != "/" ] && [ -d "$root" ]; then
    rm -rf -- "$root"
  fi
}
trap cleanup EXIT
git init --bare "$root/remote.git" >/dev/null
git clone "$root/remote.git" "$root/seed" >/dev/null 2>&1
cd "$root/seed"
git config user.name test
git config user.email test@example.com
mkdir -p public/api/v1 app/lib scripts/ci
printf '%s\n' '{"schedule":"fresh","result":"old"}' > public/api/v1/torikumi.json
cp public/api/v1/torikumi.json app/lib/torikumi-data.ts
printf '%s\n' public/api/v1/torikumi.json app/lib/torikumi-data.ts > scripts/ci/torikumi_paths.txt
printf '%s\n' 'raise SystemExit(0)' > scripts/ci/validate_torikumi.py
git add . && git commit -m base >/dev/null && git branch -M main && git push origin main >/dev/null

git clone -b main "$root/remote.git" "$root/realtime" >/dev/null 2>&1
cd "$root/realtime"
git config user.name test
git config user.email test@example.com
printf '%s\n' '{"schedule":"fresh","result":"new"}' > public/api/v1/torikumi.json
cp public/api/v1/torikumi.json app/lib/torikumi-data.ts
git add . && git commit -m realtime >/dev/null
cp "$source_root/scripts/ci/push_realtime_update.sh" scripts/ci/push_realtime_update.sh

cd "$root/seed"
printf '%s\n' '{"schedule":"remote-new","result":"old"}' > public/api/v1/torikumi.json
cp public/api/v1/torikumi.json app/lib/torikumi-data.ts
git add . && git commit -m schedule >/dev/null && git push origin main >/dev/null

cd "$root/realtime"
set +e
GITHUB_REF_NAME=main bash scripts/ci/push_realtime_update.sh >out 2>err
status=$?
set -e
test "$status" -ne 0
grep -q 'manual fresh rerun' err
git --git-dir="$root/remote.git" show main:public/api/v1/torikumi.json | grep -q 'remote-new'
test "$(git --git-dir="$root/remote.git" rev-list --count main)" -eq 2
echo 'push conflict preserved remote schedule: OK'
