#!/usr/bin/env python3
"""Focused CLI checks for local per-seat skill bundles."""

import hashlib
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path


SCRIPT = Path(__file__).with_name("skill_bundles.py")
REPO = SCRIPT.resolve().parents[1]
SEATS = ("Foreman", "Builder", "Tester", "Reviewer")


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def write_manifest(source, mutate=None):
    files = {
        "skills/sample/SKILL.md": b"sample skill\n",
        "skills/sample/LICENSE": b"sample license\n",
        "FACTORY-LAW.md": b"law\n",
    }
    for seat in SEATS:
        files[f"factory/roles/{seat.lower()}.md"] = f"{seat} role\n".encode()
    for path, content in files.items():
        target = source / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
    (source / "skills/sample/SKILL.md").chmod(0o755)
    manifest = {
        "schemaVersion": 1,
        "sourceCommit": "a" * 40,
        "skills": {
            "sample": {
                "files": {
                    path: hashlib.sha256(content).hexdigest()
                    for path, content in files.items()
                    if path.startswith("skills/sample/")
                }
            }
        },
        "seats": {
            seat: {
                "skills": ["sample"],
                "missingRequired": [],
                "governingFiles": {
                    "FACTORY-LAW.md": hashlib.sha256(files["FACTORY-LAW.md"]).hexdigest(),
                    f"factory/roles/{seat.lower()}.md": hashlib.sha256(
                        files[f"factory/roles/{seat.lower()}.md"]
                    ).hexdigest(),
                },
            }
            for seat in SEATS
        },
    }
    if mutate:
        mutate(manifest)
    path = source / "factory/skill-manifest.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(manifest, indent=2) + "\n")
    return files


def run(action, source, output, include_source=True):
    command = [sys.executable, str(SCRIPT), action]
    if include_source:
        command.extend(("--source", str(source)))
    command.extend(("--output", str(output)))
    return subprocess.run(command, text=True, capture_output=True)


def snapshot(root):
    return {
        path.relative_to(root).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in root.rglob("*")
        if path.is_file()
    }


def expect_build_failure(source, output, contains=None):
    result = run("build", source, output)
    check(result.returncode != 0, f"build unexpectedly passed: {source}")
    check(not output.exists(), f"failed build created output: {output}")
    if contains:
        check(contains in result.stderr, f"expected {contains!r}: {result.stderr}")


def test_current_manifest(tmp):
    output = tmp / "current-manifest"
    result = run("build", REPO, output, include_source=False)
    check(result.returncode == 0, result.stderr)
    check("4 seat bundles" in result.stdout, result.stdout)
    verified = run("verify", REPO, output, include_source=False)
    check(verified.returncode == 0, verified.stderr)
    print("PASS: current manifest builds and verifies all four seats")


def test_complete_and_verify(tmp):
    source = tmp / "fixture"
    write_manifest(source)
    first, second = tmp / "bundle-one", tmp / "bundle-two"
    for output in (first, second):
        result = run("build", source, output)
        check(result.returncode == 0, result.stderr)
        verified = run("verify", source, output)
        check(verified.returncode == 0, verified.stderr)
    check(snapshot(first) == snapshot(second), "repeated builds differ")
    expected_path = "Foreman/skills/sample/SKILL.md"
    check(expected_path in snapshot(first), "manifest path not preserved under seat")
    check((first / expected_path).stat().st_mode & 0o111 == 0o111, "execute bits were lost")
    linked = tmp / "bundle-link"
    linked.symlink_to(first, target_is_directory=True)
    check(run("verify", source, linked).returncode != 0, "verify accepted an output symlink")
    linked.unlink()
    print("PASS: complete fixture builds deterministically and verifies")

    sample = first / expected_path
    original = sample.read_bytes()
    sample.write_bytes(b"tampered\n")
    check(run("verify", source, first).returncode != 0, "tampered file passed")
    sample.write_bytes(original)
    sample.unlink()
    check(run("verify", source, first).returncode != 0, "missing file passed")
    sample.write_bytes(original)
    sample.chmod(0o644)
    check(run("verify", source, first).returncode != 0, "lost execute bits passed")
    sample.chmod(0o755)
    (first / "Foreman/extra.txt").write_text("extra\n")
    check(run("verify", source, first).returncode != 0, "extra file passed")
    (first / "Foreman/extra.txt").unlink()
    print("PASS: verify rejects tampered, missing, and extra files")


def test_invalid_sources(tmp):
    valid = tmp / "valid"
    write_manifest(valid)
    missing = tmp / "missing-required"
    write_manifest(missing, lambda m: m["seats"]["Foreman"].__setitem__(
        "missingRequired", [{"name": "ponytail", "expectedPath": "skills/ponytail/SKILL.md"}]
    ))
    expect_build_failure(missing, tmp / "out-missing-required", "missing required skill ponytail")

    bad_hash = tmp / "bad-hash"
    write_manifest(bad_hash, lambda m: m["skills"]["sample"]["files"].__setitem__(
        "skills/sample/SKILL.md", "0" * 64
    ))
    expect_build_failure(bad_hash, tmp / "out-bad-hash", "hash mismatch")

    traversal = tmp / "traversal"
    write_manifest(traversal, lambda m: m["seats"]["Foreman"]["governingFiles"].__setitem__(
        "../outside", "0" * 64
    ))
    expect_build_failure(traversal, tmp / "out-traversal", "unsafe relative path")

    malformed = tmp / "malformed"
    write_manifest(malformed, lambda m: m["seats"]["Builder"].__setitem__("skills", "sample"))
    expect_build_failure(malformed, tmp / "out-malformed", "skills must be a list")

    escaped = tmp / "escaped"
    write_manifest(escaped)
    external = tmp / "outside-skill"
    external.write_text("outside\n")
    source_skill = escaped / "skills/sample/SKILL.md"
    source_skill.unlink()
    source_skill.symlink_to(external)
    expect_build_failure(escaped, tmp / "out-escaped", "escapes root")

    linked_output = tmp / "linked-output"
    linked_output.symlink_to(tmp / "not-created")
    linked = run("build", valid, linked_output)
    check(
        linked.returncode != 0
        and "output already exists" in linked.stderr
        and not (tmp / "not-created").exists(),
        f"output symlink guard failed: {linked.stderr}",
    )
    linked_output.unlink()
    print("PASS: build rejects bad hashes, traversal, malformed mappings, and symlink escape")


def main():
    with tempfile.TemporaryDirectory(prefix="skill-bundles-") as directory:
        tmp = Path(directory)
        test_current_manifest(tmp)
        test_complete_and_verify(tmp)
        test_invalid_sources(tmp)
    print("PASS: all skill bundle checks")


if __name__ == "__main__":
    main()
