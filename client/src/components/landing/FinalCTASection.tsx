import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Rocket } from 'lucide-react';

export default function FinalCTASection() {
    return (
        <section className="py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-8">
                        <Rocket className="h-10 w-10 text-white" />
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        AIエージェントで
                        <br />
                        <span className="gradient-text">未来の働き方</span>を始めよう
                    </h2>

                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                        CrewAI Japanは、β版期間中は完全無料。クレジットカード不要で今すぐ始められます。
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="/dashboard">
                            <Button
                                size="lg"
                                className="shimmer bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-10 py-7 text-lg rounded-xl shadow-2xl"
                            >
                                今すぐ無料で始める
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </a>
                    </div>

                    <p className="mt-6 text-sm text-gray-500">
                        ✓ クレジットカード不要 ✓ 30秒で登録完了 ✓ いつでもキャンセル可能
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
