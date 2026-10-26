"""Read-only, bounded indexing helpers for the DIS AI Dev workspace.

Only small, allow-listed text/code files inside this repository are examined.
No file contents are persisted or sent to a model/provider.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MAX_FILES = 1500
MAX_FILE_BYTES = 256 * 1024
MAX_QUERY_LENGTH = 100
MAX_RESULTS = 30
MAX_SNIPPET_LENGTH = 240
SAMPLE_PATHS = 15

IGNORED_DIRECTORIES = {
    ".git",
    ".next",
    ".venv",
    "__pycache__",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
    "release",
    "venv",
}
ALLOWED_HIDDEN_DIRECTORIES = {".github"}
ALLOWED_SPECIAL_FILES = {".gitignore", ".dockerignore", ".prettierrc", ".prettierrc.yaml"}
IGNORED_FILE_NAMES = {
    ".env",
    ".npmrc",
    "credentials.json",
    "id_rsa",
    "id_ed25519",
    "secrets.json",
}
IGNORED_SUFFIXES = {".pem", ".p12", ".pfx", ".key", ".sqlite", ".db"}
TEXT_EXTENSIONS = {
    ".bat",
    ".c",
    ".cfg",
    ".cpp",
    ".cs",
    ".css",
    ".go",
    ".h",
    ".html",
    ".htm",
    ".ini",
    ".java",
    ".js",
    ".jsx",
    ".json",
    ".md",
    ".mjs",
    ".ps1",
    ".py",
    ".rs",
    ".sh",
    ".sql",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
}


def _inside_root(path: Path, root: Path) -> bool:
    """Return True only when a resolved candidate remains under the workspace root."""
    try:
        path.resolve(strict=True).relative_to(root.resolve(strict=True))
    except (OSError, RuntimeError, ValueError):
        return False
    return True


def _is_ignored_relative(relative: Path) -> bool:
    """Reject secret-like names and generated/private directories."""
    if any(part.lower() in IGNORED_DIRECTORIES for part in relative.parts[:-1]):
        return True
    if any(
        part.startswith(".") and part.lower() not in ALLOWED_HIDDEN_DIRECTORIES
        for part in relative.parts[:-1]
    ):
        return True

    name = relative.name.lower()
    if name in IGNORED_FILE_NAMES or name.startswith(".env."):
        return True
    if relative.suffix.lower() in IGNORED_SUFFIXES:
        return True
    if any(word in name for word in ("secret", "credential", "private-key")):
        return True

    if name in ALLOWED_SPECIAL_FILES:
        return False
    return relative.suffix.lower() not in TEXT_EXTENSIONS


def list_workspace_files(root: Path = PROJECT_ROOT) -> tuple[list[Path], bool]:
    """Return bounded, safe text files from a fixed project root, never following symlinks."""
    try:
        resolved_root = root.resolve(strict=True)
    except (OSError, RuntimeError):
        return [], False
    if not resolved_root.is_dir():
        return [], False

    files: list[Path] = []
    truncated = False

    for current, directory_names, file_names in os.walk(
        resolved_root, topdown=True, followlinks=False
    ):
        current_path = Path(current)
        kept_directories: list[str] = []
        for directory in sorted(directory_names):
            child = current_path / directory
            if child.is_symlink():
                continue
            if directory.lower() in IGNORED_DIRECTORIES:
                continue
            if directory.startswith(".") and directory.lower() not in ALLOWED_HIDDEN_DIRECTORIES:
                continue
            if not _inside_root(child, resolved_root):
                continue
            kept_directories.append(directory)
        directory_names[:] = kept_directories

        for file_name in sorted(file_names):
            candidate = current_path / file_name
            if candidate.is_symlink():
                continue
            try:
                relative = candidate.relative_to(resolved_root)
                if _is_ignored_relative(relative) or not _inside_root(candidate, resolved_root):
                    continue
                if not candidate.is_file() or candidate.stat().st_size > MAX_FILE_BYTES:
                    continue
            except (OSError, RuntimeError, ValueError):
                continue

            if len(files) >= MAX_FILES:
                truncated = True
                break
            files.append(candidate)

        if truncated:
            break

    files.sort(key=lambda file_path: file_path.relative_to(resolved_root).as_posix().lower())
    return files, truncated


def summarize_workspace(root: Path = PROJECT_ROOT) -> dict[str, Any]:
    """Return counts and relative sample paths without exposing the absolute local path."""
    resolved_root = root.resolve()
    files, truncated = list_workspace_files(resolved_root)
    extension_counts: dict[str, int] = {}
    for file_path in files:
        extension = file_path.suffix.lower() or "(no extension)"
        extension_counts[extension] = extension_counts.get(extension, 0) + 1

    sample_paths = [
        file_path.relative_to(resolved_root).as_posix()
        for file_path in files[:SAMPLE_PATHS]
    ]
    return {
        "ok": True,
        "workspace_name": resolved_root.name,
        "files_scanned": len(files),
        "extensions": dict(sorted(extension_counts.items())),
        "sample_paths": sample_paths,
        "truncated": truncated,
        "persistent_index": False,
        "read_only": True,
    }


def search_workspace(query: str, root: Path = PROJECT_ROOT) -> dict[str, Any]:
    """Search literal, case-insensitive text in eligible files and return bounded snippets."""
    normalized_query = query.strip()
    if len(normalized_query) < 2:
        raise ValueError("Search query must contain at least 2 characters.")
    if len(normalized_query) > MAX_QUERY_LENGTH:
        raise ValueError(f"Search query must be {MAX_QUERY_LENGTH} characters or fewer.")

    resolved_root = root.resolve()
    files, scan_truncated = list_workspace_files(resolved_root)
    needle = normalized_query.casefold()
    results: list[dict[str, Any]] = []
    match_count = 0

    for file_path in files:
        try:
            with file_path.open("r", encoding="utf-8", errors="replace") as source:
                for line_number, line in enumerate(source, start=1):
                    if needle not in line.casefold():
                        continue
                    match_count += 1
                    snippet = " ".join(line.strip().split())
                    if len(snippet) > MAX_SNIPPET_LENGTH:
                        snippet = snippet[: MAX_SNIPPET_LENGTH - 1] + "…"
                    if len(results) < MAX_RESULTS:
                        results.append(
                            {
                                "path": file_path.relative_to(resolved_root).as_posix(),
                                "line": line_number,
                                "snippet": snippet,
                            }
                        )
        except (OSError, UnicodeError):
            continue

    return {
        "ok": True,
        "query": normalized_query,
        "files_scanned": len(files),
        "match_count": match_count,
        "results": results,
        "truncated": scan_truncated or match_count > MAX_RESULTS,
        "persistent_index": False,
        "read_only": True,
    }
