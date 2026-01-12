import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, TrendingUp, Clock, DollarSign, Zap, Activity } from "lucide-react";

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">分析</h1>
          <p className="text-muted-foreground mt-2">
            システム全体のパフォーマンスと利用状況を確認します
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総実行回数</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExecutions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                完了: {completedExecutions} / 失敗: {failedExecutions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">成功率</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedExecutions} / {totalExecutions} 実行が成功
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">アクティブなクルー</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crews?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {agents?.length || 0} エージェント / {tasks?.length || 0} タスク
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均実行時間</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-1">データ収集中</p>
            </CardContent>
          </Card>
        </div>

        {/* 実行トレンド */}
        <Card>
          <CardHeader>
            <CardTitle>実行トレンド（過去7日間）</CardTitle>
            <CardDescription>日別の実行回数を表示します</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {executionsByDay.map((data) => (
                <div key={data.day} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-muted-foreground">{data.day}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{
                          width: `${totalExecutions > 0 ? (data.count / totalExecutions) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-sm font-medium text-right">{data.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* エージェント別統計 */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>エージェント別実行回数</CardTitle>
              <CardDescription>各エージェントの活動状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agents && agents.length > 0 ? (
                  agents.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">{agent.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">-</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">データがありません</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>タスク別完了率</CardTitle>
              <CardDescription>各タスクの成功率</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks && tasks.length > 0 ? (
                  tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">{task.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">-</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">データがありません</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* コスト分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              コスト分析
            </CardTitle>
            <CardDescription>API使用量とコストの内訳</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">総トークン使用量</p>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">データ収集中</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">推定コスト</p>
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-xs text-muted-foreground">今月の累計</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">平均コスト/実行</p>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">データ収集中</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* パフォーマンス指標 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              パフォーマンス指標
            </CardTitle>
            <CardDescription>システム全体のパフォーマンスメトリクス</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">平均応答時間</span>
                <span className="text-sm text-muted-foreground">データ収集中</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">エラー率</span>
                <span className="text-sm text-muted-foreground">
                  {totalExecutions > 0
                    ? ((failedExecutions / totalExecutions) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">同時実行数</span>
                <span className="text-sm text-muted-foreground">
                  {executions?.filter((e) => e.status === "running").length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
