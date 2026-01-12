import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, ListTodo } from "lucide-react";
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">タスク</h1>
            <p className="text-muted-foreground mt-2">
              エージェントが実行するタスクを作成・管理します
            </p>
          </div>
          <Button onClick={() => setLocation("/tasks/new")}>
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Button>
        </div>

        {/* タスク一覧 */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-50">
                        <ListTodo className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{task.name}</CardTitle>
                        <CardDescription className="mt-1">
                          担当: {getAgentName(task.agentId)}
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
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">タスクがありません</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                最初のタスクを作成して、エージェントに実行させる作業を定義しましょう
              </p>
              <Button onClick={() => setLocation("/tasks/new")}>
                <Plus className="mr-2 h-4 w-4" />
                タスクを作成
              </Button>
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
