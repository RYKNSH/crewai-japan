import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

const crewFormSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  description: z.string().optional(),
  process: z.enum(["sequential", "hierarchical", "consensual"]),
  agentIds: z.array(z.number()).min(1, "少なくとも1つのエージェントを選択してください"),
  taskIds: z.array(z.number()).min(1, "少なくとも1つのタスクを選択してください"),
  // CrewAI完全機能
  memory: z.boolean().default(false),
  planning: z.boolean().default(false),
  planningLlmConfig: z.record(z.string(), z.unknown()).optional(),
  verbose: z.boolean().default(false),
  maxRpm: z.number().min(1).max(1000).optional(),
  maxExecutionTime: z.number().min(1).optional(),
  managerLlmConfig: z.record(z.string(), z.unknown()).optional(),
});

type CrewFormValues = z.infer<typeof crewFormSchema>;

export default function CrewForm() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const isEdit = !!params.id;
  const crewId = params.id ? parseInt(params.id) : undefined;

  const utils = trpc.useUtils();
  const { data: crew, isLoading } = trpc.crew.get.useQuery(
    { id: crewId! },
    { enabled: isEdit && !!crewId }
  );
  const { data: agents } = trpc.agent.list.useQuery();
  const { data: tasks } = trpc.task.list.useQuery();

  const form = useForm<CrewFormValues>({
    resolver: zodResolver(crewFormSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      process: "sequential" as const,
      agentIds: [],
      taskIds: [],
      memory: false,
      planning: false,
      planningLlmConfig: undefined,
      verbose: false,
      maxRpm: undefined,
      maxExecutionTime: undefined,
      managerLlmConfig: undefined,
    },
  });

  useEffect(() => {
    if (crew) {
      form.reset({
        name: crew.name,
        description: crew.description || "",
        process: crew.process as "sequential" | "hierarchical" | "consensual",
        agentIds: crew.agentIds || [],
        taskIds: crew.taskIds || [],
        memory: crew.memory || false,
        planning: crew.planning || false,
        planningLlmConfig: crew.planningLlmConfig || undefined,
        verbose: crew.verbose || false,
        maxRpm: undefined,
        maxExecutionTime: undefined,
        managerLlmConfig: crew.managerLlmConfig || undefined,
      });
    }
  }, [crew, form]);

  const createMutation = trpc.crew.create.useMutation({
    onSuccess: () => {
      utils.crew.list.invalidate();
      toast.success("クルーを作成しました");
      setLocation("/crews");
    },
    onError: (error) => {
      toast.error(`作成に失敗しました: ${error.message}`);
    },
  });

  const updateMutation = trpc.crew.update.useMutation({
    onSuccess: () => {
      utils.crew.list.invalidate();
      toast.success("クルーを更新しました");
      setLocation("/crews");
    },
    onError: (error) => {
      toast.error(`更新に失敗しました: ${error.message}`);
    },
  });

  const onSubmit = (values: CrewFormValues) => {
    if (isEdit && crewId) {
      updateMutation.mutate({ id: crewId, ...values });
    } else {
      createMutation.mutate(values);
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
          <Button variant="ghost" size="icon" onClick={() => setLocation("/crews")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? "クルーを編集" : "クルーを作成"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isEdit
                ? "クルーの設定を変更します"
                : "新しいクルーを作成します"}
            </p>
          </div>
        </div>

        {/* フォーム */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>
                  クルーの名前、説明、実行プロセスを設定します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>名前 *</FormLabel>
                      <FormControl>
                        <Input placeholder="例: マーケティング分析クルー" {...field} />
                      </FormControl>
                      <FormDescription>
                        クルーを識別するための名前
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
                      <FormLabel>説明</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="例: 市場調査と競合分析を行い、包括的なマーケティング戦略を立案するクルー"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        クルーの目的や役割の説明
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="process"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>実行プロセス *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="プロセスを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sequential">
                            順次実行 (Sequential)
                          </SelectItem>
                          <SelectItem value="hierarchical">
                            階層実行 (Hierarchical)
                          </SelectItem>
                          <SelectItem value="consensual">
                            合意形成 (Consensual)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        順次実行: タスクを順番に実行 / 階層実行: マネージャーエージェントがタスクを調整 / 合意形成: エージェントが合意して決定
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>エージェント選択</CardTitle>
                <CardDescription>
                  このクルーに参加するエージェントを選択します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="agentIds"
                  render={() => (
                    <FormItem>
                      <div className="space-y-3">
                        {agents && agents.length > 0 ? (
                          agents.map((agent) => (
                            <FormField
                              key={agent.id}
                              control={form.control}
                              name="agentIds"
                              render={({ field }) => (
                                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(agent.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        const updated = checked
                                          ? [...current, agent.id]
                                          : current.filter((id) => id !== agent.id);
                                        field.onChange(updated);
                                      }}
                                    />
                                  </FormControl>
                                  <div className="flex-1 space-y-1">
                                    <FormLabel className="font-medium">
                                      {agent.name}
                                    </FormLabel>
                                    <FormDescription>
                                      {agent.role} - {agent.goal}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            エージェントがありません。先にエージェントを作成してください。
                          </p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>タスク選択</CardTitle>
                <CardDescription>
                  このクルーが実行するタスクを選択します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="taskIds"
                  render={() => (
                    <FormItem>
                      <div className="space-y-3">
                        {tasks && tasks.length > 0 ? (
                          tasks.map((task) => (
                            <FormField
                              key={task.id}
                              control={form.control}
                              name="taskIds"
                              render={({ field }) => (
                                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(task.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        const updated = checked
                                          ? [...current, task.id]
                                          : current.filter((id) => id !== task.id);
                                        field.onChange(updated);
                                      }}
                                    />
                                  </FormControl>
                                  <div className="flex-1 space-y-1">
                                    <FormLabel className="font-medium">
                                      {task.name}
                                    </FormLabel>
                                    <FormDescription>
                                      {task.description}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            タスクがありません。先にタスクを作成してください。
                          </p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CrewAI完全機能設定</CardTitle>
                <CardDescription>
                  Memory、Planning、その他の高度な設定
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="memory"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Memory機能を有効化</FormLabel>
                        <FormDescription>
                          クルー全体で過去の実行を記憶し、学習できるようにします
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
                  name="planning"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Planning機能を有効化</FormLabel>
                        <FormDescription>
                          実行前にタスクの計画を立て、最適化します
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
                  name="verbose"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>詳細モード</FormLabel>
                        <FormDescription>
                          クルーの実行過程を詳細にログ出力します
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
                  name="maxRpm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>最大RPM (Requests Per Minute)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={1000}
                          placeholder="例: 60"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        1分あたりの最大リクエスト数（任意）
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxExecutionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>最大実行時間（秒）</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="例: 3600"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        クルー実行の最大時間（任意）
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/crews")}
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
      </div>
    </DashboardLayout>
  );
}
