import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gift, Clock, Sparkles, Zap } from 'lucide-react';

export default function LimitedOfferSection() {
    return (
        <section className="py-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-3xl"
                >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 animated-gradient opacity-90" />

                    {/* Content */}
                    <div className="relative p-8 sm:p-12 text-center text-white">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur mb-6">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-semibold">期間限定オファー</span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            🎁 β版ユーザー限定特典
                        </h2>

                        <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
                            今なら完全無料でご利用いただけます。さらに、正式リリース後も特別価格でご継続いただけます。
                        </p>

                        {/* Benefits Grid */}
                        <div className="grid sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
                            {[
                                { icon: Gift, text: 'β期間中は完全無料' },
                                { icon: Zap, text: 'プロ機能をすべて解放' },
                                { icon: Clock, text: '優先サポート付き' },
                            ].map((benefit, i) => (
                                <div key={i} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 backdrop-blur">
                                    <benefit.icon className="h-5 w-5" />
                                    <span className="font-medium">{benefit.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <a href="/dashboard">
                            <Button
                                size="lg"
                                className="bg-white text-purple-600 hover:bg-white/90 font-bold px-10 py-6 text-lg rounded-xl shadow-xl"
                            >
                                今すぐ無料で参加する
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </a>

                        {/* Urgency */}
                        <p className="mt-6 text-sm text-white/80">
                            ※ β版の募集枠には限りがあります
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
