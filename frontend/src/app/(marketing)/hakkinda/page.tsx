import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hakkında - YZ Chatbot',
  description: 'Yapay Zeka Chatbot projesi hakkında detaylı bilgi',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🤖 Yapay Zeka Chatbot
          </h1>
          <p className="text-xl text-gray-600">
            Web sitenizden otomatik öğrenen, akıllı müşteri destek chatbot'u
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            ✅ Canlı
          </span>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            🚀 Next.js 15
          </span>
          <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
            🤖 Gemini AI
          </span>
          <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
            ⚡ Vercel
          </span>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-4">🎯 Proje Hakkında</h2>
            <p className="text-gray-700 leading-relaxed">
              Yapay Zeka Chatbot, işletmelerin web sitelerinden otomatik olarak öğrenen ve 
              müşteri sorularını 7/24 yanıtlayan akıllı bir chatbot platformudur. 
              Tek tıkla kurulum, çoklu dil desteği ve sektöre özel özelleştirmeler sunar.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-4">✨ Özellikler</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-2xl mr-3">🧠</span>
                <div>
                  <strong>Akıllı Öğrenme:</strong> Web sitenizi tarar ve otomatik öğrenir
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🌍</span>
                <div>
                  <strong>Çoklu Dil:</strong> 100+ dilde otomatik çeviri
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">⚡</span>
                <div>
                  <strong>Hızlı Kurulum:</strong> 5 dakikada hazır
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🎨</span>
                <div>
                  <strong>Özelleştirilebilir:</strong> Markanıza özel tasarım
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🔒</span>
                <div>
                  <strong>Güvenli:</strong> Enterprise-grade güvenlik
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-4">🛠️ Teknoloji Stack</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-2">Frontend</h3>
                <ul className="text-sm space-y-1">
                  <li>• Next.js 15</li>
                  <li>• React 19</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-2">Backend</h3>
                <ul className="text-sm space-y-1">
                  <li>• Node.js</li>
                  <li>• Express</li>
                  <li>• Supabase</li>
                  <li>• Redis</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-2">AI/ML</h3>
                <ul className="text-sm space-y-1">
                  <li>• Google Gemini</li>
                  <li>• Web Scraping</li>
                  <li>• NLP</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-2">Infrastructure</h3>
                <ul className="text-sm space-y-1">
                  <li>• Vercel</li>
                  <li>• Docker</li>
                  <li>• GitHub Actions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-4">💝 Sponsor Olun</h2>
            <p className="text-gray-700 mb-6">
              Bu proje açık kaynak topluluğu için geliştirilmektedir. 
              Sponsorluğunuz ile daha fazla özellik ekleyebilir ve daha fazla 
              işletmeye ulaşabiliriz.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/sponsor"
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                💖 Sponsor Ol
              </Link>
              <a 
                href="https://github.com/sponsors/rehberim360"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
              >
                GitHub Sponsors
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-4">📞 İletişim</h2>
            <div className="space-y-3">
              <p>
                <strong>Website:</strong>{' '}
                <a href="https://yapayzekachatbot.com" className="text-blue-600 hover:underline">
                  yapayzekachatbot.com
                </a>
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:founder@yapayzekachatbot.com" className="text-blue-600 hover:underline">
                  founder@yapayzekachatbot.com
                </a>
              </p>
              <p>
                <strong>GitHub:</strong>{' '}
                <a href="https://github.com/rehberim360" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  @rehberim360
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link 
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all"
          >
            🚀 Hemen Başla
          </Link>
        </div>
      </div>
    </div>
  );
}
