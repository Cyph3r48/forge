#!/usr/bin/env python3
"""Factory doctor — deterministic audit of the Software Factory repo.

Five checks: protected files, skill frontmatter, INDEX consistency,
role charters, task board. Exit 1 on any FAIL.
"""
import argparse
import sys
from pathlib import Path

PROTECTED = ["FACTORY-LAW.md", "AGENTS.md", "README.md"]
ROLES = ["foreman.md", "builder.md", "tester.md", "reviewer.md"]


def check_protected(repo):
    missing = [f for f in PROTECTED if not (repo / f).is_file() or (repo / f).stat().st_size == 0]
    if missing:
        return False, "missing or empty: " + ", ".join(missing)
    return True, f"all {len(PROTECTED)} present and non-empty"


def check_skills(repo):
    skills_dir = repo / "skills"
    if not skills_dir.is_dir():
        return False, "skills/ does not exist"
    folders = sorted(d for d in skills_dir.iterdir() if d.is_dir())
    bad = []
    for d in folders:
        f = d / "SKILL.md"
        if not f.is_file():
            bad.append(f"{d.name}: no SKILL.md")
            continue
        lines = f.read_text(encoding="utf-8", errors="replace").splitlines()
        fm = []
        if lines and lines[0].strip() == "---":
            for line in lines[1:]:
                if line.strip() == "---":
                    break
                fm.append(line)
        if not any(l.startswith("name:") for l in fm) or not any(l.startswith("description:") for l in fm):
            bad.append(f"{d.name}: bad frontmatter")
    if bad:
        return False, "; ".join(bad)
    return True, f"{len(folders)} skill folders checked, all frontmatter valid"


def check_index(repo):
    index = repo / "skills" / "INDEX.md"
    if not index.is_file():
        return False, "skills/INDEX.md missing"
    lines = index.read_text(encoding="utf-8").splitlines()
    rows = [l for l in lines if l.strip().startswith("|")]
    data = [r for r in rows if not set(r.strip()) <= {"|", "-", ":", " "}]
    table_rows = len(data) - 1  # drop the header row
    folders = len([d for d in (repo / "skills").iterdir() if d.is_dir()])
    if table_rows != folders:
        return False, f"{table_rows} table rows != {folders} skill folders"
    return True, f"{table_rows} table rows == {folders} skill folders"


def check_roles(repo):
    roles_dir = repo / "factory" / "roles"
    bad = []
    for r in ROLES:
        f = roles_dir / r
        if not f.is_file() or f.stat().st_size == 0:
            bad.append(f"{r}: missing or empty")
            continue
        n = len(f.read_text(encoding="utf-8").splitlines())
        if n >= 50:
            bad.append(f"{r}: {n} lines (limit 49)")
    if bad:
        return False, "; ".join(bad)
    return True, f"all {len(ROLES)} charters present, non-empty, under 50 lines"


def check_board(repo):
    # The working task board is a private file (gitignored); skip when absent.
    f = repo / "TASKS.md"
    if not f.is_file():
        return True, "no working board present (private file, optional)"
    heads = [l for l in f.read_text(encoding="utf-8").splitlines() if l.lstrip().startswith("#")]
    missing = [w for w in ("Wave 1", "Wave 2") if not any(w in h for h in heads)]
    if missing:
        return False, "board missing headings: " + ", ".join(missing)
    return True, "working board headings present"


CHECKS = [
    ("protected", check_protected),
    ("skills", check_skills),
    ("index", check_index),
    ("roles", check_roles),
    ("board", check_board),
]


def main():
    parser = argparse.ArgumentParser(description="Software Factory repo doctor")
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parent.parent)
    args = parser.parse_args()
    passed = 0
    failed = 0
    for name, fn in CHECKS:
        ok, detail = fn(args.repo)
        print(f"{'PASS' if ok else 'FAIL'} {name} - {detail}")
        if ok:
            passed += 1
        else:
            failed += 1
    print(f"SUMMARY: {passed} passed, {failed} failed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()