import sys
import os
import argparse
import google.generativeai as genai
from google.api_core import exceptions as google_exceptions


def _configure_stdio_utf8():
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except Exception:
            pass

def load_dotenv_local():
    """Same folder as this script: .env with lines like GEMINI_API_KEY=... (optional)."""
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, _, val = line.partition("=")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key and val and key not in os.environ:
                os.environ[key] = val

def _parse_args():
    p = argparse.ArgumentParser(description="Gemini API にプロンプトを送り、結果をファイルに保存します。")
    p.add_argument(
        "prompt",
        nargs="?",
        help="プロンプト本文（--prompt-file と併用不可）",
    )
    p.add_argument(
        "--prompt-file",
        metavar="PATH",
        help="プロンプトを UTF-8 テキストファイルから読み込む",
    )
    p.add_argument(
        "-o",
        "--output",
        default="gemini_result.md",
        help="出力 Markdown ファイル（既定: gemini_result.md）",
    )
    return p.parse_args()


def main():
    _configure_stdio_utf8()
    load_dotenv_local()

    args = _parse_args()
    if args.prompt_file:
        if not os.path.isfile(args.prompt_file):
            print(f"エラー: ファイルが見つかりません: {args.prompt_file}")
            sys.exit(1)
        with open(args.prompt_file, encoding="utf-8") as f:
            prompt = f.read()
    elif args.prompt:
        prompt = args.prompt
    else:
        print("エラー: プロンプトを指定してください。")
        print('例: python ask_gemini.py "こんにちは"')
        print("例: python ask_gemini.py --prompt-file daily_prompt.txt -o out.md")
        sys.exit(1)

    output_filename = args.output

    # 2. 環境変数（または.env）からAPIキーを取り出す
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("エラー: 環境変数 'GEMINI_API_KEY' が設定されていません。(.envファイルに記述してください)")
        sys.exit(1)

    genai.configure(api_key=api_key)

    try:
        # 3. 使うAIモデルのループ（Claudeの優秀な実装を維持）
        for model_name in ("gemini-2.0-flash", "gemini-2.5-flash"):
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
            except Exception as e:
                err = str(e)
                is_quota = isinstance(e, google_exceptions.ResourceExhausted) or (
                    "429" in err
                    or "quota" in err.lower()
                    or "resource exhausted" in err.lower()
                )
                if is_quota:
                    print(f"[注意] {model_name} はクォータ/レート制限のためスキップし、次のモデルを試します。")
                    continue
                raise

            if response.prompt_feedback and response.prompt_feedback.block_reason:
                print("プロンプトがブロックされました:", response.prompt_feedback)
                return

            if not response.candidates:
                continue

            content = response.candidates[0].content
            if content and content.parts:
                # ★最大の変更点: ターミナルに出力せず、ファイルにUTF-8で保存する
                with open(output_filename, "w", encoding="utf-8") as f:
                    f.write(f"\n\n")
                    f.write(response.text)
                
                print(f"成功: {model_name} の回答を '{output_filename}' に保存しました。")
                print(f"エディタで {output_filename} を開いて内容を確認してください。")
                return

        print("応答にテキストがありませんでした。model / API の状態を確認するか、しばらく待って再試行してください。")

    except Exception as e:
        print(f"エラーが発生しました: {e}")

if __name__ == "__main__":
    main()