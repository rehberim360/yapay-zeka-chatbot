'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Star, Calendar } from 'lucide-react';
import { MascotLogo } from './mascot-logo';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function LaunchCountdownPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Launch date: 60 days from now
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 60);

  useEffect(() => {
    // Show popup after 2 seconds on every visit
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = launchDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleGithubClick = () => {
    window.open('https://github.com/rehberim360/yapay-zeka-chatbot', '_blank');
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 mx-4">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Mascot */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <MascotLogo size={80} />
                </motion.div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🚀 Geliştirme Aşamasında!
              </h2>
              
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Türkiye'nin ilk AI destekli chatbot platformu yakında sizlerle!
              </p>

              {/* Countdown */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Gün', value: timeLeft.days },
                  { label: 'Saat', value: timeLeft.hours },
                  { label: 'Dakika', value: timeLeft.minutes },
                  { label: 'Saniye', value: timeLeft.seconds }
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-3 mb-2">
                      <div className="text-2xl font-bold text-white">
                        {String(item.value).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Lansman Tarihi:</strong> {launchDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Sponsor Arıyoruz:</strong> Projeyi desteklemek için GitHub'da yıldızlayın!
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleGithubClick}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Github className="w-5 h-5" />
                GitHub'da İncele & Yıldızla
              </button>

              {/* Footer */}
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
                www.yapayzekachatbot.com
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
