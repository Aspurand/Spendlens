"""
One-shot migration: replace inline USD-formatting patterns in index.html with
calls to the new fmtMoney() helper so display currency toggling works.

Patterns handled (only inside `$${...}` template-literal interpolations, so
CSS selectors and other `$` uses are safe):

  $${X.toFixed(2)}                     -> ${fmtMoney(X)}
  $${X.toFixed(0)}                     -> ${fmtMoney(X, {decimals: 0})}
  $${X.toFixed(N)}                     -> ${fmtMoney(X, {decimals: N})}
  $${X.toLocaleString(...minFrac:2..maxFrac:2..)} -> ${fmtMoney(X)}
  $${X.toLocaleString(...minFrac:0..)} -> ${fmtMoney(X, {decimals: 0})}
  $${X.toLocaleString(...maxFrac:0..)} -> ${fmtMoney(X, {decimals: 0})}
  $${X.toLocaleString()}               -> ${fmtMoney(X, {decimals: 0})}

Run:
  python scripts/fmt_money_migrate.py
"""
from __future__ import annotations
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "index.html"
text = TARGET.read_text(encoding="utf-8")

original_len = len(text)
report: dict[str, int] = {}


def sub(pattern: str, repl, label: str, *, flags: int = 0) -> None:
    global text
    rx = re.compile(pattern, flags)
    new_text, n = rx.subn(repl, text)
    if n:
        report[label] = n
    text = new_text


# Inside .toLocaleString options object, find decimal hints. We treat
# minimumFractionDigits as the source of truth; falling back to
# maximumFractionDigits for the integer-display patterns.
def _decimals_from_locale_args(args: str) -> int:
    m_min = re.search(r"minimumFractionDigits\s*:\s*(\d+)", args)
    m_max = re.search(r"maximumFractionDigits\s*:\s*(\d+)", args)
    if m_min:
        return int(m_min.group(1))
    if m_max:
        return int(m_max.group(1))
    return 0  # bare .toLocaleString() — no fractional digits by default


def _replace_locale(match: re.Match) -> str:
    expr = match.group(1)
    args = match.group(2) or ""
    d = _decimals_from_locale_args(args)
    if d == 2:
        return "${fmtMoney(" + expr + ")}"
    return "${fmtMoney(" + expr + ", {decimals: " + str(d) + "})}"


def _replace_fixed(match: re.Match) -> str:
    expr = match.group(1)
    d = int(match.group(2))
    if d == 2:
        return "${fmtMoney(" + expr + ")}"
    return "${fmtMoney(" + expr + ", {decimals: " + str(d) + "})}"


# Inner expression of the template literal: anything except `{` or `}`. This
# rules out nested template literals (none in this codebase for money) but
# allows function calls, optional chaining, ternaries with parens, etc.
EXPR = r"([^{}]+?)"

# Concatenation-style expression: a balanced run of word/dot/bracket/paren
# tokens used in `'$' + EXPR.toFixed(2)` etc. Stops before `+`, `?`, `:`,
# whitespace boundaries, or quote chars so we don't slurp adjacent tokens.
CONCAT_EXPR = r"((?:\w|\.|\[|\]|\(|\)|\?|\!)+)"

# 1) .toFixed(N)
sub(
    r"\$\$\{" + EXPR + r"\.toFixed\((\d+)\)\}",
    _replace_fixed,
    ".toFixed(N)",
)

# 2) .toLocaleString('en-US', { ... }) — options object; we read decimals out
sub(
    r"\$\$\{" + EXPR + r"\.toLocaleString\(\s*'en-US'\s*,\s*\{([^{}]*)\}\s*\)\}",
    _replace_locale,
    ".toLocaleString('en-US', {...})",
)

# 3) Bare .toLocaleString() — no args
sub(
    r"\$\$\{" + EXPR + r"\.toLocaleString\(\s*\)\}",
    lambda m: "${fmtMoney(" + m.group(1) + ", {decimals: 0})}",
    ".toLocaleString()",
)

# 4) `'$' + X.toFixed(N)` outside template literals
def _replace_concat_fixed(match: re.Match) -> str:
    expr = match.group(1)
    d = int(match.group(2))
    if d == 2:
        return "fmtMoney(" + expr + ")"
    return "fmtMoney(" + expr + ", {decimals: " + str(d) + "})"

sub(
    r"'\$'\s*\+\s*" + CONCAT_EXPR + r"\.toFixed\((\d+)\)",
    _replace_concat_fixed,
    "'$' + X.toFixed(N)",
)

# 5) `'$' + X.toLocaleString('en-US', {...})`
def _replace_concat_locale(match: re.Match) -> str:
    expr = match.group(1)
    args = match.group(2) or ""
    d = _decimals_from_locale_args(args)
    if d == 2:
        return "fmtMoney(" + expr + ")"
    return "fmtMoney(" + expr + ", {decimals: " + str(d) + "})"

sub(
    r"'\$'\s*\+\s*" + CONCAT_EXPR + r"\.toLocaleString\(\s*'en-US'\s*,\s*\{([^{}]*)\}\s*\)",
    _replace_concat_locale,
    "'$' + X.toLocaleString('en-US', {...})",
)

# 6) `'$' + X.toLocaleString()` — bare, no args. Default to 0 decimals.
sub(
    r"'\$'\s*\+\s*" + CONCAT_EXPR + r"\.toLocaleString\(\s*\)",
    lambda m: "fmtMoney(" + m.group(1) + ", {decimals: 0})",
    "'$' + X.toLocaleString()",
)

# 7) Hyphenated negative: `'-$' + X.toFixed(N)` → fmtMoney(-X, {decimals: N})
def _replace_neg_concat_fixed(match: re.Match) -> str:
    expr = match.group(1)
    d = int(match.group(2))
    if d == 2:
        return "fmtMoney(-(" + expr + "))"
    return "fmtMoney(-(" + expr + "), {decimals: " + str(d) + "})"

sub(
    r"'\-\$'\s*\+\s*" + CONCAT_EXPR + r"\.toFixed\((\d+)\)",
    _replace_neg_concat_fixed,
    "'-$' + X.toFixed(N)",
)

# 8) Plain `'$' + X` (bare expression, no method call). Catches chart tick
# callbacks like `v => '$' + v`. Limited to identifiers / dotted lookups
# WITHOUT trailing parens — otherwise we'd grab the leading function
# reference of a chained call like `'$' + Math.abs(x).toLocaleString()`
# and split the rest of the expression off. The negative-lookahead `(?!\()`
# enforces "no following call" so multi-token expressions stay intact and
# get caught by the .toLocaleString patterns above.
sub(
    r"'\$'\s*\+\s*([A-Za-z_$][\w.\[\]]*)(?!\()",
    lambda m: "fmtMoney(" + m.group(1) + ", {decimals: 0})",
    "'$' + X (bare)",
)

# 9) Hardcoded zero placeholders like `'$0.00'` and `'$0'` so they also
# render in the active currency. Match the exact strings to avoid touching
# things like `'$0.00 fee'` (none in the codebase, but be safe).
sub(
    r"'\$0\.00'",
    "fmtMoney(0)",
    "'$0.00'",
)
sub(
    r"'\$0'",
    "fmtMoney(0, {decimals: 0})",
    "'$0'",
)

# Sanity: how many `$${` patterns remain? Anything left is irregular and
# needs a hand-edit. We surface it so the human can decide.
remaining = re.findall(r"\$\$\{[^}]+\}", text)

if text != TARGET.read_text(encoding="utf-8"):
    TARGET.write_text(text, encoding="utf-8")

print("Replacements:")
for k, v in report.items():
    print(f"  {k:<40} {v}")
print(f"\nFile size: {original_len} -> {len(text)} bytes")
print(f"Remaining `$${{...}}` template-literal sites: {len(remaining)}")
if remaining:
    print("Examples (first 12):")
    for site in remaining[:12]:
        print(f"  {site}")
