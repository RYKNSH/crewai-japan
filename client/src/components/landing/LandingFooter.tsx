import { Mail, Github, Twitter } from 'lucide-react';

export default function LandingFooter() {
    return (
        <footer className="py-12 border-t border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">AI</span>
                            </div>
                            <span className="font-bold text-xl text-gray-800">CrewAI Japan</span>
                        </div>
                        <p className="text-gray-600 max-w-md">
                            複数のAIエージェントが協力して複雑なタスクを自動化する、日本初のマルチエージェントプラットフォーム。
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">製品</h4>
                        <ul className="space-y-2">
                            <li><a href="#features" className="text-gray-600 hover:text-gray-900">機能</a></li>
                            <li><a href="#pricing" className="text-gray-600 hover:text-gray-900">料金</a></li>
                            <li><a href="#usecases" className="text-gray-600 hover:text-gray-900">ユースケース</a></li>
                            <li><a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">サポート</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-600 hover:text-gray-900">ドキュメント</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900">お問い合わせ</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900">プライバシーポリシー</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900">利用規約</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-gray-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        © 2026 CrewAI Japan. All rights reserved.
                    </p>

                    <div className="flex items-center gap-4">
                        <a href="#" className="text-gray-400 hover:text-gray-600">
                            <Twitter className="h-5 w-5" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-600">
                            <Github className="h-5 w-5" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-600">
                            <Mail className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
