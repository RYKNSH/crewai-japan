import { motion } from 'framer-motion';
import {
    BarChart3,
    FileSearch,
    MessageSquare,
    Mail,
    CalendarCheck,
    PenTool
} from 'lucide-react';

const useCases = [
    {
        icon: BarChart3,
        title: 'マーケティング自動化',
        description: '市場調査、競合分析、レポート作成を複数エージェントが協力して実行。',
        result: '作業時間を70%削減',
    },
    {
        icon: FileSearch,
        title: 'リサーチ & 分析',
        description: '膨大なデータから必要な情報を収集・分析し、インサイトを抽出。',
        result: '分析精度が3倍向上',
    },
    {
        icon: MessageSquare,
        title: 'カスタマーサポート',
        description: '問い合わせの分類、回答の生成、エスカレーションを自動処理。',
        result: '応答時間を90%短縮',
    },
    {
        icon: Mail,
        title: 'メール & 文書作成',
        description: 'ビジネスメール、提案書、報告書の下書きを自動生成。',
        result: '1日2時間の節約',
    },
    {
        icon: CalendarCheck,
        title: 'プロジェクト管理',
        description: 'タスクの分解、進捗追跡、リマインダー送信を自動化。',
        result: 'チーム効率25%向上',
    },
    {
        icon: PenTool,
        title: 'コンテンツ生成',
        description: 'ブログ、SNS投稿、動画スクリプトを一貫した品質で大量生成。',
        result: 'コンテンツ量5倍に',
    },
];

export default function UseCasesSection() {
    return (
        <section id="usecases" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        <span className="gradient-text">あなたの未来</span>はこう変わる
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        CrewAI Japanを導入した企業が実現した成果をご紹介
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {useCases.map((useCase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <useCase.icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                            <p className="text-gray-600 mb-4">{useCase.description}</p>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                ✓ {useCase.result}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
