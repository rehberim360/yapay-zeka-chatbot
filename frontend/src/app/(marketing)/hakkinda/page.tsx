import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Zap, Globe, Palette, Shield, Github, Mail, ExternalLink, Code, Database, Cloud, Cpu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hakkında - YZ Chatbot',
  description: 'Yapay Zeka Chatbot projesi hakkında detaylı bilgi',
};

export default function AboutPage() {
  const features = [
    { icon: Sparkles, title: "Akıllı Öğrenme", desc: "Web sitenizi tarar ve otomatik öğrenir" },
    { icon: Globe, title: "Çoklu Dil", desc: "100+ dilde otomatik çeviri" },
    { icon: Zap, title: "Hızlı Kurulum", desc: "5 dakikada hazır" },
    { icon: Palette, title: "Özelleştirilebilir", desc: "Markanıza özel tasarım" },
    { icon: Shield, title: "Güvenli", desc: "Enterprise-grade güvenlik" },
  ];

  const techStack = [
    {
      category: "Frontend",
      icon: Code,
      color: "from-blue-500 to-cyan-500",
      items: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS"]
    },
    {
      category: "Backend",
      icon: Database,
      color: "from-purple-500 to-pink-500",
      items: ["Node.js", "Express", "Supabase", "Redis"]
    },
    {
      category: "AI/ML",
      icon: Cpu,
      color: "from-orange-500 to-red-500",
      items: ["Google Gemini", "Web Scraping", "NLP", "RAG"]
    },
    {
      category: "Infrastructure",
      icon: Cloud,
      color: "from-green-500 to-emerald-500",
      items: ["Vercel Edge", "Docker", "GitHub Actions", "CDN"]
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent"></div>
        <div className="container mx-auto px-4 max-w-6xl py-20 md:py-32 relative">
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-sm font-semibold text-blue-300">
                ✨ Açık Kaynak AI Chatbot Platformu
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Yapay Zeka Chatbot
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Web sitenizden otomatik öğrenen, 7/24 müşteri sorularını yanıtlayan akıllı chatbot platformu
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-20">
            <span className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Canlı
            </span>
            <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-semibold">
              Next.js 15
            </span>
            <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold">
              Gemini AI
            </span>
            <span className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-lg text-sm font-semibold">
              Vercel Edge
            </span>
          </div>

          {/* About Section */}
          <div className="relative group mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-blue-400" />
                <h2 className="text-3xl md:text-4xl font-bold">Proje Hakkında</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Yapay Zeka Chatbot, işletmelerin web sitelerinden otomatik olarak öğrenen ve 
                müşteri sorularını 7/24 yanıtlayan akıllı bir chatbot platformudur. 
                Tek tıkla kurulum, çoklu dil desteği ve sektöre özel özelleştirmeler sunar.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Özellikler
              </span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
                  <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                    <feature.icon className="w-10 h-10 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Teknoloji Stack
              </span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {techStack.map((stack, index) => (
                <div key={index} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stack.color} opacity-10 rounded-2xl blur-lg group-hover:blur-xl transition-all`}></div>
                  <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${stack.color}`}>
                        <stack.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold">{stack.category}</h3>
                    </div>
                    <ul className="space-y-2">
                      {stack.items.map((item, i) => (
                        <li key={i} className="text-gray-400 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsor CTA */}
          <div className="relative group mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-xl border border-pink-500/30 rounded-3xl p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  💝 Sponsor Olun
                </span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Bu proje açık kaynak topluluğu için geliştirilmektedir. 
                Sponsorluğunuz ile daha fazla özellik ekleyebilir ve daha fazla işletmeye ulaşabiliriz.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/sponsor"
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all transform hover:scale-105"
                >
                  💖 Sponsor Ol
                </Link>
                <a 
                  href="https://github.com/sponsors/rehberim360"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-gray-800 border border-white/10 rounded-xl font-bold text-lg hover:bg-gray-700 hover:border-white/20 transition-all flex items-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  GitHub Sponsors
                </a>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-lg"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-8 text-center">İletişim</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <a href="https://yapayzekachatbot.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-all group">
                  <ExternalLink className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold mb-1">Website</div>
                    <div className="text-sm text-gray-400">yapayzekachatbot.com</div>
                  </div>
                </a>
                <a href="mailto:founder@yapayzekachatbot.com" className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-all group">
                  <Mail className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold mb-1">Email</div>
                    <div className="text-sm text-gray-400">founder@yapayzekachatbot.com</div>
                  </div>
                </a>
                <a href="https://github.com/rehberim360" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-all group">
                  <Github className="w-8 h-8 text-pink-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold mb-1">GitHub</div>
                    <div className="text-sm text-gray-400">@rehberim360</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link 
              href="/"
              className="inline-block px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105"
            >
              🚀 Hemen Başla
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
