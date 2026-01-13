# CM素材自動生成クルー

CrewAIを使用して、ストーリーボードからCM用素材一式を自動生成するマルチエージェントシステム。

## 🚀 クイックスタート

```bash
# 実行
python main.py \
  --storyboard input/storyboard.md \
  --direction input/direction_spec.md \
  --output ./cm_assets
```

## 📁 生成されるフォルダ構造

```
cm_assets/
├── README.md           # 使い方ガイド
├── characters/         # キャラクター素材
│   ├── protagonist/    # 主人公（5表情）
│   ├── agent_researcher/
│   ├── agent_writer/
│   ├── agent_analyst/
│   ├── agent_designer/
│   └── agent_manager/
├── backgrounds/        # 背景（9シーン）
├── effects/            # エフェクト連番
├── frames/             # 合成済みシーンフレーム
├── transitions/        # トランジション素材
├── audio/
│   ├── bgm/            # BGM（4トラック）
│   ├── se/             # 効果音（9種類）
│   └── voice/          # ボイス（4種類）
├── text/               # テロップ・テキスト
└── sequences/          # タイムライン情報（JSON）
```

## 🤖 エージェント構成

| クルー | エージェント | 役割 |
|--------|------------|------|
| 🎯 総合ディレクター | プロジェクトマネージャー | 全体統括 |
| 🎨 アート | キャラデザイナー, 背景, エフェクト | ビジュアル生成 |
| 🎞️ アニメーション | シーケンス, フレーム, トランジション | 合成・編集準備 |
| 🔊 オーディオ | 音楽, SE, ボイス | 音響素材 |
| ✍️ タイポグラフィ | コピー, アニメーション | テキスト素材 |
| ✅ 品質管理 | アートQA, タイミングQA, ファイル整理 | 検証・納品 |

## ⚙️ 設定ファイル

- `agents.yaml` - エージェント定義
- `tasks.yaml` - タスク定義
- `crew.yaml` - クルー構成と実行フロー
- `tools.py` - カスタムツール実装

## 📝 必要なAPI設定

`.env`ファイルに以下を設定:

```env
OPENAI_API_KEY=your_key      # 画像生成用
SUNO_API_KEY=your_key        # 音楽生成用
ELEVENLABS_API_KEY=your_key  # TTS・SE用
```
