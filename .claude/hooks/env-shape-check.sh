#!/bin/bash
# env-shape-check.sh — On any Write/Edit to a `.env*` file, shape-check the
# critical secret values (length + prefix + vendor pattern). Emit a
# systemMessage with any anomalies; never block (writes proceed, user sees the
# nudge).
#
# See [[feedback_env_secret_shape_check]]: presence checks miss truncations,
# wrong-vendor pastes, and typos. Shape-checks catch those.

set -euo pipefail

input="$(cat)"
parsed="$(/usr/bin/python3 -c '
import json, sys
data = json.loads(sys.stdin.read() or "{}")
print(data.get("tool_name", ""))
print((data.get("tool_input") or {}).get("file_path", ""))
' <<<"$input")"

tool="$(printf '%s\n' "$parsed" | sed -n '1p')"
path="$(printf '%s\n' "$parsed" | sed -n '2p')"

case "$tool" in Write|Edit) ;; *) echo '{}'; exit 0 ;; esac

# Only fire on .env* basename
base="$(basename "$path")"
case "$base" in .env|.env.*) ;; *) echo '{}'; exit 0 ;; esac

# Must exist (post-write)
[ -f "$path" ] || { echo '{}'; exit 0; }

# Shape-check each KEY=VALUE line in the env file. Output any anomalies.
findings="$(/usr/bin/python3 - "$path" <<'PY'
import os, re, sys

path = sys.argv[1]
out = []

# Known patterns: (regex on KEY, predicate on VALUE) -> human-readable problem
checks = [
    ("STRIPE_SECRET_KEY",         lambda v: not re.match(r"^sk_(test|live)_[A-Za-z0-9]{20,}$", v),  "Stripe secret key should match `sk_test_…` or `sk_live_…` with 20+ chars after the prefix"),
    ("STRIPE_PUBLISHABLE_KEY",    lambda v: not re.match(r"^pk_(test|live)_[A-Za-z0-9]{20,}$", v),  "Stripe publishable key should match `pk_test_…` or `pk_live_…` with 20+ chars after the prefix"),
    ("STRIPE_WEBHOOK_SECRET",     lambda v: not re.match(r"^whsec_[A-Za-z0-9]{32,}$", v),           "Stripe webhook secret should match `whsec_…` with 32+ chars after the prefix"),
    ("RESEND_API_KEY",            lambda v: not re.match(r"^re_[A-Za-z0-9_]{20,}$", v),             "Resend API key should match `re_…` with 20+ chars after the prefix"),
    ("OPENAI_API_KEY",            lambda v: not re.match(r"^sk-(proj-)?[A-Za-z0-9_-]{20,}$", v),    "OpenAI key should match `sk-…` or `sk-proj-…` with 20+ chars"),
    ("ANTHROPIC_API_KEY",         lambda v: not re.match(r"^sk-ant-[A-Za-z0-9_-]{40,}$", v),        "Anthropic key should match `sk-ant-…` with 40+ chars"),
    ("AWS_SECRET_ACCESS_KEY|S3_SECRET_ACCESS_KEY", lambda v: len(v) != 40,                          "AWS/S3 secret access key is canonically 40 chars"),
    ("AWS_ACCESS_KEY_ID|S3_ACCESS_KEY",            lambda v: not re.match(r"^(AKIA|ASIA)[A-Z0-9]{16}$", v),  "AWS access key id should match `AKIA…`/`ASIA…` (20 chars total)"),
    ("DATABASE_URL|DATABASE_PUBLIC_URL", lambda v: not re.match(r"^postgres(ql)?://", v),           "DATABASE_URL should be a postgres:// or postgresql:// URI"),
    ("NEXTAUTH_SECRET|AUTH_SECRET|BETTER_AUTH_SECRET", lambda v: len(v) < 32,                       "auth secret should be 32+ chars of random bytes"),
]

placeholder_red_flags = re.compile(r"^(your[-_]?key[-_]?here|TODO|CHANGEME|XXX+|placeholder|test|example|<.*>)$", re.IGNORECASE)

try:
    with open(path, "r", encoding="utf-8") as f:
        for lineno, raw in enumerate(f, 1):
            line = raw.rstrip("\n")
            if not line or line.lstrip().startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            # Strip surrounding quotes from value
            v = value.strip()
            if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                v = v[1:-1]
            if not v:
                continue
            if placeholder_red_flags.match(v):
                out.append(f"  line {lineno}: {key} looks like a placeholder ({v!r})")
                continue
            for key_re, predicate, problem in checks:
                if re.fullmatch(key_re, key):
                    try:
                        if predicate(v):
                            out.append(f"  line {lineno}: {key} (len={len(v)}, first 6={v[:6]!r}) — {problem}")
                    except Exception:
                        pass
                    break
except Exception as e:
    out.append(f"  shape-check error: {e}")

print("\n".join(out), end="")
PY
)"

if [ -z "$findings" ]; then
  echo '{}'
  exit 0
fi

# Emit JSON systemMessage with findings. JSON-escape via python.
/usr/bin/python3 - <<PY
import json
msg = "[env-shape-check] Anomalies in $path (write proceeded; verify before deploy):\n" + """$findings"""
print(json.dumps({"systemMessage": msg}))
PY
