"""
CM素材生成クルー用カスタムツール - 実装版

ElevenLabs API（TTS/SE）とMubert API（音楽生成）を統合
"""

from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Optional, List
import os
import json
import requests
import base64
from pathlib import Path

# ElevenLabs SDK
try:
    from elevenlabs import ElevenLabs
    ELEVENLABS_AVAILABLE = True
except ImportError:
    ELEVENLABS_AVAILABLE = False
    print("Warning: elevenlabs not installed. Run: pip install elevenlabs")


# ===============================================
# 設定
# ===============================================

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
MUBERT_API_KEY = os.getenv("MUBERT_API_KEY", "")  # Mubert API用


# ===============================================
# 画像生成ツール（OpenAI DALL-E 3）
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
    OpenAI DALL-E 3を使って画像を生成するツール。
    キャラクター、背景、エフェクトなどを生成できる。
    """
    args_schema: type[BaseModel] = ImageGeneratorInput

    def _run(self, prompt: str, style: str, width: int, height: int, 
             output_path: str, transparent_bg: bool = False) -> str:
        """画像生成を実行"""
        
        if not OPENAI_API_KEY:
            return "エラー: OPENAI_API_KEYが設定されていません"
        
        # スタイル強化プロンプト
        style_prompts = {
            "cartoon": "modern cartoon style, rubber hose animation, vibrant colors, clean lines, Cuphead-inspired",
            "anime": "anime style, cel-shaded, expressive",
            "realistic": "photorealistic, high detail",
        }
        
        style_suffix = style_prompts.get(style, style_prompts["cartoon"])
        
        enhanced_prompt = f"""
        {prompt}
        
        Style: {style_suffix}
        {'Transparent background, PNG with alpha channel' if transparent_bg else ''}
        """
        
        # OpenAI API呼び出し
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # サイズの正規化（DALL-E 3は特定サイズのみサポート）
        size = "1024x1024"
        if width > height:
            size = "1792x1024"
        elif height > width:
            size = "1024x1792"
        
        data = {
            "model": "dall-e-3",
            "prompt": enhanced_prompt,
            "size": size,
            "quality": "hd",
            "n": 1,
            "response_format": "b64_json"
        }
        
        try:
            response = requests.post(
                "https://api.openai.com/v1/images/generations",
                headers=headers,
                json=data,
                timeout=120
            )
            response.raise_for_status()
            
            result = response.json()
            image_b64 = result["data"][0]["b64_json"]
            
            # 画像を保存
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(base64.b64decode(image_b64))
            
            return f"画像を生成しました: {output_path}"
            
        except requests.exceptions.RequestException as e:
            return f"画像生成エラー: {str(e)}"


# ===============================================
# 音楽生成ツール（Mubert API）
# ===============================================

class MusicGeneratorInput(BaseModel):
    """音楽生成ツールの入力スキーマ"""
    description: str = Field(..., description="曲の説明（ムード、ジャンル、テンポ等）")
    duration_seconds: int = Field(default=30, description="曲の長さ（秒）")
    genre: str = Field(default="electronic", description="ジャンル")
    mood: str = Field(default="upbeat", description="ムード")
    output_path: str = Field(..., description="出力ファイルパス")


class MusicGeneratorTool(BaseTool):
    name: str = "music_generator"
    description: str = """
    Mubert APIを使ってBGMを生成するツール。
    150+ジャンル・ムードから選択して音楽を作曲する。
    """
    args_schema: type[BaseModel] = MusicGeneratorInput

    def _run(self, description: str, duration_seconds: int, 
             genre: str, mood: str, output_path: str) -> str:
        """音楽生成を実行"""
        
        if not MUBERT_API_KEY:
            # Mubertがない場合はプレースホルダー
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            return f"注意: MUBERT_API_KEYが未設定。手動で音楽を配置してください: {output_path}"
        
        # Mubert Text-to-Music API
        # 注: 実際のAPIエンドポイントはMubertの契約プランによって異なります
        
        headers = {
            "Authorization": f"Bearer {MUBERT_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "prompt": f"{description}. Genre: {genre}. Mood: {mood}.",
            "duration": duration_seconds,
            "format": "mp3"
        }
        
        try:
            # Mubert API エンドポイント（要確認）
            response = requests.post(
                "https://api.mubert.com/v2/text-to-music",
                headers=headers,
                json=data,
                timeout=180
            )
            
            if response.status_code == 200:
                result = response.json()
                audio_url = result.get("url") or result.get("audio_url")
                
                if audio_url:
                    # 音声ファイルをダウンロード
                    audio_response = requests.get(audio_url, timeout=60)
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    with open(output_path, "wb") as f:
                        f.write(audio_response.content)
                    return f"BGMを生成しました: {output_path}"
            
            return f"Mubert APIエラー: {response.status_code}"
            
        except requests.exceptions.RequestException as e:
            return f"音楽生成エラー: {str(e)}"


# ===============================================
# ElevenLabs TTS ツール
# ===============================================

class TTSGeneratorInput(BaseModel):
    """TTS生成ツールの入力スキーマ"""
    text: str = Field(..., description="読み上げるテキスト")
    voice_id: str = Field(default="21m00Tcm4TlvDq8ikWAM", description="声のID")
    emotion: str = Field(default="neutral", description="感情: happy, sad, excited等")
    output_path: str = Field(..., description="出力ファイルパス")


class TTSGeneratorTool(BaseTool):
    name: str = "tts_generator"
    description: str = """
    ElevenLabs APIを使ってテキストを音声に変換するツール。
    高品質なキャラクターボイスを生成。
    """
    args_schema: type[BaseModel] = TTSGeneratorInput

    def _run(self, text: str, voice_id: str, emotion: str, output_path: str) -> str:
        """TTS生成を実行"""
        
        if not ELEVENLABS_API_KEY:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            return f"注意: ELEVENLABS_API_KEYが未設定。手動で音声を配置してください: {output_path}"
        
        if not ELEVENLABS_AVAILABLE:
            return "エラー: elevenlabs SDKがインストールされていません"
        
        try:
            client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
            
            # 音声生成
            audio = client.text_to_speech.convert(
                voice_id=voice_id,
                text=text,
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128"
            )
            
            # ファイル保存
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, "wb") as f:
                for chunk in audio:
                    f.write(chunk)
            
            return f"ボイスを生成しました: {output_path}"
            
        except Exception as e:
            return f"TTS生成エラー: {str(e)}"


# ===============================================
# ElevenLabs Sound Effects ツール
# ===============================================

class SEGeneratorInput(BaseModel):
    """SE生成ツールの入力スキーマ"""
    description: str = Field(..., description="効果音の説明")
    duration_seconds: float = Field(default=2.0, description="長さ（秒）")
    output_path: str = Field(..., description="出力ファイルパス")


class SEGeneratorTool(BaseTool):
    name: str = "se_generator"
    description: str = """
    ElevenLabs Sound Effects APIを使って効果音を生成するツール。
    テキスト説明から高品質なSEを生成。
    """
    args_schema: type[BaseModel] = SEGeneratorInput

    def _run(self, description: str, duration_seconds: float, output_path: str) -> str:
        """SE生成を実行"""
        
        if not ELEVENLABS_API_KEY:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            return f"注意: ELEVENLABS_API_KEYが未設定。手動でSEを配置してください: {output_path}"
        
        if not ELEVENLABS_AVAILABLE:
            return "エラー: elevenlabs SDKがインストールされていません"
        
        try:
            client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
            
            # Sound Effects生成
            audio = client.text_to_sound_effects.convert(
                text=description,
                duration_seconds=duration_seconds,
                prompt_influence=0.5
            )
            
            # ファイル保存
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, "wb") as f:
                for chunk in audio:
                    f.write(chunk)
            
            return f"SEを生成しました: {output_path}"
            
        except Exception as e:
            return f"SE生成エラー: {str(e)}"


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
    """
    args_schema: type[BaseModel] = FileOrganizerInput

    def _run(self, source_directory: str, target_directory: str, 
             naming_convention: str) -> str:
        """ファイル整理を実行"""
        import shutil
        
        os.makedirs(target_directory, exist_ok=True)
        
        if os.path.exists(source_directory):
            for item in os.listdir(source_directory):
                src = os.path.join(source_directory, item)
                # snake_case変換
                if naming_convention == "snake_case":
                    new_name = item.lower().replace(" ", "_").replace("-", "_")
                else:
                    new_name = item
                dst = os.path.join(target_directory, new_name)
                shutil.copy2(src, dst)
        
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
    """
    args_schema: type[BaseModel] = ReadmeGeneratorInput

    def _run(self, directory: str, project_name: str, description: str) -> str:
        """README生成を実行"""
        from datetime import datetime
        
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
- オーディオ: 48kHz, MP3/WAV
- フレームレート: 24fps

## 生成日時
{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
        
        readme_path = os.path.join(directory, "README.md")
        os.makedirs(directory, exist_ok=True)
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
    """
    args_schema: type[BaseModel] = SequenceGeneratorInput

    def _run(self, storyboard_path: str, output_path: str) -> str:
        """シーケンス生成を実行"""
        
        # 9シーンのタイムライン
        sequence = {
            "project": "CrewAI小人エージェントCM",
            "duration_seconds": 45,
            "fps": 24,
            "scenes": [
                {
                    "id": 1, "name": "オープニング",
                    "start": "00:00:00", "end": "00:00:03",
                    "assets": {
                        "bg": "backgrounds/scene1_desk_cluttered.png",
                        "char": ["characters/protagonist/worried.png"],
                        "bgm": "audio/bgm/intro_somber.mp3",
                        "se": ["audio/se/sigh.wav"]
                    },
                    "transition_out": "fade"
                },
                {
                    "id": 2, "name": "願いの瞬間",
                    "start": "00:00:03", "end": "00:00:07",
                    "assets": {
                        "bg": "backgrounds/scene2_magical_burst.png",
                        "char": ["characters/protagonist/shouting.png"],
                        "fx": ["effects/energy_wave/"],
                        "bgm": "audio/bgm/transition_buildup.mp3",
                        "se": ["audio/se/magic_sparkle.wav"],
                        "voice": ["audio/voice/protagonist_shout.mp3"]
                    },
                    "transition_out": "flash"
                },
                {
                    "id": 3, "name": "エージェント誕生",
                    "start": "00:00:07", "end": "00:00:12",
                    "assets": {
                        "bg": "backgrounds/scene3_spawn_zone.png",
                        "char": [
                            "characters/agent_researcher/idle.png",
                            "characters/agent_writer/idle.png",
                            "characters/agent_analyst/idle.png",
                            "characters/agent_designer/idle.png",
                            "characters/agent_manager/idle.png"
                        ],
                        "fx": ["effects/pop_smoke/", "effects/sparkles/"],
                        "bgm": "audio/bgm/main_upbeat.mp3",
                        "se": ["audio/se/pop_x5.wav"]
                    }
                },
                {
                    "id": 4, "name": "タスク読み込み",
                    "start": "00:00:12", "end": "00:00:17",
                    "assets": {
                        "bg": "backgrounds/scene4_reading_space.png",
                        "se": ["audio/se/paper_flip.wav"]
                    }
                },
                {
                    "id": 5, "name": "チーム形成",
                    "start": "00:00:17", "end": "00:00:22",
                    "assets": {
                        "bg": "backgrounds/scene5_team_formation.png",
                        "se": ["audio/se/team_cheer.wav"]
                    }
                },
                {
                    "id": 6, "name": "作業シーン",
                    "start": "00:00:22", "end": "00:00:30",
                    "assets": {
                        "bg": "backgrounds/scene6_workspace.png",
                        "fx": ["effects/progress_bar/"],
                        "se": ["audio/se/typing_loop.wav"]
                    }
                },
                {
                    "id": 7, "name": "成果物完成",
                    "start": "00:00:30", "end": "00:00:37",
                    "assets": {
                        "bg": "backgrounds/scene7_completion_glow.png",
                        "fx": ["effects/confetti/", "effects/glow_pulse/"],
                        "se": ["audio/se/fanfare.wav"]
                    }
                },
                {
                    "id": 8, "name": "納品シーン",
                    "start": "00:00:37", "end": "00:00:42",
                    "assets": {
                        "bg": "backgrounds/scene8_handover.png",
                        "char": ["characters/protagonist/happy.png"],
                        "voice": ["audio/voice/agents_complete.mp3", "audio/voice/protagonist_happy.mp3"],
                        "se": ["audio/se/applause.wav"]
                    }
                },
                {
                    "id": 9, "name": "エンディング",
                    "start": "00:00:42", "end": "00:00:45",
                    "assets": {
                        "bg": "backgrounds/scene9_logo_backdrop.png",
                        "text": ["text/animated/tagline.gif"],
                        "bgm": "audio/bgm/outro_jingle.mp3",
                        "se": ["audio/se/logo_sound.wav"]
                    }
                }
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


# ===============================================
# API設定確認ユーティリティ
# ===============================================

def check_api_status():
    """API設定状況を確認"""
    status = {
        "OpenAI (画像生成)": "✅ 設定済み" if OPENAI_API_KEY else "❌ 未設定",
        "ElevenLabs (TTS/SE)": "✅ 設定済み" if ELEVENLABS_API_KEY else "❌ 未設定",
        "Mubert (音楽生成)": "✅ 設定済み" if MUBERT_API_KEY else "❌ 未設定",
        "ElevenLabs SDK": "✅ インストール済み" if ELEVENLABS_AVAILABLE else "❌ 未インストール",
    }
    
    print("=" * 50)
    print("API設定状況")
    print("=" * 50)
    for name, state in status.items():
        print(f"  {name}: {state}")
    print("=" * 50)
    
    return status


if __name__ == "__main__":
    check_api_status()
