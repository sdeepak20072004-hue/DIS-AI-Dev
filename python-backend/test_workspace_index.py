"""Security and behavior tests for scoped, read-only workspace search."""
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from workspace_index import list_workspace_files, search_workspace, summarize_workspace


class WorkspaceIndexTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / "src").mkdir()
        (self.root / "src" / "app.ts").write_text(
            "export const greeting = 'Hello Workspace'\n"
            "export const status = 'ready'\n",
            encoding="utf-8",
        )
        (self.root / "README.md").write_text(
            "# Sample project\nWorkspace search documentation\n", encoding="utf-8"
        )
        (self.root / ".env").write_text("PRIVATE_API_KEY=do-not-index\n", encoding="utf-8")
        (self.root / "credentials.json").write_text(
            '{"password": "do-not-index"}', encoding="utf-8"
        )
        (self.root / "node_modules").mkdir()
        (self.root / "node_modules" / "dependency.js").write_text(
            "const hiddenDependency = true\n", encoding="utf-8"
        )
        (self.root / "__pycache__").mkdir()
        (self.root / "__pycache__" / "compiled.pyc").write_bytes(b"\x00\x01")

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_summary_only_returns_relative_paths_and_bounded_metadata(self) -> None:
        summary = summarize_workspace(self.root)
        self.assertTrue(summary["ok"])
        self.assertEqual(summary["workspace_name"], self.root.name)
        self.assertTrue(summary["read_only"])
        self.assertFalse(summary["persistent_index"])
        self.assertNotIn(str(self.root), str(summary))
        self.assertNotIn(".env", summary["sample_paths"])
        self.assertGreaterEqual(summary["files_scanned"], 2)

    def test_search_is_literal_case_insensitive_and_returns_line_numbers(self) -> None:
        result = search_workspace("HELLO workspace", self.root)
        self.assertTrue(result["ok"])
        self.assertEqual(result["match_count"], 1)
        self.assertEqual(result["results"][0]["path"], "src/app.ts")
        self.assertEqual(result["results"][0]["line"], 1)
        self.assertIn("Hello Workspace", result["results"][0]["snippet"])

    def test_search_never_returns_secret_or_dependency_files(self) -> None:
        result = search_workspace("do-not-index", self.root)
        self.assertEqual(result["match_count"], 0)
        self.assertEqual(result["results"], [])

    def test_too_short_search_is_rejected(self) -> None:
        with self.assertRaises(ValueError):
            search_workspace(" ", self.root)

    def test_symlink_outside_workspace_is_not_indexed_when_supported(self) -> None:
        outside = Path(self.temp.name).parent / (Path(self.temp.name).name + "-outside.txt")
        outside.write_text("outside marker\n", encoding="utf-8")
        link = self.root / "outside-link.txt"
        try:
            link.symlink_to(outside)
        except (OSError, NotImplementedError):
            outside.unlink(missing_ok=True)
            self.skipTest("Symlink creation is not available in this environment")
        try:
            files, _ = list_workspace_files(self.root)
            self.assertNotIn(link, files)
        finally:
            outside.unlink(missing_ok=True)


if __name__ == "__main__":
    unittest.main()
