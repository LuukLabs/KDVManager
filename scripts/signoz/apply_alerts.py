#!/usr/bin/env python3
"""Apply the alert rules in ./alerts to a SigNoz instance, idempotently.

Rules are matched by their "alert" (name) field: existing rules with the same
name are updated in place, new ones are created. Rules that exist only in
SigNoz are left untouched, so UI-managed alerts are safe.

Usage:
  SIGNOZ_API_KEY=... ./apply_alerts.py [--url https://signoz.kdvmanager.nl] [--dry-run]
  SIGNOZ_API_KEY=... ./apply_alerts.py --retention traces=360h logs=360h metrics=720h

The API key is a SigNoz PAT (SigNoz UI -> Settings -> API Keys, role Admin).
Stdlib only; no dependencies.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ALERTS_DIR = Path(__file__).parent / "alerts"


def request(base_url: str, api_key: str, path: str, method: str = "GET", body: dict | None = None) -> dict:
    url = base_url.rstrip("/") + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("SIGNOZ-API-KEY", api_key)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            payload = resp.read().decode() or "{}"
            return json.loads(payload)
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        raise SystemExit(f"{method} {path} failed with HTTP {e.code}: {detail}") from e
    except urllib.error.URLError as e:
        raise SystemExit(f"{method} {url} unreachable: {e.reason}") from e


def existing_rules(base_url: str, api_key: str) -> dict[str, str]:
    """Return {alert name: rule id} for rules already present in SigNoz."""
    payload = request(base_url, api_key, "/api/v1/rules")
    data = payload.get("data", payload)
    rules = data.get("rules", data) if isinstance(data, dict) else data
    result: dict[str, str] = {}
    for rule in rules or []:
        name = rule.get("alert") or rule.get("data", {}).get("alert")
        rule_id = str(rule.get("id"))
        if name and rule_id:
            result[name] = rule_id
    return result


def apply_rules(base_url: str, api_key: str, dry_run: bool) -> None:
    files = sorted(ALERTS_DIR.glob("*.json"))
    if not files:
        raise SystemExit(f"no rule files found in {ALERTS_DIR}")
    current = existing_rules(base_url, api_key)
    for f in files:
        rule = json.loads(f.read_text())
        name = rule["alert"]
        if name in current:
            action, method, path = "update", "PUT", f"/api/v1/rules/{current[name]}"
        else:
            action, method, path = "create", "POST", "/api/v1/rules"
        if dry_run:
            print(f"[dry-run] would {action} '{name}' ({f.name})")
            continue
        request(base_url, api_key, path, method, rule)
        print(f"{action}d '{name}' ({f.name})")


def set_retention(base_url: str, api_key: str, settings: list[str], dry_run: bool) -> None:
    for setting in settings:
        signal, _, duration = setting.partition("=")
        if signal not in ("traces", "logs", "metrics") or not duration.endswith("h"):
            raise SystemExit(f"invalid retention setting '{setting}' (expected e.g. traces=360h)")
        query = urllib.parse.urlencode({"type": signal, "duration": duration})
        if dry_run:
            print(f"[dry-run] would set {signal} retention to {duration}")
            continue
        request(base_url, api_key, f"/api/v1/settings/ttl?{query}", "POST")
        print(f"set {signal} retention to {duration}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--url", default=os.environ.get("SIGNOZ_URL", "https://signoz.kdvmanager.nl"))
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--retention", nargs="+", metavar="SIGNAL=DURATION",
                        help="only set retention TTLs (e.g. traces=360h logs=360h metrics=720h)")
    args = parser.parse_args()

    api_key = os.environ.get("SIGNOZ_API_KEY")
    if not api_key:
        raise SystemExit("SIGNOZ_API_KEY environment variable is required")

    if args.retention:
        set_retention(args.url, api_key, args.retention, args.dry_run)
    else:
        apply_rules(args.url, api_key, args.dry_run)


if __name__ == "__main__":
    main()
