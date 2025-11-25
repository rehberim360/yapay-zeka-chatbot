import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sponsor Olun - YZ Chatbot',
  description: 'Yapay Zeka Chatbot projesine sponsor olun ve açık kaynak topluluğuna katkıda bulunun',
};

export default function SponsorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            💝 Sponsor Olun
          </h1>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto">
            Açık kaynak AI chatbot platformunu destekleyin ve binlerce işletmeye ulaşmasına yardımcı olun
          </p>
        </div>

        {/* Why Sponsor */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 mb-12">
          <h2 className="text-4xl font-bold mb-8 text-center">🎯 Neden Sponsor Olmalısınız?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-3">Hızlı Büyüme</h3>
              <p className="text-gray-600">
                Canlı platform, aktif kullanıcı tabanı ve sürekli geliştirme
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-3">Global Erişim</h3>
              <p className="text-gray-600">
                100+ dil desteği ile dünya çapında kullanım
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-xl font-bold mb-3">Marka Görünürlüğü</h3>
              <p className="text-gray-600">
                README, site ve dokümantasyonda logonuz
              </p>
            </div>
          </div>
        </div>

        {/* Budget Breakdown */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 mb-12">
          <h2 className="text-4xl font-bold mb-8 text-center">💰 Bütçe Dağılımı (6 Ay)</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-blue-50 rounded-xl">
              <div>
                <h3 className="text-xl font-bold">🏗️ Altyapı</h3>
                <p className="text-gray-600">Hosting, Database, CDN, Redis</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">$4,020</div>
                <div className="text-sm text-gray-500">13% • $670/ay</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-purple-50 rounded-xl">
              <div>
                <h3 className="text-xl font-bold">🤖 AI/ML</h3>
                <p className="text-gray-600">Gemini API, OpenAI, Claude</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">$4,800</div>
                <div className="text-sm text-gray-500">15% • $800/ay</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-green-50 rounded-xl">
              <div>
                <h3 className="text-xl font-bold">👥 Ekip & Geliştirme</h3>
                <p className="text-gray-600">Geliştiriciler, Tasarımcı, İçerik</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">$18,000</div>
                <div className="text-sm text-gray-500">58% • $3,000/ay</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-orange-50 rounded-xl">
              <div>
                <h3 className="text-xl font-bold">📢 Pazarlama</h3>
                <p className="text-gray-600">Ads, SEO, İçerik Üretimi</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-600">$4,300</div>
                <div className="text-sm text-gray-500">14% • $717/ay</div>
              </div>
            </div>

            <div className="border-t-4 border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Toplam İhtiyaç</h3>
                <div className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  $31,120
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsorship Tiers */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 mb-12">
          <h2 className="text-4xl font-bold mb-8 text-center">🎁 Sponsor Paketleri</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Bronze */}
            <div className="border-2 border-orange-300 rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🥉</div>
                <h3 className="text-2xl font-bold mb-2">Bronze</h3>
                <div className="text-3xl font-bold text-orange-600">$100/ay</div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>README'de logo</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Site footer'da link</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Teşekkür tweet'i</span>
                </li>
              </ul>
            </div>

            {/* Silver */}
            <div className="border-2 border-gray-400 rounded-2xl p-6 hover:shadow-xl transition-all transform scale-105">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🥈</div>
                <h3 className="text-2xl font-bold mb-2">Silver</h3>
                <div className="text-3xl font-bold text-gray-600">$500/ay</div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Bronze + tüm özellikler</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Ana sayfada logo</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Blog yazısında bahis</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Aylık rapor</span>
                </li>
              </ul>
            </div>

            {/* Gold */}
            <div className="border-2 border-yellow-400 rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🥇</div>
                <h3 className="text-2xl font-bold mb-2">Gold</h3>
                <div className="text-3xl font-bold text-yellow-600">$1,000/ay</div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Silver + tüm özellikler</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Özel entegrasyon</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Öncelikli destek</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Roadmap'te söz hakkı</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/sponsors/rehberim360"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              💖 GitHub Sponsors
            </a>
            <a
              href="mailto:founder@yapayzekachatbot.com"
              className="px-8 py-4 bg-gray-800 text-white rounded-xl font-bold text-lg hover:bg-gray-700 transition-all"
            >
              📧 Özel Sponsor Paketi
            </a>
          </div>

          <p className="text-gray-600 max-w-2xl mx-auto">
            Kurumsal sponsorluk paketleri için lütfen bizimle iletişime geçin. 
            Özel ihtiyaçlarınıza göre paket oluşturabiliriz.
          </p>
        </div>

        {/* Current Sponsors */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">🌟 Mevcut Sponsorlar</h2>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <p className="text-gray-600 text-lg">
              İlk sponsor siz olun! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
