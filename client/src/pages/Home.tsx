import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, ListTodo, UsersRound, Play, TrendingUp, Clock } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { data: agents } = trpc.agent.list.useQuery();
  const { data: tasks } = trpc.task.list.useQuery();
  const { data: crews } = trpc.crew.list.useQuery();
  const { data: executions } = trpc.execution.list.useQuery();

  const stats = [
    {
      title: "エージェント",
      value: agents?.length || 0,
      icon: Users,
      description: "登録されているエージェント数",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "タスク",
      value: tasks?.length || 0,
      icon: ListTodo,
      description: "作成されたタスク数",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "クルー",
      value: crews?.length || 0,
      icon: UsersRound,
      description: "編成されたクルー数",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "実行履歴",
      value: executions?.length || 0,
      icon: Play,
      description: "総実行回数",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const recentExecutions = executions?.slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ヘッダー */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-muted-foreground mt-2">
            ようこそ、{user?.name || "ユーザー"}さん。CrewAI Japanへようこそ。
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* クイックアクション */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                クイックスタート
              </CardTitle>
              <CardDescription>
                CrewAI Japanを使い始めるための基本的なステップ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">エージェントを作成</p>
                    <p className="text-sm text-muted-foreground">
                      役割、目標、バックストーリーを設定してエージェントを作成します
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">タスクを定義</p>
                    <p className="text-sm text-muted-foreground">
                      実行したいタスクの内容と期待される出力を定義します
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">クルーを編成</p>
                    <p className="text-sm text-muted-foreground">
                      エージェントとタスクを組み合わせてクルーを編成します
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    4
                  </div>
                  <div>
                    <p className="font-medium">実行して結果を確認</p>
                    <p className="text-sm text-muted-foreground">
                      クルーを実行してリアルタイムでトレーシングを確認します
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                最近の実行履歴
              </CardTitle>
              <CardDescription>
                最近実行されたクルーの履歴
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentExecutions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>まだ実行履歴がありません</p>
                  <p className="text-sm mt-1">クルーを作成して実行してみましょう</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExecutions.map((execution) => (
                    <div
                      key={execution.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            execution.status === "completed"
                              ? "bg-green-500"
                              : execution.status === "failed"
                              ? "bg-red-500"
                              : execution.status === "running"
                              ? "bg-blue-500 animate-pulse"
                              : "bg-gray-400"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium">実行 #{execution.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {execution.createdAt
                              ? new Date(execution.createdAt).toLocaleString("ja-JP")
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-medium">
                        {execution.status === "completed"
                          ? "完了"
                          : execution.status === "failed"
                          ? "失敗"
                          : execution.status === "running"
                          ? "実行中"
                          : "待機中"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
