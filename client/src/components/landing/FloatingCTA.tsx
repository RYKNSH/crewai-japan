import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FloatingCTA() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
            <div className="max-w-4xl mx-auto">
                <div className="glass-strong rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 pointer-events-auto">
                    <div className="hidden sm:block">
                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            今すぐAIエージェントを始めよう
                        </p>
                        <p className="text-sm text-gray-600">
                            β版は完全無料でご利用いただけます
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <a href="/dashboard" className="flex-1 sm:flex-none">
                            <Button
                                size="lg"
                                className="w-full shimmer bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold px-8"
                            >
                                無料で始める
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
