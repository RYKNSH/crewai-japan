import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

const taskFormSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  description: z.string().min(1, "説明は必須です"),
  expectedOutput: z.string().min(1, "期待される出力は必須です"),
  agentId: z.string().optional(),
  // CrewAI完全機能
  context: z.array(z.number()).optional(), // Task Dependencies
  humanInput: z.boolean().default(false),
  asyncExecution: z.boolean().default(false),
  outputFile: z.string().optional(),
  outputPydantic: z.record(z.string(), z.unknown()).optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function TaskForm() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const isEdit = !!params.id;
  const taskId = params.id ? parseInt(params.id) : undefined;

  const utils = trpc.useUtils();
  const { data: task, isLoading } = trpc.task.get.useQuery(
    { id: taskId! },
    { enabled: isEdit && !!taskId }
  );
  const { data: agents } = trpc.agent.list.useQuery();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      expectedOutput: "",
      agentId: undefined,
      context: [],
      humanInput: false,
      asyncExecution: false,
      outputFile: undefined,
      outputPydantic: undefined,
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        name: task.name,
        description: task.description,
        expectedOutput: task.expectedOutput || "",
        agentId: task.agentId !== null ? task.agentId.toString() : undefined,
        context: task.context || [],
        humanInput: task.humanInput || false,
        asyncExecution: task.asyncExecution || false,
        outputFile: task.outputFile || undefined,
        outputPydantic: task.outputPydantic || undefined,
      });
    }
  }, [task, form]);

  const createMutation = trpc.task.create.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate();
      toast.success("タスクを作成しました");
      setLocation("/tasks");
    },
    onError: (error) => {
      toast.error(`作成に失敗しました: ${error.message}`);
    },
  });

  const updateMutation = trpc.task.update.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate();
      toast.success("タスクを更新しました");
      setLocation("/tasks");
    },
    onError: (error) => {
      toast.error(`更新に失敗しました: ${error.message}`);
    },
  });

  const onSubmit = (values: TaskFormValues) => {
    const data = {
      ...values,
      agentId: values.agentId && values.agentId !== "__none__" ? parseInt(values.agentId) : undefined,
      context: values.context || [],
      humanInput: values.humanInput || false,
      asyncExecution: values.asyncExecution || false,
      outputFile: values.outputFile || undefined,
      outputPydantic: values.outputPydantic || undefined,
    };

    if (isEdit && taskId) {
      updateMutation.mutate({ id: taskId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isLoading) {
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

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* ヘッダー */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/tasks")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? "タスクを編集" : "タスクを作成"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isEdit
                ? "タスクの設定を変更します"
                : "新しいタスクを作成します"}
            </p>
          </div>
        </div>

        {/* フォーム */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>
              タスクの名前、説明、期待される出力を設定します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>名前 *</FormLabel>
                      <FormControl>
                        <Input placeholder="例: 市場調査レポート作成" {...field} />
                      </FormControl>
                      <FormDescription>
                        タスクを識別するための名前
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>説明 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="例: 最新の市場トレンドを調査し、競合分析を含む包括的なレポートを作成する"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        タスクの詳細な説明
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedOutput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>期待される出力 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="例: 市場規模、成長率、主要プレイヤー、トレンド分析を含む10ページ以上のレポート"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        タスク完了時に期待される成果物の説明
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>担当エージェント</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="エージェントを選択（任意）" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">未割り当て</SelectItem>
                          {agents?.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id.toString()}>
                              {agent.name} - {agent.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        このタスクを担当するエージェント（クルー作成時に設定することもできます）
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-medium">CrewAI完全機能設定</h3>

                  <FormField
                    control={form.control}
                    name="humanInput"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Human-in-the-loopを有効化</FormLabel>
                          <FormDescription>
                            タスク実行前に人間の承認を必要とします
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="asyncExecution"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>非同期実行を有効化</FormLabel>
                          <FormDescription>
                            タスクを非同期で実行し、他のタスクと並行処理します
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="outputFile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>出力ファイルパス</FormLabel>
                        <FormControl>
                          <Input placeholder="例: /output/report.md" {...field} />
                        </FormControl>
                        <FormDescription>
                          タスクの出力を保存するファイルパス（任意）
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/tasks")}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "更新" : "作成"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
