"""固定ルール + 作業文脈からプロンプトを組み立て、Gemini に送って日次X案を保存する。"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RULES = ROOT / "docs" / "daily-proposals-rules.md"
PROMPT_OUT = ROOT / "daily_prompt.txt"
ASK = ROOT / "ask_gemini.py"
RESULT_NAME = "gemini_result_daily.md"


def main() -> None:
    if not RULES.is_file():
        print(
            "エラー: docs/daily-proposals-rules.md がありません。"
            "docs/daily-proposals-rules.example.md をコピーして同パスで保存し、内容を編集してください。",
            file=sys.stderr,
        )
        sys.exit(1)

    rules_text = RULES.read_text(encoding="utf-8")
    ctx = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "collect_work_context.py")],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=120,
    )
    if ctx.returncode != 0:
        print(ctx.stderr or ctx.stdout, file=sys.stderr)
        sys.exit(ctx.returncode)

    prompt = f"""あなたはSNS（X）用の投稿文案アシスタントです。以下の「固定ルール」を必ず守ってください。

# 固定ルール（プロジェクトで運用する一式指定）

{rules_text}

---

# 今日の作業文脈（自動収集）

次の情報はプロジェクトから自動収集したものです。ここに無い実績は捏造しないでください。推測する場合は「推測:」と明記してください。

{ctx.stdout}

---

# 依頼

上記「固定ルール」の形式・トーン・禁止事項に従い、この文脈に基づいて「今日のX投稿」として使える案を出してください。文脈が薄い場合は、ルールに沿った汎用案を複数出してください。
"""

    PROMPT_OUT.write_text(prompt, encoding="utf-8")
    print(f"[daily_x_proposal] プロンプト: {PROMPT_OUT}", file=sys.stderr)

    r = subprocess.run(
        [
            sys.executable,
            str(ASK),
            "--prompt-file",
            str(PROMPT_OUT),
            "-o",
            RESULT_NAME,
        ],
        cwd=str(ROOT),
    )
    if r.returncode == 0:
        print(f"[daily_x_proposal] 結果: {ROOT / RESULT_NAME}", file=sys.stderr)
    sys.exit(r.returncode)


if __name__ == "__main__":
    main()
