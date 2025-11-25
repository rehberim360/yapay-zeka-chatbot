'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Check, ArrowRight, ArrowLeft, Sparkles, AlertCircle, Info, CheckCircle2, X } from 'lucide-react';

export interface SuggestedPage {
  url: string;
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  expected_data: string;
  auto_select: boolean;
  title?: string;
}

interface SmartPageSelectionCardProps {
  suggestedPages: SuggestedPage[];
  onNext: (selectedPages: SuggestedPage[]) => void;
  onSkip: () => void;
  onBack?: () => void;
}

// Priority indicators
const priorityConfig = {
  CRITICAL: {
    icon: '🔴',
    label: 'Kritik',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    hoverBorder: 'hover:border-red-400'
  },
  HIGH: {
    icon: '🟡',
    label: 'Yüksek',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    hoverBorder: 'hover:border-yellow-400'
  },
  MEDIUM: {
    icon: '🟢',
    label: 'Orta',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    hoverBorder: 'hover:border-green-400'
  },
  LOW: {
    icon: '⚪',
    label: 'Düşük',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    hoverBorder: 'hover:border-gray-400'
  }
};

export function SmartPageSelectionCard({
  suggestedPages,
  onNext,
  onSkip,
  onBack
}: SmartPageSelectionCardProps) {
  // Auto-select pages with auto_select=true
  const [selectedUrls, setSelectedUrls] = useState<string[]>(
    suggestedPages.filter(p => p.auto_select).map(p => p.url)
  );
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const togglePage = (url: string) => {
    setSelectedUrls(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const selectAll = () => {
    setSelectedUrls(suggestedPages.map(p => p.url));
  };

  const deselectAll = () => {
    setSelectedUrls([]);
  };

  const handleNext = () => {
    if (selectedUrls.length === 0) {
      // Show error if no pages selected
      return;
    }
    const selected = suggestedPages.filter(p => selectedUrls.includes(p.url));
    onNext(selected);
  };

  const handleSkip = () => {
    setShowSkipConfirm(false);
    onSkip();
  };

  // Group by priority
  const groupedPages = {
    CRITICAL: suggestedPages.filter(p => p.priority === 'CRITICAL'),
    HIGH: suggestedPages.filter(p => p.priority === 'HIGH'),
    MEDIUM: suggestedPages.filter(p => p.priority === 'MEDIUM'),
    LOW: suggestedPages.filter(p => p.priority === 'LOW')
  };

  return (
    <>
      <div className="w-full h-[calc(100vh-180px)] flex items-center justify-center">
        <div className="w-full max-w-7xl h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl border-t-4 border-t-purple-500 flex flex-col overflow-hidden h-full"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Önerilen Sayfalar</h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      AI bu sayfaları analiz ederek daha fazla detay çıkaracak
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-purple-600">{selectedUrls.length}</span>
                  <span className="text-sm text-gray-500">/ {suggestedPages.length}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1.5 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg text-xs font-medium text-purple-700 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3 inline mr-1" />
                  Tümünü Seç
                </button>
                <button
                  onClick={deselectAll}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors"
                >
                  <X className="w-3 h-3 inline mr-1" />
                  Tümünü Kaldır
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {Object.entries(groupedPages).map(([priority, pages]) => {
                  if (pages.length === 0) return null;
                  const config = priorityConfig[priority as keyof typeof priorityConfig];

                  return (
                    <div key={priority}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{config.icon}</span>
                        <h4 className={`text-sm font-bold ${config.color}`}>
                          {config.label} Öncelik
                        </h4>
                        <span className="text-xs text-gray-500">({pages.length})</span>
                      </div>

                      <div className="space-y-2">
                        {pages.map((page) => {
                          const isSelected = selectedUrls.includes(page.url);
                          const isExpanded = expandedUrl === page.url;

                          return (
                            <motion.div
                              key={page.url}
                              layout
                              className={`rounded-lg border-2 transition-all ${
                                isSelected
                                  ? `${config.bg} ${config.border} ${config.hoverBorder} shadow-sm`
                                  : 'bg-gray-50 border-gray-200 opacity-60'
                              }`}
                            >
                              {/* Main Row */}
                              <div
                                className="flex items-center gap-3 p-3 cursor-pointer"
                                onClick={() => togglePage(page.url)}
                              >
                                {/* Checkbox */}
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? 'bg-purple-500 border-purple-500'
                                    : 'bg-white border-gray-300'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className={`font-semibold text-sm ${
                                      isSelected ? 'text-gray-900' : 'text-gray-500 line-through'
                                    }`}>
                                      {page.title || new URL(page.url).pathname.split('/').pop() || 'Sayfa'}
                                    </p>
                                    {page.auto_select && (
                                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                        Otomatik Seçildi
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">{page.url}</p>
                                </div>

                                {/* Info Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedUrl(isExpanded ? null : page.url);
                                  }}
                                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                >
                                  <Info className={`w-4 h-4 ${isSelected ? config.color : 'text-gray-400'}`} />
                                </button>
                              </div>

                              {/* Expanded Details */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-gray-200"
                                  >
                                    <div className="p-4 space-y-3 bg-white/50">
                                      <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-1">
                                          Neden Öneriliyor?
                                        </p>
                                        <p className="text-xs text-gray-600">{page.reason}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-1">
                                          Beklenen Veri
                                        </p>
                                        <p className="text-xs text-gray-600">{page.expected_data}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-1">
                                          Sayfa Tipi
                                        </p>
                                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                          {page.type}
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-white">
              {selectedUrls.length === 0 && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    En az bir sayfa seçmelisiniz veya "Bu Kadar Yeterli" butonuna tıklayın
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center gap-3">
                <div className="flex gap-2">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-700 font-medium text-sm transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Geri
                    </button>
                  )}
                  <button
                    onClick={() => setShowSkipConfirm(true)}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-700 font-medium text-sm transition-all"
                  >
                    Bu Kadar Yeterli
                  </button>
                </div>

                <button
                  onClick={handleNext}
                  disabled={selectedUrls.length === 0}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg"
                >
                  Seçilenleri Tara
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      <AnimatePresence>
        {showSkipConfirm && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSkipConfirm(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">✋</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Ek Sayfa Taramasını Atla?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ana sayfadan toplanan bilgilerle devam edilecek. Daha sonra eksik bilgileri manuel olarak ekleyebilirsiniz.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSkipConfirm(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-all"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-all"
                  >
                    Evet, Atla
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
