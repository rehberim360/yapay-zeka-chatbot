import { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Rocket, Globe, Gem, Building2, Check, Github, Mail, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sponsor Olun - YZ Chatbot',
  description: 'Yapay Zeka Chatbot projesine sponsor olun ve açık kaynak topluluğuna katkıda bulunun',
};

export default function SponsorPage() {
  const reasons = [
    { icon: Rocket, title: "Hızlı Büyüme", desc: "Canlı platform, aktif kullanıcı tabanı ve sürekli geliştirme" },
    { icon: Globe, title: "Global Erişim", desc: "100+ dil desteği ile dünya çapında kullanım" },
    { icon: Gem, title: "Marka Görünürlüğü", desc: "README, site ve dokümantasyonda logonuz" },
  ];

  const budget = [
    { icon: "☁️", title: "Altyapı", amount: "$4,020", monthly: "$670/ay", percent: "13%", color: "from-blue-500 to-cyan-500", desc: "Hosting, Database, CDN, Redis" },
    { icon: "🤖", title: "AI/ML", amount: "$4,800", monthly: "$800/ay", percent: "15%", color: "from-purple-500 to-pink-500", desc: "Gemini API, OpenAI, Claude" },
    { icon: "👥", title: "Ekip & Geliştirme", amount: "$18,000", monthly: "$3,000/ay", percent: "58%", color: "from-green-500 to-emerald-500", desc: "Geliştiriciler, Tasarımcı, İçerik" },
    { icon: "📢", title: "Pazarlama", amount: "$4,300", monthly: "$717/ay", percent: "14%", color: "from-orange-500 to-red-500", desc: "Ads, SEO, İçerik Üretimi" },
  ];

  const tiers = [
    {
      name: "Bronze",
      icon: "🥉",
      price: "$100",
      period: "/ay",
      color: "from-orange-600 to-amber-600",
      borderColor: "border-orange-500/30",
      features: [
        "README'de logo",
        "Site footer'da link",
        "Teşekkür tweet'i",
        "Aylık gelişme raporu"
      ]
    },
    {
      name: "Silver",
      icon: "🥈",
      price: "$500",
      period: "/ay",
      color: "from-gray-400 to-gray-600",
      borderColor: "border-gray-400/30",
      popular: true,
      features: [
        "Bronze + tüm özellikler",
        "Ana sayfada logo",
        "Blog yazısında bahis",
        "Öncelikli bug fix",
        "Haftalık gelişme raporu"
      ]
    },
    {
      name: "Gold",
      icon: "🥇",
      price: "$1,000",
      period: "/ay",
      color: "from-yellow-400 to-yellow-600",
      borderColor: "border-yellow-500/30",
      features: [
        "Silver + tüm özellikler",
        "Özel entegrasyon desteği",
        "Roadmap'te söz hakkı",
        "Öncelikli feature request",
        "Günlük Slack/Discord desteği"
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent"></div>
        <div className="container mx-auto px-4 max-w-6xl py-20 md:py-32 relative">
          
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full text-sm font-semibold text-pink-300 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Açık Kaynak Desteği
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Sponsor Olun
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Açık kaynak AI chatbot platformunu destekleyin ve binlerce işletmeye ulaşmasına yardımcı olun
            </p>
          </div>

          {/* Why Sponsor */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Neden Sponsor Olmalısınız?
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {reasons.map((reason, index) => (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
                  <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all text-center">
                    <reason.icon className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-3">{reason.title}</h3>
                    <p className="text-gray-400">{reason.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Breakdown */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Bütçe Dağılımı
              </span>
            </h2>
            <p className="text-center text-gray-400 mb-12">6 Aylık Hedef: $31,120</p>
            
            <div className="space-y-4 mb-8">
              {budget.map((item, index) => (
                <div key={index} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 rounded-2xl blur-lg group-hover:blur-xl transition-all`}></div>
                  <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`text-4xl p-3 rounded-xl bg-gradient-to-r ${item.color}`}>
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                          {item.amount}
                        </div>
                        <div className="text-sm text-gray-400">{item.percent} • {item.monthly}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Toplam İhtiyaç</h3>
                  <div className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    $31,120
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sponsorship Tiers */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Sponsor Paketleri
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {tiers.map((tier, index) => (
                <div key={index} className={`group relative ${tier.popular ? 'md:scale-105' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-sm font-bold">
                      En Popüler
                    </div>
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-r ${tier.color} opacity-10 rounded-2xl blur-lg group-hover:blur-xl transition-all`}></div>
                  <div className={`relative bg-gray-900/50 backdrop-blur-xl border ${tier.borderColor} rounded-2xl p-8 hover:border-white/30 transition-all h-full`}>
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-3">{tier.icon}</div>
                      <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-4xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                          {tier.price}
                        </span>
                        <span className="text-gray-400">{tier.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="text-center mb-20">
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <a
                href="https://github.com/sponsors/rehberim360"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" />
                GitHub Sponsors
              </a>
              <a
                href="mailto:founder@yapayzekachatbot.com"
                className="px-8 py-4 bg-gray-800 border border-white/10 rounded-xl font-bold text-lg hover:bg-gray-700 hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Özel Paket İçin İletişim
              </a>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Kurumsal sponsorluk paketleri için lütfen bizimle iletişime geçin. 
              Özel ihtiyaçlarınıza göre paket oluşturabiliriz.
            </p>
          </div>

          {/* Current Sponsors */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-lg"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Mevcut Sponsorlar</h2>
              <p className="text-gray-400 text-lg mb-6">
                İlk sponsor siz olun ve bu projenin geleceğini şekillendirin! 🚀
              </p>
              <Link 
                href="https://github.com/sponsors/rehberim360"
                className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-bold hover:shadow-2xl hover:shadow-pink-500/50 transition-all transform hover:scale-105"
              >
                İlk Sponsor Ol
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
