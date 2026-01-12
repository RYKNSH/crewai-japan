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
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const agentFormSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  role: z.string().min(1, "役割は必須です"),
  goal: z.string().min(1, "目標は必須です"),
  backstory: z.string().min(1, "バックストーリーは必須です"),
  allowDelegation: z.boolean().default(true),
  verbose: z.boolean().default(false),
  // CrewAI完全機能
  memory: z.boolean().default(false),
  memoryConfig: z.object({
    shortTerm: z.boolean().default(true),
    longTerm: z.boolean().default(false),
    entity: z.boolean().default(false),
  }).optional(),
  maxIter: z.number().min(1).max(100).default(15),
  maxRpm: z.number().min(1).max(1000).optional(),
  maxRetryLimit: z.number().min(0).max(10).default(2),
  codeExecutionMode: z.enum(["safe", "unsafe"]).default("safe"),
  knowledgeSources: z.array(z.string()).optional(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

export default function AgentForm() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const isEdit = !!params.id;
  const agentId = params.id ? parseInt(params.id) : undefined;

  const utils = trpc.useUtils();
  const { data: agent, isLoading } = trpc.agent.get.useQuery(
    { id: agentId! },
    { enabled: isEdit && !!agentId }
  );

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema) as any,
    defaultValues: {
      name: "",
      role: "",
      goal: "",
      backstory: "",
      allowDelegation: true,
      verbose: false,
      memory: false,
      memoryConfig: {
        shortTerm: true,
        longTerm: false,
        entity: false,
      },
      maxIter: 15,
      maxRpm: undefined,
      maxRetryLimit: 2,
      codeExecutionMode: "safe" as const,
      knowledgeSources: [],
    },
  });

  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name,
        role: agent.role,
        goal: agent.goal,
        backstory: agent.backstory,
        allowDelegation: agent.allowDelegation,
        verbose: agent.verbose,
        memory: agent.memory || false,
        memoryConfig: agent.memoryConfig || { shortTerm: true, longTerm: false, entity: false },
        maxIter: agent.maxIter || 15,
        maxRpm: agent.maxRpm || undefined,
        maxRetryLimit: agent.maxRetryLimit || 2,
        codeExecutionMode: agent.codeExecutionMode || "safe",
        knowledgeSources: agent.knowledgeSources || [],
      });
    }
  }, [agent, form]);

  const createMutation = trpc.agent.create.useMutation({
    onSuccess: () => {
      utils.agent.list.invalidate();
      toast.success("エージェントを作成しました");
      setLocation("/agents");
    },
    onError: (error) => {
      toast.error(`作成に失敗しました: ${error.message}`);
    },
  });

  const updateMutation = trpc.agent.update.useMutation({
    onSuccess: () => {
      utils.agent.list.invalidate();
      toast.success("エージェントを更新しました");
      setLocation("/agents");
    },
    onError: (error) => {
      toast.error(`更新に失敗しました: ${error.message}`);
    },
  });

  const onSubmit = (values: AgentFormValues) => {
    if (isEdit && agentId) {
      updateMutation.mutate({ id: agentId, ...values });
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
          <Button variant="ghost" size="icon" onClick={() => setLocation("/agents")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? "エージェントを編集" : "エージェントを作成"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isEdit
                ? "エージェントの設定を変更します"
                : "新しいAIエージェントを作成します"}
            </p>
          </div>
        </div>

        {/* フォーム */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>
              エージェントの名前、役割、目標、バックストーリーを設定します
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
                        <Input placeholder="例: マーケティングエージェント" {...field} />
                      </FormControl>
                      <FormDescription>
                        エージェントを識別するための名前
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>役割 *</FormLabel>
                      <FormControl>
                        <Input placeholder="例: マーケティング戦略アナリスト" {...field} />
                      </FormControl>
                      <FormDescription>
                        エージェントが担当する役割や専門分野
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>目標 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="例: 効果的なマーケティング戦略を立案し、ターゲットオーディエンスに最適なアプローチを提案する"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        エージェントが達成すべき目標
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backstory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>バックストーリー *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="例: 10年以上のマーケティング経験を持つベテランアナリスト。データ分析とクリエイティブな戦略立案の両方に精通している。"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        エージェントの背景や経験（AIの振る舞いに影響します）
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-medium">詳細設定</h3>

                  <FormField
                    control={form.control}
                    name="allowDelegation"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>タスクの委譲を許可</FormLabel>
                          <FormDescription>
                            エージェントが他のエージェントにタスクを委譲できるようにします
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
                            エージェントの実行過程を詳細にログ出力します
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
                    name="memory"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Memory機能を有効化</FormLabel>
                          <FormDescription>
                            エージェントが過去の実行を記憶し、学習できるようにします
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
                    name="maxIter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>最大試行回数 (Max Iterations)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 15)}
                          />
                        </FormControl>
                        <FormDescription>
                          エージェントがタスクを完了するまでの最大試行回数 (デフォルト: 15)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxRetryLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>最大再試行回数 (Max Retry Limit)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                          />
                        </FormControl>
                        <FormDescription>
                          失敗時の再試行回数 (デフォルト: 2)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="codeExecutionMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>コード実行モード</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          >
                            <option value="safe">安全モード (Safe)</option>
                            <option value="unsafe">非安全モード (Unsafe)</option>
                          </select>
                        </FormControl>
                        <FormDescription>
                          エージェントがコードを実行する際のセキュリティレベル
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
                    onClick={() => setLocation("/agents")}
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
