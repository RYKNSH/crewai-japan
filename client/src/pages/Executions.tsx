import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Play, Eye, Clock, CheckCircle, XCircle, Loader2, History } from "lucide-react";

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
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">
            <CheckCircle className="mr-1 h-3 w-3" />
            完了
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0">
            <XCircle className="mr-1 h-3 w-3" />
            失敗
          </Badge>
        );
      case "running":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            実行中
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0">
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
        <PageHeader
          icon={History}
          title="実行履歴"
          description="クルーの実行履歴と結果を確認"
          gradient="from-indigo-500 to-blue-600"
          actionLabel="クルーを実行"
          onAction={() => setLocation("/crews")}
        />

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
            {executions.map((execution, index) => (
              <Card key={execution.id} className="group relative overflow-hidden">
                {/* タイムラインライン */}
                {index < executions.length - 1 && (
                  <div className="absolute left-8 top-full w-0.5 h-4 bg-gradient-to-b from-border to-transparent" />
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* タイムラインドット */}
                      <div className={`h-4 w-4 rounded-full shadow-lg ${execution.status === "completed" ? "bg-green-500 shadow-green-500/30" :
                          execution.status === "failed" ? "bg-red-500 shadow-red-500/30" :
                            execution.status === "running" ? "bg-blue-500 shadow-blue-500/30 animate-pulse" :
                              "bg-amber-500 shadow-amber-500/30"
                        }`} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">
                            実行 #{execution.id}
                          </CardTitle>
                          {getStatusBadge(execution.status)}
                        </div>
                        <CardDescription>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-xs">
                            {getCrewName(execution.crewId)}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setLocation(`/executions/${execution.id}`)}
                    >
                      <Eye className="mr-2 h-3 w-3" />
                      詳細
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 pl-8">
                    {execution.input && (
                      <div className="p-3 rounded-xl bg-muted/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">📥 入力</p>
                        <p className="text-sm line-clamp-2">{execution.input}</p>
                      </div>
                    )}
                    {execution.output && (
                      <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                        <p className="text-xs font-medium text-green-600 mb-1">📤 出力</p>
                        <p className="text-sm line-clamp-2">{execution.output}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        開始: {execution.createdAt
                          ? new Date(execution.createdAt).toLocaleString("ja-JP")
                          : "-"}
                      </span>
                      {execution.completedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
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
            <CardContent className="p-0">
              <EmptyState
                emoji="🚀"
                title="最初のAIタスクを実行しよう！"
                description="クルーを実行して、AIチームが協力して作業する様子を確認しましょう。実行結果はここに表示されます。"
                gradient="from-indigo-500 to-blue-600"
                primaryAction={{
                  label: "🎯 クルーを実行",
                  onClick: () => setLocation("/crews"),
                }}
                secondaryAction={{
                  label: "📖 ガイドを見る",
                  onClick: () => { },
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

