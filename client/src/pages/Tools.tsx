import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, Wrench, ExternalLink } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Tools() {
  const [, setLocation] = useLocation();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTool, setNewTool] = useState<{
    name: string;
    description: string;
    type: "builtin" | "custom" | "mcp";
    config: Record<string, unknown>;
  }>({
    name: "",
    description: "",
    type: "custom",
    config: {},
  });

  const utils = trpc.useUtils();
  const { data: tools, isLoading } = trpc.tool.list.useQuery();

  const deleteMutation = trpc.tool.delete.useMutation({
    onSuccess: () => {
      utils.tool.list.invalidate();
      toast.success("ツールを削除しました");
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`削除に失敗しました: ${error.message}`);
    },
  });

  const createMutation = trpc.tool.create.useMutation({
    onSuccess: () => {
      utils.tool.list.invalidate();
      toast.success("ツールを作成しました");
      setIsCreateDialogOpen(false);
      setNewTool({ name: "", description: "", type: "custom", config: {} });
    },
    onError: (error) => {
      toast.error(`作成に失敗しました: ${error.message}`);
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const handleCreate = () => {
    createMutation.mutate(newTool);
  };

  const getToolTypeBadge = (type: string) => {
    switch (type) {
      case "builtin":
        return <Badge variant="default">組み込み</Badge>;
      case "mcp":
        return <Badge variant="secondary">MCP</Badge>;
      case "custom":
        return <Badge variant="outline">カスタム</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  // 組み込みツールの例
  const builtinTools = [
    {
      name: "Gmail",
      description: "Gmailの送受信、検索、ラベル管理",
      type: "builtin",
      icon: "📧",
    },
    {
      name: "Google Calendar",
      description: "カレンダーイベントの作成、更新、検索",
      type: "builtin",
      icon: "📅",
    },
    {
      name: "Notion",
      description: "ページ作成、データベース操作、コンテンツ管理",
      type: "builtin",
      icon: "📝",
    },
    {
      name: "Web Search",
      description: "インターネット検索とWebスクレイピング",
      type: "builtin",
      icon: "🔍",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ツール</h1>
            <p className="text-muted-foreground mt-2">
              エージェントが使用できるツールを管理します
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                カスタムツール追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>カスタムツールを追加</DialogTitle>
                <DialogDescription>
                  新しいカスタムツールを作成します
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">名前</Label>
                  <Input
                    id="name"
                    placeholder="例: Slack通知"
                    value={newTool.name}
                    onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    placeholder="例: Slackチャンネルにメッセージを送信"
                    value={newTool.description}
                    onChange={(e) =>
                      setNewTool({ ...newTool, description: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  作成
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 組み込みツール */}
        <div>
          <h2 className="text-xl font-semibold mb-4">組み込みツール</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {builtinTools.map((tool, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{tool.icon}</div>
                      <div>
                        <CardTitle className="text-base">{tool.name}</CardTitle>
                        {getToolTypeBadge(tool.type)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                  <Button variant="outline" size="sm" className="w-full mt-4" disabled>
                    設定済み
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* カスタムツール */}
        <div>
          <h2 className="text-xl font-semibold mb-4">カスタムツール</h2>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tools && tools.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-50">
                          <Wrench className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{tool.name}</CardTitle>
                          {getToolTypeBadge(tool.type)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => toast.info("設定機能は近日公開予定です")}
                        >
                          <Pencil className="mr-2 h-3 w-3" />
                          設定
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(tool.id)}
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
                <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">カスタムツールがありません</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                  カスタムツールを追加して、エージェントの機能を拡張しましょう
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  カスタムツール追加
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* MCP統合の案内 */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              MCP (Model Context Protocol) 統合
            </CardTitle>
            <CardDescription>
              MCPプロトコルを使用して、外部サービスとの統合を簡単に実現
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              MCPを使用すると、Notion、Gmail、Google
              Calendarなどのサービスと直接連携できます。
              エージェントは自動的にこれらのツールを使用して、タスクを実行します。
            </p>
            <Button variant="outline" onClick={() => toast.info("MCP設定機能は近日公開予定です")}>
              MCP設定を開く
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ツールを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。ツールを削除すると、このツールを使用しているエージェントに影響が出る可能性があります。
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
