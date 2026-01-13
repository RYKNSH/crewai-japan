import { motion } from 'framer-motion';
import {
    Brain,
    Users,
    Zap,
    Shield,
    Settings,
    TrendingUp
} from 'lucide-react';

const features = [
    {
        icon: Brain,
        title: '高度な推論能力',
        description: 'GPT-4、Claude、Geminiなど最新LLMを活用した高精度な推論を実現。',
    },
    {
        icon: Users,
        title: 'マルチエージェント協調',
        description: '複数のエージェントがチームとして協力し、複雑なタスクを分担処理。',
    },
    {
        icon: Zap,
        title: 'リアルタイム実行',
        description: 'エージェントの思考プロセスをリアルタイムでトレースし可視化。',
    },
    {
        icon: Shield,
        title: 'エンタープライズセキュリティ',
        description: 'データの暗号化、アクセス制御、監査ログで企業利用に対応。',
    },
    {
        icon: Settings,
        title: 'カスタムツール連携',
        description: 'Notion、Gmail、Slackなど既存ツールとシームレスに統合。',
    },
    {
        icon: TrendingUp,
        title: '継続的学習',
        description: 'エージェントが過去の実行から学習し、パフォーマンスを向上。',
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 bg-gradient-to-b from-transparent to-white/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        なぜ<span className="gradient-text">CrewAI Japan</span>なのか
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        他にはない機能と価値で、あなたのビジネスを次のレベルへ
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative glass rounded-2xl p-6 h-full">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                                    <feature.icon className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
