import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle, XCircle, Loader2, Clock, Activity, BarChart3, Download } from "lucide-react";
import { Streamdown } from "streamdown";

export default function ExecutionDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const executionId = parseInt(params.id);

  const { data: execution, isLoading } = trpc.execution.get.useQuery({ id: executionId });
  const { data: traceLogs } = trpc.execution.traceLogs.useQuery({ executionId });
  const { data: metrics } = trpc.execution.metrics.useQuery({ executionId });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "完了";
      case "failed":
        return "失敗";
      case "running":
        return "実行中";
      default:
        return "待機中";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!execution) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-lg font-semibold mb-2">実行が見つかりません</h3>
            <Button onClick={() => setLocation("/executions")}>
              実行履歴に戻る
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/executions")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">実行 #{execution.id}</h1>
              {getStatusIcon(execution.status)}
              <Badge variant={execution.status === "completed" ? "default" : "secondary"}>
                {getStatusText(execution.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2">
              開始: {execution.createdAt
                ? new Date(execution.createdAt).toLocaleString("ja-JP")
                : "-"}
            </p>
          </div>
        </div>

        {/* タブ */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="trace">
              <Activity className="mr-2 h-4 w-4" />
              トレーシング
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <BarChart3 className="mr-2 h-4 w-4" />
              メトリクス
            </TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview" className="space-y-4">
            {execution.input && (
              <Card>
                <CardHeader>
                  <CardTitle>入力</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{execution.input}</p>
                </CardContent>
              </Card>
            )}

            {execution.output && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>出力</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const blob = new Blob([execution.output || ""], { type: "text/markdown" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `execution-${execution.id}-output.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      ダウンロード
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Streamdown>{execution.output}</Streamdown>
                </CardContent>
              </Card>
            )}

            {execution.error && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">エラー</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive whitespace-pre-wrap">
                    {execution.error}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>実行情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">クルーID:</span>
                  <span className="font-medium">{execution.crewId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ステータス:</span>
                  <span className="font-medium">{getStatusText(execution.status)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">開始時刻:</span>
                  <span className="font-medium">
                    {execution.createdAt
                      ? new Date(execution.createdAt).toLocaleString("ja-JP")
                      : "-"}
                  </span>
                </div>
                {execution.completedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">完了時刻:</span>
                    <span className="font-medium">
                      {new Date(execution.completedAt).toLocaleString("ja-JP")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* トレーシングタブ */}
          <TabsContent value="trace" className="space-y-4">
            {traceLogs && traceLogs.length > 0 ? (
              <div className="space-y-3">
                {traceLogs.map((log) => (
                  <Card key={log.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{log.eventType}</CardTitle>
                        <Badge variant="outline">
                          {log.timestamp
                            ? new Date(log.timestamp).toLocaleTimeString("ja-JP")
                            : "-"}
                        </Badge>
                      </div>
                      {log.agentId && (
                        <CardDescription>エージェントID: {log.agentId}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{log.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">トレースログがありません</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    実行が開始されると、リアルタイムでログが表示されます
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* メトリクスタブ */}
          <TabsContent value="metrics" className="space-y-4">
            {metrics && metrics.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">トークン使用量</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics[0].tokenUsage.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground mt-1">トークン</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">実行時間</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(metrics[0].executionTime / 1000).toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground mt-1">秒</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">コスト</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics[0].cost.toFixed(4)}</div>
                    <p className="text-sm text-muted-foreground mt-1">USD</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">成功率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(metrics[0].successRate * 100).toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground mt-1">成功率</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">メトリクスがありません</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    実行が完了すると、パフォーマンスメトリクスが表示されます
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
