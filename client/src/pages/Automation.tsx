import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

interface GeneratedConfig {
  agents: Array<{
    name: string;
    role: string;
    goal: string;
    backstory: string;
    tools: string[];
    allowDelegation: boolean;
    verbose: boolean;
    // CrewAI完全機能
    memory?: boolean;
    memoryConfig?: {
      shortTerm?: boolean;
      longTerm?: boolean;
      entity?: boolean;
    };
    maxIter?: number;
    maxRpm?: number;
    maxRetryLimit?: number;
    codeExecutionMode?: "safe" | "unsafe";
    knowledgeSources?: string[];
  }>;
  tasks: Array<{
    name: string;
    description: string;
    expectedOutput: string;
    agentIndex: number;
    // CrewAI完全機能
    context?: number[];
    humanInput?: boolean;
    asyncExecution?: boolean;
    outputFile?: string;
    outputPydantic?: Record<string, unknown>;
  }>;
  crew: {
    name: string;
    description: string;
    process: "sequential" | "hierarchical" | "consensual";
    verbose: boolean;
    // CrewAI完全機能
    memory?: boolean;
    planning?: boolean;
    planningLlmConfig?: Record<string, unknown>;
    maxRpm?: number;
    maxExecutionTime?: number;
    managerLlmConfig?: Record<string, unknown>;
  };
}

export default function Automation() {
  const [, navigate] = useLocation();
  const [description, setDescription] = useState("");
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const generateMutation = trpc.automation.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedConfig(data.configuration);
      toast.success("エージェント・タスク・クルーを自動生成しました");
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error(`生成に失敗しました: ${error.message}`);
      setIsGenerating(false);
    },
  });

  const createMutation = trpc.automation.createFromGenerated.useMutation({
    onSuccess: (data) => {
      toast.success(`クルー「${data.crew.name}」を作成しました`);
      setIsCreating(false);
      navigate(`/crews/${data.crew.id}`);
    },
    onError: (error) => {
      toast.error(`作成に失敗しました: ${error.message}`);
      setIsCreating(false);
    },
  });

  const handleGenerate = () => {
    if (description.length < 10) {
      toast.error("説明は10文字以上で入力してください");
      return;
    }

    setIsGenerating(true);
    generateMutation.mutate({ description, language: "ja" });
  };

  const handleCreate = () => {
    if (!generatedConfig) return;

    setIsCreating(true);
    createMutation.mutate(generatedConfig);
  };

  const handleReset = () => {
    setDescription("");
    setGeneratedConfig(null);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">オートメーション作成</h1>
          <p className="text-muted-foreground">
            自然言語で「こんなことがしたい」と入力すると、AIがエージェント・タスク・クルーを自動生成します
          </p>
        </div>

        {!generatedConfig ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                やりたいことを教えてください
              </CardTitle>
              <CardDescription>
                例: 「毎日のニュースを収集して要約し、Notionに保存したい」
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="ここにやりたいことを入力してください..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || description.length < 10}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    自動生成する
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                以下の構成を自動生成しました。内容を確認して、問題なければ「クルーを作成」をクリックしてください。
              </AlertDescription>
            </Alert>

            {/* クルー情報 */}
            <Card>
              <CardHeader>
                <CardTitle>クルー情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-semibold">名前:</span> {generatedConfig.crew.name}
                </div>
                <div>
                  <span className="font-semibold">説明:</span> {generatedConfig.crew.description}
                </div>
                <div>
                  <span className="font-semibold">プロセス:</span>{" "}
                  {generatedConfig.crew.process === "sequential" ? "順次実行" : "階層的実行"}
                </div>
              </CardContent>
            </Card>

            {/* エージェント一覧 */}
            <Card>
              <CardHeader>
                <CardTitle>エージェント ({generatedConfig.agents.length}個)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedConfig.agents.map((agent, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4 space-y-1">
                    <div className="font-semibold">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold">役割:</span> {agent.role}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold">目標:</span> {agent.goal}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold">背景:</span> {agent.backstory}
                    </div>
                    {agent.tools.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold">ツール:</span> {agent.tools.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* タスク一覧 */}
            <Card>
              <CardHeader>
                <CardTitle>タスク ({generatedConfig.tasks.length}個)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedConfig.tasks.map((task, index) => (
                  <div key={index} className="border-l-4 border-secondary pl-4 space-y-1">
                    <div className="font-semibold">{task.name}</div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold">説明:</span> {task.description}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold">期待される出力:</span> {task.expectedOutput}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold">担当エージェント:</span>{" "}
                      {generatedConfig.agents[task.agentIndex]?.name || "不明"}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* アクションボタン */}
            <div className="flex gap-4">
              <Button onClick={handleCreate} disabled={isCreating} className="flex-1">
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    作成中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    クルーを作成
                  </>
                )}
              </Button>
              <Button onClick={handleReset} variant="outline" disabled={isCreating} className="flex-1">
                <XCircle className="mr-2 h-4 w-4" />
                やり直す
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
