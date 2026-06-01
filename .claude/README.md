# Claude エージェント階層

各エージェントの定義は `agents/<name>/agent.md`。付属メモは同フォルダ内の `.md`。

| エージェント | 役割 |
|-------------|------|
| `product-ux` | ペルソナ・画面フロー・受け入れ条件・IMPLEMENTATION_ORDER 案 |
| `snow-data` | データ辞書・リゾートマッピング・境界テスト |
| `architecture` | Leaflet／レイヤー読解・触る箇所の指し示し |
| `qa-accessibility` | テスト手順・回帰・A11y 観点 |
| `docs-knowledge` | Handoff 整形・`decision-log`・CHANGELOG 草案 |
| `implementer` | **本番実装のみ**編集可（HTML・`scripts/`・`package*.json`）＋実装に伴う `docs/`（「実装して」後のみ） |

**本番実装**（`ski-powder-hunter*.html`、`scripts/`、`package.json` / `package-lock.json`）のファイル変更は **implementer 以外禁止**（`.cursor/rules/implementer-only-production-code.mdc`）。product-ux のモックは `.claude/agents/product-ux/` 配下のみ。

## ペンディング（別枠）

- `pending/指示A1.md` — モバイルトップでのゲレンデ検索・絞り込み

## フロー（目安）

1. 各専門エージェントが `[HANDOFF]` を出力 → docs-knowledge が `decision-log.md` 等に反映し、implementer 向けに整形。
2. implementer は Handoff + `IMPLEMENTATION_ORDER_*` を受け取り、**「実装して」** が付いたときだけコードを変更する。
