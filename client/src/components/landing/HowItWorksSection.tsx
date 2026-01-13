import { motion } from 'framer-motion';
import { UserPlus, Boxes, Rocket, CheckCircle } from 'lucide-react';

const steps = [
    {
        icon: UserPlus,
        step: '01',
        title: 'エージェントを作成',
        description: '役割、目標、性格を設定して、あなただけのAIエージェントを作成。テンプレートから選ぶだけで簡単スタート。',
    },
    {
        icon: Boxes,
        step: '02',
        title: 'クルーを編成',
        description: 'エージェントたちをチームとして編成し、タスクを割り当て。依存関係も自動で管理。',
    },
    {
        icon: Rocket,
        step: '03',
        title: '実行して結果を確認',
        description: 'ワンクリックで実行開始。思考プロセスをリアルタイムで確認しながら、結果をダウンロード。',
    },
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        <span className="gradient-text">3ステップ</span>で始められる
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        複雑な設定は不要。直感的なUIで誰でも簡単に使い始められます
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Connection Line */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 -translate-y-1/2" />

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                className="relative"
                            >
                                <div className="glass rounded-2xl p-8 text-center relative z-10">
                                    {/* Step Number */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                            {step.step}
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
                                            <step.icon className="h-8 w-8 text-purple-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                        <p className="text-gray-600">{step.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Completion Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex justify-center mt-12"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">セットアップ完了まで平均5分</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
