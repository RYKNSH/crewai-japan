import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: '田中 太郎',
        role: 'マーケティングマネージャー',
        company: 'テック株式会社',
        avatar: '👨‍💼',
        content: 'CrewAI Japanを導入してから、市場調査にかかる時間が1週間から2時間に短縮されました。複数のエージェントが協力して情報を収集し、分析してくれるのは革命的です。',
        rating: 5,
    },
    {
        name: '佐藤 美咲',
        role: 'スタートアップCEO',
        company: 'AIベンチャー',
        avatar: '👩‍💻',
        content: '少人数のチームでも、CrewAI Japanのおかげで大企業並みの分析力を手に入れました。コストパフォーマンスも最高です。',
        rating: 5,
    },
    {
        name: '鈴木 健一',
        role: 'コンテンツディレクター',
        company: 'メディア株式会社',
        avatar: '👨‍🎨',
        content: 'ブログ記事の下書きから校正まで、AIエージェントが一貫してサポートしてくれます。品質を維持しながら生産性が3倍になりました。',
        rating: 5,
    },
];

export default function TestimonialsSection() {
    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        お客様の<span className="gradient-text">声</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        CrewAI Japanを活用している皆様からの声をご紹介
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="glass rounded-2xl p-6 relative"
                        >
                            {/* Quote Icon */}
                            <Quote className="absolute top-4 right-4 h-8 w-8 text-purple-200" />

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-gray-600 mb-6 relative z-10">{testimonial.content}</p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">{testimonial.role}・{testimonial.company}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
