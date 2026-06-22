"""今日の作業文脈をテキストで標準出力する（日次X案パイプライン用）。"""
from __future__ import annotations

import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIR_NAMES = frozenset({".venv", ".git", "__pycache__", "node_modules", ".cursor"})


def _git_snippet() -> str:
    if not (ROOT / ".git").is_dir():
        return "(Git リポジトリではありません。コミット履歴なし。)\n"
    try:
        r = subprocess.run(
            ["git", "log", "--since=midnight", "--oneline", "-40"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
        )
        if r.returncode != 0:
            return f"(git log 取得失敗)\n{r.stderr or r.stdout}\n"
        body = (r.stdout or "").strip() or "(今日 0 時以降のコミットなし)"
        return f"## 今日のコミット（git log --since=midnight）\n```\n{body}\n```\n"
    except Exception as e:  # noqa: BLE001
        return f"(git 情報なし: {e})\n"


def _recent_files(limit: int = 22) -> str:
    files: list[tuple[float, Path]] = []
    for p in ROOT.rglob("*"):
        if not p.is_file():
            continue
        try:
            rel = p.relative_to(ROOT)
        except ValueError:
            continue
        if any(part in SKIP_DIR_NAMES for part in rel.parts):
            continue
        try:
            st = p.stat()
        except OSError:
            continue
        files.append((st.st_mtime, p))
    files.sort(key=lambda x: -x[0])
    lines: list[str] = []
    for mtime, p in files[:limit]:
        rel = p.relative_to(ROOT).as_posix()
        ts = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M")
        lines.append(f"- {ts}  {rel}")
    body = "\n".join(lines) if lines else "(該当ファイルなし)"
    return f"## 直近更新されたファイル（上位 {limit} 件・参考）\n{body}\n"


def _work_log_snippet() -> str:
    log = ROOT / "docs" / "work-log.md"
    if not log.is_file():
        return (
            "## 作業メモ（docs/work-log.md）\n"
            "(なし。任意で `docs/work-log.example.md` を参考に作成し、当日やったことを短く追記すると精度が上がります。)\n"
        )
    try:
        text = log.read_text(encoding="utf-8").strip()
        lines = text.splitlines()
        tail = lines[-60:] if len(lines) > 60 else lines
        body = "\n".join(tail)
        return f"## 作業メモ（docs/work-log.md 末尾）\n```\n{body}\n```\n"
    except OSError as e:
        return f"(work-log 読込エラー: {e})\n"


def main() -> None:
    parts = [
        f"# 収集日時（ローカル）\n{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n",
        _git_snippet(),
        "\n",
        _recent_files(),
        "\n",
        _work_log_snippet(),
    ]
    sys.stdout.write("".join(parts))


if __name__ == "__main__":
    main()
