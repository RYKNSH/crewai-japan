import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-16 pb-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
                >
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">
                        β版限定 - 完全無料でご利用いただけます
                    </span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                >
                    <span className="text-gray-900">AIエージェントが</span>
                    <br />
                    <span className="gradient-text">あなたの仕事を変える</span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10"
                >
                    CrewAI Japanは、複数のAIエージェントが協力して複雑なタスクを自動化する、
                    <br className="hidden sm:block" />
                    日本初のマルチエージェントプラットフォームです。
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <a href="/dashboard">
                        <Button
                            size="lg"
                            className="shimmer bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-xl"
                        >
                            今すぐ無料で始める
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </a>
                    <Button
                        size="lg"
                        variant="outline"
                        className="font-medium px-8 py-6 text-lg rounded-xl border-2"
                    >
                        <Play className="mr-2 h-5 w-5" />
                        デモを見る
                    </Button>
                </motion.div>

                {/* Stats Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
                >
                    {[
                        { value: '10,000+', label: '処理タスク数' },
                        { value: '500+', label: 'ユーザー数' },
                        { value: '99.9%', label: '稼働率' },
                        { value: '24/7', label: 'サポート' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
                            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
