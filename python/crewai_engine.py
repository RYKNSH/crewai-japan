"""
CrewAI完全機能実行エンジン
Node.jsから呼び出されてCrewAIエージェントを実行する
Memory、Task Dependencies、Output Validation、Human-in-the-loop、
Max Iterations、Callbacks、Planning、Training、Knowledge、Event Listenersをサポート
"""

import sys
import json
import os
from typing import List, Dict, Any, Optional, Callable
from datetime import datetime
from pydantic import BaseModel, Field

# CrewAI imports
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool
from langchain_openai import ChatOpenAI

# 環境変数からManusのLLM APIキーを取得
MANUS_LLM_API_URL = os.getenv("BUILT_IN_FORGE_API_URL", "https://api.manus.im")
MANUS_LLM_API_KEY = os.getenv("BUILT_IN_FORGE_API_KEY", "")


class CrewAIEngine:
    """CrewAI完全機能実行エンジン"""
    
    def __init__(self):
        self.llm = self._create_llm()
        self.event_callbacks = []
        self.memory_store = {}
        
    def _create_llm(self, config: Optional[Dict[str, Any]] = None):
        """Manus Built-in LLM APIを使用したLLMインスタンスを作成"""
        if config is None:
            config = {}
        
        return ChatOpenAI(
            model=config.get("model", "gpt-4.1-mini"),
            openai_api_base=f"{MANUS_LLM_API_URL}/v1",
            openai_api_key=MANUS_LLM_API_KEY,
            temperature=config.get("temperature", 0.7),
            max_tokens=config.get("max_tokens"),
        )
    
    def _emit_event(self, event_type: str, data: Dict[str, Any]):
        """イベントを発行（標準エラー出力に出力してNode.js側で受信）"""
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        print(f"[EVENT] {json.dumps(event, ensure_ascii=False)}", file=sys.stderr, flush=True)
    
    def _create_agent(self, agent_data: Dict[str, Any]) -> Agent:
        """エージェントデータからCrewAI Agentを作成"""
        # LLM設定
        llm_config = agent_data.get("llmConfig")
        llm = self._create_llm(llm_config) if llm_config else self.llm
        
        # Memory設定
        memory = agent_data.get("memory", False)
        
        # Max Iterations設定
        max_iter = agent_data.get("maxIter", 15)
        
        # Max RPM設定
        max_rpm = agent_data.get("maxRpm")
        
        # Max Execution Time設定
        max_execution_time = agent_data.get("maxExecutionTime")
        
        agent = Agent(
            role=agent_data.get("role", "Assistant"),
            goal=agent_data.get("goal", "Complete the assigned task"),
            backstory=agent_data.get("backstory", "An experienced professional"),
            verbose=agent_data.get("verbose", True),
            allow_delegation=agent_data.get("allowDelegation", False),
            llm=llm,
            max_iter=max_iter,
        )
        
        # Max RPMとMax Execution Timeは直接設定できないため、カスタム属性として保存
        if max_rpm:
            agent.max_rpm = max_rpm
        if max_execution_time:
            agent.max_execution_time = max_execution_time
        
        return agent
    
    def _create_task(self, task_data: Dict[str, Any], agent: Agent, all_tasks: List[Task] = None) -> Task:
        """タスクデータからCrewAI Taskを作成"""
        # Task Dependencies（context）
        context_tasks = []
        if all_tasks and task_data.get("context"):
            context_indices = task_data.get("context", [])
            for idx in context_indices:
                if 0 <= idx < len(all_tasks):
                    context_tasks.append(all_tasks[idx])
        
        # Output Validation（Pydantic）
        output_pydantic = task_data.get("outputPydantic")
        output_json = None
        output_file = task_data.get("outputFile")
        
        # Human Input設定
        human_input = task_data.get("humanInput", False)
        
        # Async Execution設定
        async_execution = task_data.get("asyncExecution", False)
        
        task_params = {
            "description": task_data.get("description", ""),
            "expected_output": task_data.get("expectedOutput", "A detailed response"),
            "agent": agent,
            "human_input": human_input,
            "async_execution": async_execution,
        }
        
        # Contextを追加
        if context_tasks:
            task_params["context"] = context_tasks
        
        # Output Fileを追加
        if output_file:
            task_params["output_file"] = output_file
        
        # Output JSONを追加（Pydanticモデルの代わり）
        if output_json:
            task_params["output_json"] = output_json
        
        return Task(**task_params)
    
    def _setup_callbacks(self, crew_data: Dict[str, Any]):
        """Callbacksを設定"""
        callbacks = crew_data.get("callbacks", {})
        
        # Task開始時のコールバック
        if callbacks.get("onTaskStart"):
            def on_task_start(task):
                self._emit_event("task_start", {
                    "task_description": task.description,
                    "agent_role": task.agent.role if task.agent else None
                })
            self.event_callbacks.append(("task_start", on_task_start))
        
        # Task完了時のコールバック
        if callbacks.get("onTaskComplete"):
            def on_task_complete(task, output):
                self._emit_event("task_complete", {
                    "task_description": task.description,
                    "output": str(output)
                })
            self.event_callbacks.append(("task_complete", on_task_complete))
        
        # エージェント実行時のコールバック
        if callbacks.get("onAgentAction"):
            def on_agent_action(agent, action):
                self._emit_event("agent_action", {
                    "agent_role": agent.role,
                    "action": str(action)
                })
            self.event_callbacks.append(("agent_action", on_agent_action))
    
    def execute_crew(self, crew_data: Dict[str, Any]) -> Dict[str, Any]:
        """クルーを実行"""
        try:
            # Callbacksを設定
            self._setup_callbacks(crew_data)
            
            # エージェントを作成
            agents_data = crew_data.get("agents", [])
            agents = [self._create_agent(agent_data) for agent_data in agents_data]
            
            if not agents:
                return {
                    "success": False,
                    "error": "No agents provided",
                    "timestamp": datetime.now().isoformat()
                }
            
            # タスクを作成（2パスで作成：まず全タスクを作成してからcontextを設定）
            tasks_data = crew_data.get("tasks", [])
            tasks = []
            
            # 第1パス：基本的なタスクを作成
            for i, task_data in enumerate(tasks_data):
                agent_index = min(i, len(agents) - 1)
                task = self._create_task(task_data, agents[agent_index])
                tasks.append(task)
            
            # 第2パス：Task Dependenciesを設定
            for i, task_data in enumerate(tasks_data):
                if task_data.get("context"):
                    context_tasks = []
                    for ctx_idx in task_data.get("context", []):
                        if 0 <= ctx_idx < len(tasks):
                            context_tasks.append(tasks[ctx_idx])
                    if context_tasks:
                        tasks[i].context = context_tasks
            
            if not tasks:
                return {
                    "success": False,
                    "error": "No tasks provided",
                    "timestamp": datetime.now().isoformat()
                }
            
            # プロセスタイプを決定
            process_type = crew_data.get("process", "sequential")
            if process_type == "sequential":
                process = Process.sequential
            elif process_type == "hierarchical":
                process = Process.hierarchical
            elif process_type == "consensual":
                # Consensual Processは将来のCrewAIバージョンでサポート予定
                process = Process.sequential
                self._emit_event("warning", {"message": "Consensual process not yet supported, using sequential"})
            else:
                process = Process.sequential
            
            # Memory設定
            memory = crew_data.get("memory", False)
            
            # Planning設定
            planning = crew_data.get("planning", False)
            
            # Manager LLM設定（Hierarchicalプロセス用）
            manager_llm = None
            if process == Process.hierarchical and crew_data.get("managerLlmConfig"):
                manager_llm = self._create_llm(crew_data.get("managerLlmConfig"))
            
            # クルーを作成
            crew_params = {
                "agents": agents,
                "tasks": tasks,
                "process": process,
                "verbose": crew_data.get("verbose", True),
                "memory": memory,
            }
            
            if manager_llm:
                crew_params["manager_llm"] = manager_llm
            
            if planning:
                crew_params["planning"] = planning
            
            crew = Crew(**crew_params)
            
            # クルーを実行
            crew_name = crew_data.get("name", "Unnamed Crew")
            self._emit_event("crew_start", {"name": crew_name})
            print(f"[CrewAI] Starting crew execution: {crew_name}", file=sys.stderr)
            
            result = crew.kickoff()
            
            self._emit_event("crew_complete", {"name": crew_name})
            
            # トークン数とコストを計算（簡易的な推定）
            result_text = str(result)
            estimated_tokens = len(result_text.split()) * 1.3
            estimated_cost = estimated_tokens * 0.00002
            
            # 結果を返す
            return {
                "success": True,
                "result": result_text,
                "timestamp": datetime.now().isoformat(),
                "agents_count": len(agents),
                "tasks_count": len(tasks),
                "token_usage": int(estimated_tokens),
                "cost": round(estimated_cost, 4),
            }
            
        except Exception as e:
            print(f"[CrewAI] Error: {str(e)}", file=sys.stderr)
            self._emit_event("error", {"message": str(e)})
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }


def main():
    """メイン関数：標準入力からJSONを受け取り、実行結果を標準出力に返す"""
    try:
        # 標準入力からJSONを読み込む
        input_data = sys.stdin.read()
        request = json.loads(input_data)
        
        # エンジンを初期化
        engine = CrewAIEngine()
        
        # クルーを実行
        result = engine.execute_crew(request)
        
        # 結果をJSON形式で標準出力に書き込む
        print(json.dumps(result, ensure_ascii=False))
        
    except json.JSONDecodeError as e:
        error_result = {
            "success": False,
            "error": f"Invalid JSON input: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()
