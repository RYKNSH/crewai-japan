import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: '¥0',
        period: '/月',
        description: '個人利用や試用に最適',
        features: [
            'エージェント3体まで',
            'クルー2つまで',
            '月100回の実行',
            'コミュニティサポート',
        ],
        cta: '無料で始める',
        popular: false,
    },
    {
        name: 'Pro',
        price: '¥4,980',
        period: '/月',
        description: 'チームや本格利用に',
        features: [
            '無制限エージェント',
            '無制限クルー',
            '無制限実行',
            '優先サポート',
            'カスタムツール連携',
            'チームメンバー招待',
        ],
        cta: 'Proを始める',
        popular: true,
        badge: 'おすすめ',
    },
    {
        name: 'Enterprise',
        price: 'お問い合わせ',
        period: '',
        description: '大規模導入・カスタマイズ',
        features: [
            'Pro全機能',
            'SSO / SAML認証',
            'オンプレミス対応',
            '専任アカウントマネージャー',
            'SLA保証',
            'カスタム開発',
        ],
        cta: 'お問い合わせ',
        popular: false,
    },
];

export default function PricingSection() {
    return (
        <section id="pricing" className="py-24 bg-gradient-to-b from-transparent to-white/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        シンプルな<span className="gradient-text">料金プラン</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        まずは無料から。成長に合わせてアップグレード
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative rounded-2xl p-8 ${plan.popular
                                    ? 'bg-gradient-to-b from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
                                    : 'glass'
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.badge && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-yellow-400 text-yellow-900 text-sm font-bold shadow-lg">
                                        <Sparkles className="h-3 w-3" />
                                        {plan.badge}
                                    </div>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'gradient-text'}`}>
                                        {plan.price}
                                    </span>
                                    <span className={plan.popular ? 'text-white/80' : 'text-gray-500'}>
                                        {plan.period}
                                    </span>
                                </div>
                                <p className={`mt-2 text-sm ${plan.popular ? 'text-white/80' : 'text-gray-500'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <Check className={`h-5 w-5 ${plan.popular ? 'text-white' : 'text-green-500'}`} />
                                        <span className={plan.popular ? 'text-white/90' : 'text-gray-600'}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <a href="/dashboard">
                                <Button
                                    className={`w-full ${plan.popular
                                            ? 'bg-white text-purple-600 hover:bg-white/90'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                                        }`}
                                    size="lg"
                                >
                                    {plan.cta}
                                </Button>
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
