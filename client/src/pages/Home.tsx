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
      gradient: "from-violet-500 to-purple-600",
    },
    {
      title: "タスク",
      value: tasks?.length || 0,
      icon: ListTodo,
      description: "作成されたタスク数",
      gradient: "from-fuchsia-500 to-pink-600",
    },
    {
      title: "クルー",
      value: crews?.length || 0,
      icon: UsersRound,
      description: "編成されたクルー数",
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      title: "実行履歴",
      value: executions?.length || 0,
      icon: Play,
      description: "総実行回数",
      gradient: "from-indigo-500 to-blue-600",
    },
  ];

  const recentExecutions = executions?.slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ヒーローヘッダー */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdi0ySDEweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">おかえりなさい、{user?.name || "ユーザー"}さん 👋</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">今日もAIチームがお手伝い</h1>
              <p className="mt-2 text-white/80">
                あなたの業務をサポートする準備が整っています
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-5 py-2.5 bg-white text-purple-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
                🚀 新しいタスクを作成
              </button>
              <button className="px-5 py-2.5 bg-white/20 text-white font-medium rounded-xl backdrop-blur-sm hover:bg-white/30 transition-all duration-200">
                📚 テンプレートを見る
              </button>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* クイックアクション */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 bg-gradient-to-br from-card to-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="gradient-text">クイックスタート</span>
              </CardTitle>
              <CardDescription>
                CrewAI Japanを使い始めるための基本的なステップ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-4 p-3 rounded-xl bg-background/60 backdrop-blur-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-semibold shadow-md">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">エージェントを作成</p>
                    <p className="text-sm text-muted-foreground">
                      役割、目標、バックストーリーを設定
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-xl bg-background/60 backdrop-blur-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white text-sm font-semibold shadow-md">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">タスクを定義</p>
                    <p className="text-sm text-muted-foreground">
                      実行したいタスクの内容と期待される出力を定義
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-xl bg-background/60 backdrop-blur-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm font-semibold shadow-md">
                    3
                  </div>
                  <div>
                    <p className="font-semibold">クルーを編成</p>
                    <p className="text-sm text-muted-foreground">
                      エージェントとタスクを組み合わせてクルーを編成
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-xl bg-background/60 backdrop-blur-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-sm font-semibold shadow-md">
                    4
                  </div>
                  <div>
                    <p className="font-semibold">実行して結果を確認</p>
                    <p className="text-sm text-muted-foreground">
                      クルーを実行してリアルタイムでトレーシングを確認
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="gradient-text">最近の実行履歴</span>
              </CardTitle>
              <CardDescription>
                最近実行されたクルーの履歴
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentExecutions.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <div className="rounded-2xl bg-gradient-to-br from-muted/50 to-muted p-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <p className="font-semibold text-lg">最初の一歩を踏み出しましょう！</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      デモを体験して、AIチームの力を実感してください
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
                      ✨ デモを体験
                    </button>
                    <button className="px-5 py-2.5 border border-border text-foreground font-medium rounded-xl hover:bg-accent transition-all duration-200">
                      📖 ガイドを見る
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExecutions.map((execution) => (
                    <div
                      key={execution.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full shadow-lg ${execution.status === "completed"
                            ? "bg-green-500 shadow-green-500/30"
                            : execution.status === "failed"
                              ? "bg-red-500 shadow-red-500/30"
                              : execution.status === "running"
                                ? "bg-blue-500 shadow-blue-500/30 animate-pulse"
                                : "bg-gray-400"
                            }`}
                        />
                        <div>
                          <p className="text-sm font-semibold">実行 #{execution.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {execution.createdAt
                              ? new Date(execution.createdAt).toLocaleString("ja-JP")
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className={`text-xs font-semibold px-3 py-1.5 rounded-full ${execution.status === "completed"
                        ? "bg-green-500/10 text-green-600"
                        : execution.status === "failed"
                          ? "bg-red-500/10 text-red-600"
                          : execution.status === "running"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-gray-500/10 text-gray-600"
                        }`}>
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
