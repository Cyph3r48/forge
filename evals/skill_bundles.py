#!/usr/bin/env python3
"""Build and verify local per-seat skill bundles."""

import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path, PurePosixPath, PureWindowsPath


MANIFEST = "factory/skill-manifest.json"
SEAT_NAME = re.compile(r"[A-Za-z0-9][A-Za-z0-9_-]*\Z")
SHA256 = re.compile(r"[0-9a-f]{64}\Z")


def relative_parts(value):
    if not isinstance(value, str) or not value or "\\" in value or "\0" in value:
        raise ValueError(f"invalid relative path: {value!r}")
    posix = PurePosixPath(value)
    windows = PureWindowsPath(value)
    parts = value.split("/")
    if posix.is_absolute() or windows.is_absolute() or windows.drive or any(
        part in ("", ".", "..") for part in parts
    ) or posix.as_posix() != value:
        raise ValueError(f"unsafe relative path: {value!r}")
    return tuple(parts)


def source_bytes(root, relative):
    candidate = root.joinpath(*relative_parts(relative))
    try:
        resolved = candidate.resolve(strict=True)
    except (OSError, RuntimeError) as exc:
        raise ValueError(f"source file unavailable: {relative}: {exc}") from exc
    try:
        resolved.relative_to(root)
    except ValueError as exc:
        raise ValueError(f"source path escapes root: {relative}") from exc
    if not resolved.is_file():
        raise ValueError(f"source path is not a file: {relative}")
    return resolved.read_bytes()


def prepare(source):
    root = Path(source).resolve(strict=True)
    if not root.is_dir():
        raise ValueError(f"source is not a directory: {root}")
    raw = source_bytes(root, MANIFEST)
    try:
        manifest = json.loads(raw)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError(f"invalid manifest JSON: {exc}") from exc
    if not isinstance(manifest, dict) or type(manifest.get("schemaVersion")) is not int or manifest["schemaVersion"] != 1:
        raise ValueError("manifest must be an object with schemaVersion 1")
    if not isinstance(manifest.get("sourceCommit"), str) or not re.fullmatch(
        r"[0-9a-f]{40}", manifest["sourceCommit"]
    ):
        raise ValueError("manifest sourceCommit must be a 40-character commit SHA")
    skills = manifest.get("skills")
    seats = manifest.get("seats")
    if not isinstance(skills, dict) or not skills or not isinstance(seats, dict) or not seats:
        raise ValueError("manifest skills and seats must be non-empty objects")

    cache = {}
    bundles = {}

    def add_files(target, files):
        if not isinstance(files, dict) or not files:
            raise ValueError("file mappings must be non-empty objects")
        for path, expected in files.items():
            relative_parts(path)
            if not isinstance(expected, str) or not SHA256.fullmatch(expected):
                raise ValueError(f"invalid SHA-256 for {path!r}")
            if path not in cache:
                cache[path] = source_bytes(root, path)
            actual = hashlib.sha256(cache[path]).hexdigest()
            if actual != expected:
                raise ValueError(f"source hash mismatch: {path}")
            if path in target and target[path] != expected:
                raise ValueError(f"conflicting hashes for {path}")
            target[path] = expected

    for name, skill in skills.items():
        if not isinstance(name, str) or not name or not isinstance(skill, dict):
            raise ValueError(f"malformed skill mapping: {name!r}")
        add_files({}, skill.get("files"))

    for seat, assignment in seats.items():
        if not isinstance(seat, str) or not SEAT_NAME.fullmatch(seat):
            raise ValueError(f"invalid seat name: {seat!r}")
        if not isinstance(assignment, dict):
            raise ValueError(f"seat mapping must be an object: {seat}")
        names = assignment.get("skills")
        if not isinstance(names, list) or any(not isinstance(name, str) for name in names):
            raise ValueError(f"seat skills must be a list of names: {seat}")
        if len(names) != len(set(names)):
            raise ValueError(f"duplicate skill assignment: {seat}")
        missing = assignment.get("missingRequired")
        if not isinstance(missing, list):
            raise ValueError(f"missingRequired must be a list: {seat}")
        if missing:
            item = missing[0]
            if not isinstance(item, dict) or not isinstance(item.get("name"), str):
                raise ValueError(f"malformed missingRequired entry: {seat}")
            raise ValueError(
                f"{seat} is missing required skill {item['name']} "
                f"({item.get('expectedPath', 'path unknown')})"
            )
        target = {}
        for name in names:
            skill = skills.get(name)
            if not isinstance(skill, dict):
                raise ValueError(f"unknown or malformed skill {name!r} for {seat}")
            add_files(target, skill.get("files"))
        governing = assignment.get("governingFiles")
        add_files(target, governing)
        paths = set(target)
        for path in paths:
            parts = relative_parts(path)
            if any(PurePosixPath(*parts[:i]).as_posix() in paths for i in range(1, len(parts))):
                raise ValueError(f"file path conflicts with a parent file: {path}")
        bundles[seat] = target
    return root, bundles, cache


def output_path(value):
    path = Path(value).expanduser()
    if path.exists() or path.is_symlink():
        raise ValueError(f"output already exists: {path}")
    return path.resolve()


def build(source, output):
    root, bundles, cache = prepare(source)
    destination = output_path(output)
    destination.mkdir(parents=True, exist_ok=False)
    try:
        for seat, files in bundles.items():
            for relative in files:
                target = destination / seat / Path(*relative_parts(relative))
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(cache[relative])
    except OSError:
        import shutil

        shutil.rmtree(destination, ignore_errors=True)
        raise
    count = sum(len(files) for files in bundles.values())
    print(f"built {len(bundles)} seat bundles ({count} files) at {destination}")


def verify(source, output):
    _, bundles, _ = prepare(source)
    root = Path(output).expanduser()
    if root.is_symlink():
        raise ValueError(f"output is a symlink: {root}")
    root = root.resolve(strict=True)
    if not root.is_dir():
        raise ValueError(f"output is not a directory: {root}")
    seats = set(bundles)
    entries = list(root.iterdir())
    if any(entry.is_symlink() or not entry.is_dir() for entry in entries):
        raise ValueError("output contains a non-directory or symlink at its root")
    if {entry.name for entry in entries} != seats:
        raise ValueError("output seat directories do not match the manifest")

    count = 0
    for seat, files in bundles.items():
        seat_root = root / seat
        expected_dirs = set()
        for relative in files:
            parts = relative_parts(relative)
            expected_dirs.update(PurePosixPath(*parts[:i]).as_posix() for i in range(1, len(parts)))
        actual_files = set()
        actual_dirs = set()
        for current, directories, names in os.walk(seat_root, followlinks=False):
            current_path = Path(current)
            for name in directories:
                path = current_path / name
                if path.is_symlink():
                    raise ValueError(f"installed tree contains a symlink: {path}")
                actual_dirs.add(path.relative_to(seat_root).as_posix())
            for name in names:
                path = current_path / name
                if path.is_symlink() or not path.is_file():
                    raise ValueError(f"installed path is not a regular file: {path}")
                actual_files.add(path.relative_to(seat_root).as_posix())
        if actual_files != set(files) or actual_dirs != expected_dirs:
            raise ValueError(f"installed file set does not match manifest for {seat}")
        for relative, expected in files.items():
            path = seat_root / Path(*relative_parts(relative))
            actual = hashlib.sha256(path.read_bytes()).hexdigest()
            if actual != expected:
                raise ValueError(f"installed hash mismatch: {seat}/{relative}")
            count += 1
    print(f"verified {len(bundles)} seat bundles ({count} files) at {root}")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("build", "verify"))
    parser.add_argument("--source", default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", required=True)
    args = parser.parse_args(argv)
    try:
        if args.action == "build":
            build(args.source, args.output)
        else:
            verify(args.source, args.output)
    except (OSError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
