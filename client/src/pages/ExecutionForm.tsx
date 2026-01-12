import { useEffect, useState } from "react";
import { useLocation } from "wouter";
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
import { ArrowLeft, Play } from "lucide-react";

const executionFormSchema = z.object({
  crewId: z.number().min(1, "クルーを選択してください"),
  inputs: z.string().optional(),
});

type ExecutionFormValues = z.infer<typeof executionFormSchema>;

export default function ExecutionForm() {
  const [location, setLocation] = useLocation();
  // window.location.searchを使用してクエリパラメータを取得
  const searchParams = new URLSearchParams(window.location.search);
  const crewIdFromQuery = searchParams.get("crewId");

  const utils = trpc.useUtils();
  const { data: crews } = trpc.crew.list.useQuery();

  const form = useForm<ExecutionFormValues>({
    resolver: zodResolver(executionFormSchema) as any,
    defaultValues: {
      crewId: crewIdFromQuery ? parseInt(crewIdFromQuery) : undefined,
      inputs: "",
    },
  });

  const executeMutation = trpc.execution.execute.useMutation({
    onSuccess: (data) => {
      utils.execution.list.invalidate();
      toast.success("クルーの実行を開始しました");
      setLocation(`/executions/${data.id}`);
    },
    onError: (error) => {
      toast.error(`実行に失敗しました: ${error.message}`);
    },
  });

  const onSubmit = (values: ExecutionFormValues) => {
    executeMutation.mutate({
      crewId: values.crewId,
      input: values.inputs || "",
    });
  };

  const selectedCrew = crews?.find((c) => c.id === form.watch("crewId"));

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* ヘッダー */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/executions")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">クルーを実行</h1>
            <p className="text-muted-foreground mt-2">
              クルーを選択して実行します
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>実行設定</CardTitle>
                <CardDescription>
                  実行するクルーと入力データを設定します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="crewId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>クルー *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="クルーを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {crews && crews.length > 0 ? (
                            crews.map((crew) => (
                              <SelectItem key={crew.id} value={crew.id.toString()}>
                                {crew.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              クルーがありません
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        実行するクルーを選択してください
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCrew && (
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="font-medium mb-2">選択されたクルー</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {selectedCrew.description || "説明なし"}
                    </p>
                    <div className="flex gap-2 text-sm">
                      <span className="text-muted-foreground">
                        エージェント: {selectedCrew.agentIds?.length || 0}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        タスク: {selectedCrew.taskIds?.length || 0}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        プロセス: {selectedCrew.process === "sequential" ? "順次実行" : selectedCrew.process === "hierarchical" ? "階層実行" : "合意形成"}
                      </span>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="inputs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>入力データ（任意）</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="例: 市場調査の対象: 日本のAI市場"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        クルーに渡す追加の入力データやコンテキスト情報
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
                onClick={() => setLocation("/executions")}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={executeMutation.isPending}
              >
                <Play className="mr-2 h-4 w-4" />
                実行開始
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
