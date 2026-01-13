"""
CM素材自動生成クルー - メイン実行スクリプト

使用方法:
    python main.py --storyboard input/storyboard.md --direction input/direction_spec.md

出力:
    ./cm_assets/ フォルダに全素材が生成される
"""

import os
import argparse
import yaml
from pathlib import Path
from datetime import datetime

from crewai import Agent, Task, Crew, Process
from tools import get_all_tools


def load_yaml(filepath: str) -> dict:
    """YAMLファイルを読み込む"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def create_output_structure(base_path: str) -> None:
    """出力フォルダ構造を作成"""
    folders = [
        "characters/protagonist",
        "characters/agent_researcher",
        "characters/agent_writer",
        "characters/agent_analyst",
        "characters/agent_designer",
        "characters/agent_manager",
        "backgrounds",
        "effects/energy_wave",
        "effects/pop_smoke",
        "effects/sparkles",
        "effects/confetti",
        "effects/progress_bar",
        "effects/glow_pulse",
        "frames",
        "transitions",
        "audio/bgm",
        "audio/se",
        "audio/voice",
        "text/animated",
        "sequences",
    ]
    
    for folder in folders:
        os.makedirs(os.path.join(base_path, folder), exist_ok=True)
    
    print(f"✅ 出力フォルダ構造を作成しました: {base_path}")


def create_agents(agents_config: dict) -> dict:
    """設定からエージェントを作成"""
    tools = get_all_tools()
    tool_map = {tool.name: tool for tool in tools}
    
    agents = {}
    for agent_id, config in agents_config.items():
        if agent_id in ['name', 'description']:
            continue
            
        agent_tools = [tool_map[t] for t in config.get('tools', []) if t in tool_map]
        
        agents[agent_id] = Agent(
            role=config['role'],
            goal=config['goal'],
            backstory=config['backstory'],
            tools=agent_tools,
            verbose=config.get('verbose', True),
            allow_delegation=config.get('allow_delegation', False),
            max_iter=config.get('max_iterations', 5),
        )
    
    return agents


def create_tasks(tasks_config: dict, agents: dict) -> list:
    """設定からタスクを作成"""
    tasks = []
    task_map = {}
    
    for task_id, config in tasks_config.items():
        if task_id in ['name', 'description']:
            continue
        
        # コンテキスト（依存タスク）の解決
        context_tasks = []
        for ctx_id in config.get('context', []):
            if ctx_id in task_map:
                context_tasks.append(task_map[ctx_id])
        
        task = Task(
            description=config['description'],
            expected_output=config['expected_output'],
            agent=agents.get(config['agent']),
            context=context_tasks if context_tasks else None,
        )
        
        tasks.append(task)
        task_map[task_id] = task
    
    return tasks


def run_cm_generator(storyboard_path: str, direction_path: str, output_path: str) -> None:
    """CM素材生成を実行"""
    
    print("=" * 60)
    print("🎬 CM素材自動生成クルー")
    print("=" * 60)
    print(f"📄 ストーリーボード: {storyboard_path}")
    print(f"📋 演出指示書: {direction_path}")
    print(f"📁 出力先: {output_path}")
    print("=" * 60)
    
    # 設定ファイルの読み込み
    base_dir = Path(__file__).parent
    agents_config = load_yaml(base_dir / "agents.yaml")
    tasks_config = load_yaml(base_dir / "tasks.yaml")
    crew_config = load_yaml(base_dir / "crew.yaml")
    
    # 出力フォルダ構造の作成
    create_output_structure(output_path)
    
    # 入力ファイルのコピー
    input_dir = os.path.join(output_path, "_input")
    os.makedirs(input_dir, exist_ok=True)
    
    # エージェントとタスクの作成
    print("\n🤖 エージェントを初期化中...")
    agents = create_agents(agents_config)
    print(f"   {len(agents)}体のエージェントを作成しました")
    
    print("\n📋 タスクを初期化中...")
    tasks = create_tasks(tasks_config, agents)
    print(f"   {len(tasks)}個のタスクを作成しました")
    
    # クルーの作成
    print("\n🚀 クルーを起動中...")
    crew = Crew(
        agents=list(agents.values()),
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
        memory=True,
    )
    
    # 実行
    print("\n" + "=" * 60)
    print("⚡ 素材生成を開始します...")
    print("=" * 60)
    
    inputs = {
        "storyboard_path": storyboard_path,
        "direction_path": direction_path,
        "output_path": output_path,
    }
    
    result = crew.kickoff(inputs=inputs)
    
    # 完了
    print("\n" + "=" * 60)
    print("✅ 素材生成が完了しました！")
    print("=" * 60)
    print(f"📁 出力先: {output_path}")
    print("\n次のステップ:")
    print("1. 動画編集ソフトでフォルダをインポート")
    print("2. sequences/timeline.json を参照してタイムラインを構築")
    print("3. 完成！")
    
    return result


def main():
    parser = argparse.ArgumentParser(description="CM素材自動生成クルー")
    parser.add_argument(
        "--storyboard", "-s",
        type=str,
        required=True,
        help="ストーリーボードファイルのパス"
    )
    parser.add_argument(
        "--direction", "-d",
        type=str,
        required=True,
        help="演出指示書ファイルのパス"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default="./cm_assets",
        help="出力ディレクトリ（デフォルト: ./cm_assets）"
    )
    
    args = parser.parse_args()
    
    # ファイル存在チェック
    if not os.path.exists(args.storyboard):
        print(f"❌ ストーリーボードが見つかりません: {args.storyboard}")
        return
    
    if not os.path.exists(args.direction):
        print(f"❌ 演出指示書が見つかりません: {args.direction}")
        return
    
    # 実行
    run_cm_generator(args.storyboard, args.direction, args.output)


if __name__ == "__main__":
    main()
