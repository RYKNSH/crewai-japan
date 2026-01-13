import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface StatItemProps {
    value: number;
    suffix: string;
    label: string;
    duration?: number;
}

function StatItem({ value, suffix, label, duration = 2000 }: StatItemProps) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * value));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [isVisible, value, duration]);

    return (
        <div ref={ref} className="text-center">
            <p className="text-4xl sm:text-5xl font-bold gradient-text">
                {count.toLocaleString()}{suffix}
            </p>
            <p className="text-gray-600 mt-2">{label}</p>
        </div>
    );
}

const stats = [
    { value: 10000, suffix: '+', label: '処理されたタスク' },
    { value: 500, suffix: '+', label: '登録ユーザー' },
    { value: 99, suffix: '.9%', label: 'サービス稼働率' },
    { value: 4, suffix: '.8', label: 'ユーザー満足度' },
];

export default function StatsSection() {
    return (
        <section className="py-24 bg-gradient-to-b from-white/50 to-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        信頼される<span className="gradient-text">実績</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        多くの企業・個人にご利用いただいています
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="glass rounded-3xl p-8 sm:p-12"
                >
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <StatItem
                                key={index}
                                value={stat.value}
                                suffix={stat.suffix}
                                label={stat.label}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
