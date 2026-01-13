import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Pencil, Trash2, ListTodo } from "lucide-react";
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

export default function Tasks() {
  const [, setLocation] = useLocation();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: tasks, isLoading } = trpc.task.list.useQuery();
  const { data: agents } = trpc.agent.list.useQuery();

  const deleteMutation = trpc.task.delete.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate();
      toast.success("タスクを削除しました");
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const getAgentName = (agentId: number | null) => {
    if (!agentId) return "未割り当て";
    const agent = agents?.find(a => a.id === agentId);
    return agent?.name || "不明";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <PageHeader
          icon={ListTodo}
          title="タスク"
          description="エージェントが実行する作業を定義・管理"
          gradient="from-fuchsia-500 to-pink-600"
          actionLabel="新規作成"
          onAction={() => setLocation("/tasks/new")}
        />

        {/* タスク一覧 */}
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
        ) : tasks && tasks.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Card key={task.id} className="group relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <ListTodo className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{task.name}</CardTitle>
                        <CardDescription className="mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 text-xs">
                            {getAgentName(task.agentId)}
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
                      <p className="text-sm line-clamp-2">{task.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        期待される出力
                      </p>
                      <p className="text-sm line-clamp-2">{task.expectedOutput}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setLocation(`/tasks/${task.id}/edit`)}
                      >
                        <Pencil className="mr-2 h-3 w-3" />
                        編集
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(task.id)}
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
                emoji="📋"
                title="最初のタスクを作成しよう！"
                description="AIエージェントに何をしてほしいですか？タスクを作成して、エージェントに実行させる作業を定義しましょう。"
                gradient="from-fuchsia-500 to-pink-600"
                primaryAction={{
                  label: "✨ 今すぐ作成",
                  onClick: () => setLocation("/tasks/new"),
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
            <AlertDialogTitle>タスクを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。タスクを削除すると、関連するデータもすべて削除されます。
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

