"""bpmn-validate: report common problems in BPMN 2.0 files."""

import argparse
import json
import sys
from pathlib import Path

from .validate import CHECKS, validate

EPILOG = """checks (code, severity, meaning):
{checks}

output:
  one line per issue, then one summary line per file:
    path:line:column: severity code: message
    path: 1 error, 2 warnings
  --json prints one document instead:
    {{"files": [{{"path", "errors", "warnings",
                 "issues": [{{"severity", "code", "message", "line", "column", "element"}}]}}]}}

exit codes:
  0  no file has an error (warnings allowed)
  1  at least one file has an error
  2  a file cannot be read, or the arguments are wrong (message on stderr)

examples:
  bpmn-validate diagram.bpmn
  bpmn-validate --json processes/*.bpmn
  bpmn-validate order.bpmn || echo "fix the errors before opening the file"
"""


def _parser():
    width = max(len(code) for code in CHECKS)
    checks = "\n".join(
        f"  {code:<{width}}  {severity:<7}  {meaning}"
        for code, (severity, meaning) in CHECKS.items()
    )
    parser = argparse.ArgumentParser(
        prog="bpmn-validate",
        description=(
            "Check BPMN 2.0 files for malformed XML, broken references, elements the "
            "modeller cannot show and common modelling mistakes. Reads the files only; "
            "never changes them."
        ),
        epilog=EPILOG.format(checks=checks),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("files", nargs="+", metavar="FILE", help="BPMN files to check")
    parser.add_argument(
        "--json", action="store_true", help="print one JSON document instead of text lines"
    )
    return parser


def _plural(count, word):
    return f"{count} {word}" + ("" if count == 1 else "s")


def main(argv=None):
    args = _parser().parse_args(argv)
    status = 0
    report = []
    for path in args.files:
        try:
            data = Path(path).read_bytes()
        except OSError as exc:
            print(f"bpmn-validate: cannot read {path}: {exc.strerror}", file=sys.stderr)
            status = 2
            continue
        issues = validate(data)
        errors = sum(issue.severity == "error" for issue in issues)
        if errors and status == 0:
            status = 1
        report.append((path, issues, errors, len(issues) - errors))

    if args.json:
        files = [
            {
                "path": path,
                "errors": errors,
                "warnings": warnings,
                "issues": [vars(issue) for issue in issues],
            }
            for path, issues, errors, warnings in report
        ]
        print(json.dumps({"files": files}, indent=2))
    else:
        for path, issues, errors, warnings in report:
            for issue in issues:
                print(f"{path}:{issue.line}:{issue.column}: {issue.severity} {issue.code}: {issue.message}")
            print(f"{path}: {_plural(errors, 'error')}, {_plural(warnings, 'warning')}")
    return status


if __name__ == "__main__":
    sys.exit(main())
