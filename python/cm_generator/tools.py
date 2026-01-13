"""
CM素材生成クルー用カスタムツール

画像生成、音声生成、ファイル操作のためのツール群
"""

from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Optional, List
import os
import json


# ===============================================
# 画像生成ツール
# ===============================================

class ImageGeneratorInput(BaseModel):
    """画像生成ツールの入力スキーマ"""
    prompt: str = Field(..., description="生成する画像の詳細な説明")
    style: str = Field(default="cartoon", description="画像スタイル: cartoon, realistic, anime等")
    width: int = Field(default=1024, description="画像の幅（ピクセル）")
    height: int = Field(default=1024, description="画像の高さ（ピクセル）")
    output_path: str = Field(..., description="出力ファイルパス")
    transparent_bg: bool = Field(default=False, description="透明背景にするか")


class ImageGeneratorTool(BaseTool):
    name: str = "image_generator"
    description: str = """
    AIを使って画像を生成するツール。
    キャラクター、背景、エフェクトなどを生成できる。
    """
    args_schema: type[BaseModel] = ImageGeneratorInput

    def _run(self, prompt: str, style: str, width: int, height: int, 
             output_path: str, transparent_bg: bool = False) -> str:
        """
        画像生成を実行
        
        実際の実装ではDALL-E, Midjourney APIなどを呼び出す
        """
        # プレースホルダー実装
        # 実際にはOpenAI/StabilityAI等のAPIを呼び出す
        
        enhanced_prompt = f"""
        Style: {style}
        Requirements: {'transparent background' if transparent_bg else 'with background'}
        
        {prompt}
        """
        
        # API呼び出し（実装時に追加）
        # response = openai.Image.create(
        #     model="dall-e-3",
        #     prompt=enhanced_prompt,
        #     size=f"{width}x{height}",
        #     quality="hd",
        #     n=1
        # )
        
        # 出力ディレクトリ作成
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        return f"画像を生成しました: {output_path}"


# ===============================================
# 音楽生成ツール
# ===============================================

class MusicGeneratorInput(BaseModel):
    """音楽生成ツールの入力スキーマ"""
    description: str = Field(..., description="曲の説明（ムード、ジャンル、テンポ等）")
    duration_seconds: int = Field(default=30, description="曲の長さ（秒）")
    bpm: int = Field(default=120, description="テンポ（BPM）")
    key: str = Field(default="C major", description="キー")
    output_path: str = Field(..., description="出力ファイルパス")


class MusicGeneratorTool(BaseTool):
    name: str = "music_generator"
    description: str = """
    AIを使ってBGMを生成するツール。
    Suno AIやUdioのAPIを使用して音楽を作曲する。
    """
    args_schema: type[BaseModel] = MusicGeneratorInput

    def _run(self, description: str, duration_seconds: int, 
             bpm: int, key: str, output_path: str) -> str:
        """音楽生成を実行"""
        # プレースホルダー実装
        # 実際にはSuno/Udio等のAPIを呼び出す
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        return f"BGMを生成しました: {output_path}"


# ===============================================
# SE生成ツール
# ===============================================

class SEGeneratorInput(BaseModel):
    """SE生成ツールの入力スキーマ"""
    description: str = Field(..., description="効果音の説明")
    duration_ms: int = Field(default=1000, description="長さ（ミリ秒）")
    output_path: str = Field(..., description="出力ファイルパス")


class SEGeneratorTool(BaseTool):
    name: str = "se_generator"
    description: str = """
    効果音を生成するツール。
    ElevenLabs Sound EffectsやFreesound APIを使用。
    """
    args_schema: type[BaseModel] = SEGeneratorInput

    def _run(self, description: str, duration_ms: int, output_path: str) -> str:
        """SE生成を実行"""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        return f"SEを生成しました: {output_path}"


# ===============================================
# TTS（テキスト音声変換）ツール
# ===============================================

class TTSGeneratorInput(BaseModel):
    """TTS生成ツールの入力スキーマ"""
    text: str = Field(..., description="読み上げるテキスト")
    voice_id: str = Field(default="young_male", description="声のID/タイプ")
    emotion: str = Field(default="neutral", description="感情: happy, sad, excited等")
    output_path: str = Field(..., description="出力ファイルパス")


class TTSGeneratorTool(BaseTool):
    name: str = "tts_generator"
    description: str = """
    テキストを音声に変換するツール。
    ElevenLabsやOpenAI TTSを使用してキャラクターボイスを生成。
    """
    args_schema: type[BaseModel] = TTSGeneratorInput

    def _run(self, text: str, voice_id: str, emotion: str, output_path: str) -> str:
        """TTS生成を実行"""
        # プレースホルダー実装
        # 実際にはElevenLabs/OpenAI TTS等のAPIを呼び出す
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        return f"ボイスを生成しました: {output_path}"


# ===============================================
# ファイル整理ツール
# ===============================================

class FileOrganizerInput(BaseModel):
    """ファイル整理ツールの入力スキーマ"""
    source_directory: str = Field(..., description="整理元ディレクトリ")
    target_directory: str = Field(..., description="整理先ディレクトリ")
    naming_convention: str = Field(default="snake_case", description="命名規則")


class FileOrganizerTool(BaseTool):
    name: str = "file_organizer"
    description: str = """
    ファイルを整理し、命名規則を統一するツール。
    フォルダ構造を整理し、一貫したファイル名に変更する。
    """
    args_schema: type[BaseModel] = FileOrganizerInput

    def _run(self, source_directory: str, target_directory: str, 
             naming_convention: str) -> str:
        """ファイル整理を実行"""
        os.makedirs(target_directory, exist_ok=True)
        return f"ファイルを整理しました: {target_directory}"


# ===============================================
# README生成ツール
# ===============================================

class ReadmeGeneratorInput(BaseModel):
    """README生成ツールの入力スキーマ"""
    directory: str = Field(..., description="READMEを作成するディレクトリ")
    project_name: str = Field(..., description="プロジェクト名")
    description: str = Field(..., description="プロジェクトの説明")


class ReadmeGeneratorTool(BaseTool):
    name: str = "readme_generator"
    description: str = """
    プロジェクトのREADME.mdを自動生成するツール。
    フォルダ構造を解析し、使い方ガイドを作成する。
    """
    args_schema: type[BaseModel] = ReadmeGeneratorInput

    def _run(self, directory: str, project_name: str, description: str) -> str:
        """README生成を実行"""
        
        readme_content = f"""# {project_name}

## 概要
{description}

## フォルダ構造
```
cm_assets/
├── characters/      # キャラクター素材
├── backgrounds/     # 背景画像
├── effects/         # エフェクト連番
├── frames/          # 合成済みシーンフレーム
├── transitions/     # トランジション素材
├── audio/
│   ├── bgm/         # BGM
│   ├── se/          # 効果音
│   └── voice/       # ボイス
├── text/            # テキスト・テロップ
└── sequences/       # タイムライン情報
```

## 使い方
1. 動画編集ソフト（Premiere Pro, DaVinci Resolve等）を開く
2. 全フォルダをプロジェクトにインポート
3. `sequences/timeline.json` を参照してタイムラインを構築
4. 各シーンのフレームをタイムラインに配置
5. 音声ファイルを同期
6. トランジションを適用
7. 完成！

## 素材仕様
- 画像解像度: 1920x1080px (FHD)
- キャラクター解像度: 2048x2048px
- オーディオ: 48kHz, WAV
- フレームレート: 24fps

## 生成日時
{os.popen('date').read().strip()}
"""
        
        readme_path = os.path.join(directory, "README.md")
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(readme_content)
        
        return f"READMEを生成しました: {readme_path}"


# ===============================================
# シーケンス生成ツール
# ===============================================

class SequenceGeneratorInput(BaseModel):
    """シーケンス生成ツールの入力スキーマ"""
    storyboard_path: str = Field(..., description="ストーリーボードファイルのパス")
    output_path: str = Field(..., description="出力JSONファイルのパス")


class SequenceGeneratorTool(BaseTool):
    name: str = "sequence_generator"
    description: str = """
    ストーリーボードからタイムラインシーケンス（JSON）を生成するツール。
    各シーンの開始・終了時間、使用素材、トランジションを定義する。
    """
    args_schema: type[BaseModel] = SequenceGeneratorInput

    def _run(self, storyboard_path: str, output_path: str) -> str:
        """シーケンス生成を実行"""
        
        # シーケンステンプレート
        sequence = {
            "project": "CrewAI小人エージェントCM",
            "duration_seconds": 45,
            "fps": 24,
            "scenes": [
                {
                    "id": 1,
                    "name": "オープニング",
                    "start_time": "00:00:00",
                    "end_time": "00:00:03",
                    "duration_seconds": 3,
                    "assets": {
                        "background": "backgrounds/scene1_desk_cluttered.png",
                        "characters": ["characters/protagonist/worried.png"],
                        "audio": {
                            "bgm": "audio/bgm/intro_somber.mp3",
                            "se": ["audio/se/sigh.wav"]
                        }
                    },
                    "transition_out": "fade"
                },
                # ... 他のシーンも同様に定義
            ]
        }
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(sequence, f, ensure_ascii=False, indent=2)
        
        return f"シーケンスを生成しました: {output_path}"


# ===============================================
# ツールリストのエクスポート
# ===============================================

def get_all_tools() -> List[BaseTool]:
    """すべてのカスタムツールを取得"""
    return [
        ImageGeneratorTool(),
        MusicGeneratorTool(),
        SEGeneratorTool(),
        TTSGeneratorTool(),
        FileOrganizerTool(),
        ReadmeGeneratorTool(),
        SequenceGeneratorTool(),
    ]
