import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Play, Eye, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function Executions() {
  const [, setLocation] = useLocation();
  
  const { data: executions, isLoading } = trpc.execution.list.useQuery();
  const { data: crews } = trpc.crew.list.useQuery();

  const getCrewName = (crewId: number) => {
    const crew = crews?.find(c => c.id === crewId);
    return crew?.name || "不明";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            完了
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            失敗
          </Badge>
        );
      case "running":
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            実行中
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            待機中
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">実行履歴</h1>
            <p className="text-muted-foreground mt-2">
              クルーの実行履歴と結果を確認します
            </p>
          </div>
          <Button onClick={() => setLocation("/crews")}>
            <Play className="mr-2 h-4 w-4" />
            クルーを実行
          </Button>
        </div>

        {/* 実行履歴一覧 */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-1/4 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : executions && executions.length > 0 ? (
          <div className="space-y-4">
            {executions.map((execution) => (
              <Card key={execution.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">
                          実行 #{execution.id}
                        </CardTitle>
                        {getStatusBadge(execution.status)}
                      </div>
                      <CardDescription>
                        クルー: {getCrewName(execution.crewId)}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/executions/${execution.id}`)}
                    >
                      <Eye className="mr-2 h-3 w-3" />
                      詳細
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {execution.input && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">入力</p>
                        <p className="text-sm line-clamp-2">{execution.input}</p>
                      </div>
                    )}
                    {execution.output && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">出力</p>
                        <p className="text-sm line-clamp-2">{execution.output}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        開始: {execution.createdAt
                          ? new Date(execution.createdAt).toLocaleString("ja-JP")
                          : "-"}
                      </span>
                      {execution.completedAt && (
                        <span>
                          完了: {new Date(execution.completedAt).toLocaleString("ja-JP")}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Play className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">実行履歴がありません</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                クルーを実行して、結果を確認しましょう
              </p>
              <Button onClick={() => setLocation("/crews")}>
                <Play className="mr-2 h-4 w-4" />
                クルーを実行
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
