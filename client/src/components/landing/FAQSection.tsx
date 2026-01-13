import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: 'CrewAI Japanとは何ですか？',
        answer: 'CrewAI Japanは、複数のAIエージェントがチームとして協力し、複雑なタスクを自動化するプラットフォームです。市場調査、コンテンツ作成、データ分析など、様々な業務を効率化できます。',
    },
    {
        question: '技術的な知識がなくても使えますか？',
        answer: 'はい、プログラミングの知識は不要です。直感的なUIでエージェントの作成からタスクの実行まで、すべてブラウザ上で完結します。テンプレートも豊富に用意しています。',
    },
    {
        question: 'どのようなLLM（AI）に対応していますか？',
        answer: 'OpenAI（GPT-4, GPT-3.5）、Anthropic（Claude）、Google（Gemini）など、主要なLLMプロバイダーに対応しています。お持ちのAPIキーを設定するだけで利用開始できます。',
    },
    {
        question: 'データのセキュリティは大丈夫ですか？',
        answer: 'はい、すべてのデータは暗号化して保存され、SSL/TLSで通信を保護しています。Enterpriseプランでは、オンプレミス導入やSSO認証にも対応しています。',
    },
    {
        question: 'β版終了後の料金はどうなりますか？',
        answer: 'β版期間中にご登録いただいたユーザー様には、正式リリース後も特別価格でご利用いただける「創業メンバー割引」を適用いたします。詳細は正式リリース前にご案内します。',
    },
    {
        question: 'キャンセルや解約はできますか？',
        answer: 'はい、いつでもキャンセル可能です。解約手数料はかかりません。解約後もデータは一定期間保持されますので、再開も簡単に行えます。',
    },
];

function FAQItem({ question, answer, isOpen, onClick }: {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}) {
    return (
        <div className="glass rounded-xl overflow-hidden">
            <button
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                onClick={onClick}
            >
                <span className="font-semibold text-gray-900">{question}</span>
                <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0 }}
                className="overflow-hidden"
            >
                <div className="px-6 pb-5 text-gray-600">
                    {answer}
                </div>
            </motion.div>
        </div>
    );
}

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        よくある<span className="gradient-text">質問</span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        ご不明点がございましたらお気軽にお問い合わせください
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-4"
                >
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
