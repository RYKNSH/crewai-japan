import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Pencil, Trash2, UsersRound, Play } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Crews() {
  const [, setLocation] = useLocation();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: crews, isLoading } = trpc.crew.list.useQuery();

  const deleteMutation = trpc.crew.delete.useMutation({
    onSuccess: () => {
      utils.crew.list.invalidate();
      toast.success("クルーを削除しました");
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const handleExecute = (crewId: number) => {
    setLocation(`/executions/new?crewId=${crewId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <PageHeader
          icon={UsersRound}
          title="クルー"
          description="エージェントとタスクを組み合わせてチームを編成"
          gradient="from-purple-500 to-indigo-600"
          actionLabel="新規作成"
          onAction={() => setLocation("/crews/new")}
        />

        {/* クルー一覧 */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : crews && crews.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {crews.map((crew) => (
              <Card key={crew.id} className="group relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <UsersRound className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{crew.name}</CardTitle>
                        <CardDescription className="mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${crew.process === "sequential"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-amber-500/10 text-amber-600"
                            }`}>
                            {crew.process === "sequential" ? "順次実行" : "階層実行"}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">説明</p>
                      <p className="text-sm line-clamp-2">{crew.description || "説明なし"}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="bg-violet-500/10 text-violet-600">
                        🤖 エージェント: {crew.agentIds?.length || 0}
                      </Badge>
                      <Badge variant="secondary" className="bg-fuchsia-500/10 text-fuchsia-600">
                        📋 タスク: {crew.taskIds?.length || 0}
                      </Badge>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                        onClick={() => handleExecute(crew.id)}
                      >
                        <Play className="mr-2 h-3 w-3" />
                        実行
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/crews/${crew.id}/edit`)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(crew.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
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
                emoji="👥"
                title="最初のAIチームを編成しよう！"
                description="エージェントとタスクを組み合わせて、協力して働くAIチームを作りましょう。複数のエージェントが連携して複雑な作業もこなします。"
                gradient="from-purple-500 to-indigo-600"
                primaryAction={{
                  label: "✨ 今すぐ作成",
                  onClick: () => setLocation("/crews/new"),
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

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>クルーを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。クルーを削除すると、関連するデータもすべて削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

