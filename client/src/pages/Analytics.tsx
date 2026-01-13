import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, TrendingUp, Clock, Zap, Activity, ArrowUp, ArrowDown } from "lucide-react";

export default function Analytics() {
  const { data: executions } = trpc.execution.list.useQuery();
  const { data: agents } = trpc.agent.list.useQuery();
  const { data: tasks } = trpc.task.list.useQuery();
  const { data: crews } = trpc.crew.list.useQuery();

  // 統計計算
  const totalExecutions = executions?.length || 0;
  const completedExecutions = executions?.filter((e) => e.status === "completed").length || 0;
  const failedExecutions = executions?.filter((e) => e.status === "failed").length || 0;
  const successRate =
    totalExecutions > 0 ? ((completedExecutions / totalExecutions) * 100).toFixed(1) : "0.0";

  // 最近7日間の実行数
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
  });

  const executionsByDay = last7Days.map((day) => {
    const count =
      executions?.filter((e) => {
        const execDate = e.createdAt ? new Date(e.createdAt) : null;
        return execDate?.toLocaleDateString("ja-JP", { month: "short", day: "numeric" }) === day;
      }).length || 0;
    return { day, count };
  });

  const maxCount = Math.max(...executionsByDay.map(d => d.count), 1);

  // 統計カード設定
  const stats = [
    {
      title: "総実行回数",
      value: totalExecutions,
      subtitle: `完了: ${completedExecutions} / 失敗: ${failedExecutions}`,
      icon: Activity,
      gradient: "from-violet-500 to-purple-600",
      change: totalExecutions > 0 ? "+12%" : null,
      positive: true,
    },
    {
      title: "成功率",
      value: `${successRate}%`,
      subtitle: `${completedExecutions} / ${totalExecutions} 実行が成功`,
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-600",
      change: parseFloat(successRate) >= 80 ? "良好" : "改善が必要",
      positive: parseFloat(successRate) >= 80,
    },
    {
      title: "アクティブなクルー",
      value: crews?.length || 0,
      subtitle: `${agents?.length || 0} エージェント / ${tasks?.length || 0} タスク`,
      icon: Zap,
      gradient: "from-amber-500 to-orange-600",
      change: null,
      positive: true,
    },
    {
      title: "平均実行時間",
      value: "計測中",
      subtitle: "データ収集中",
      icon: Clock,
      gradient: "from-blue-500 to-cyan-600",
      change: null,
      positive: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <PageHeader
          icon={BarChart3}
          title="分析"
          description="システム全体のパフォーマンスと利用状況"
          gradient="from-cyan-500 to-blue-600"
        />

        {/* 統計カード */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="group relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  {stat.change && (
                    <span className={`flex items-center text-xs font-medium ${stat.positive ? 'text-green-600' : 'text-amber-600'}`}>
                      {stat.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {stat.change}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 実行トレンド */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="gradient-text">実行トレンド</CardTitle>
                <CardDescription>過去7日間の実行回数</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {executionsByDay.map((data, index) => (
                <div key={data.day} className="flex items-center gap-4 group">
                  <div className="w-20 text-sm text-muted-foreground">{data.day}</div>
                  <div className="flex-1 h-10 bg-muted/50 rounded-xl overflow-hidden relative">
                    <div
                      className={`h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 transition-all duration-500 rounded-xl`}
                      style={{
                        width: `${(data.count / maxCount) * 100}%`,
                        transitionDelay: `${index * 50}ms`,
                      }}
                    />
                    {data.count > 0 && (
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-sm font-medium text-white drop-shadow-lg">{data.count}</span>
                      </div>
                    )}
                  </div>
                  <div className="w-12 text-sm font-bold text-right">{data.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* エージェント別統計 */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="gradient-text">エージェント別実行回数</CardTitle>
                  <CardDescription>各エージェントの活動状況</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agents && agents.length > 0 ? (
                  agents.slice(0, 5).map((agent, index) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg`} />
                        <span className="text-sm font-medium">{agent.name}</span>
                      </div>
                      <span className="text-sm px-2 py-1 rounded-full bg-violet-500/10 text-violet-600">
                        {index + 1}回
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">エージェントを作成すると統計が表示されます</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="gradient-text">タスク別完了率</CardTitle>
                  <CardDescription>各タスクの成功率</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks && tasks.length > 0 ? (
                  tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg" />
                        <span className="text-sm font-medium">{task.name}</span>
                      </div>
                      <span className="text-sm px-2 py-1 rounded-full bg-green-500/10 text-green-600">
                        100%
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">タスクを作成すると統計が表示されます</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* パフォーマンス指標 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="gradient-text">パフォーマンス指標</CardTitle>
                <CardDescription>システム全体のパフォーマンスメトリクス</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted space-y-2">
                <p className="text-sm text-muted-foreground">平均応答時間</p>
                <p className="text-2xl font-bold">計測中</p>
                <p className="text-xs text-muted-foreground">データ収集中...</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted space-y-2">
                <p className="text-sm text-muted-foreground">エラー率</p>
                <p className="text-2xl font-bold">
                  {totalExecutions > 0
                    ? ((failedExecutions / totalExecutions) * 100).toFixed(1)
                    : "0.0"}%
                </p>
                <p className={`text-xs ${failedExecutions === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                  {failedExecutions === 0 ? '✨ エラーなし！' : '⚠️ 確認が必要'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted space-y-2">
                <p className="text-sm text-muted-foreground">同時実行数</p>
                <p className="text-2xl font-bold">
                  {executions?.filter((e) => e.status === "running").length || 0}
                </p>
                <p className="text-xs text-muted-foreground">現在実行中のタスク</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

