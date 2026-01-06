
import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, MessageSquare, Megaphone, ChevronRight, X, Heart, Wind, Camera, Info } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { JourneyEntry, AppView } from './types';

// Components defined outside to avoid re-rendering issues
const ClayObject: React.FC<{ color: string, className?: string, icon: React.ReactNode }> = ({ color, className, icon }) => (
  <div className={`relative ${className}`}>
    <div 
      className={`w-20 h-20 sm:w-28 sm:h-28 md:w-40 lg:w-48 rounded-full flex items-center justify-center shadow-2xl overflow-hidden`}
      style={{ 
        backgroundColor: color,
        boxShadow: `inset -6px -6px 12px rgba(0,0,0,0.1), 6px 6px 20px rgba(0,0,0,0.15)`
      }}
    >
      <div className="text-white opacity-80 scale-100 sm:scale-125 md:scale-150 transform hover:rotate-12 transition-transform">
        {React.cloneElement(icon as React.ReactElement, { size: '100%' })}
      </div>
      {/* Glossy overlay */}
      <div className="absolute top-2 left-2 w-1/4 h-1/4 bg-white opacity-30 rounded-full blur-sm sm:blur-md"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [currentResult, setCurrentResult] = useState<string | null>(null);
  const [showNotice, setShowNotice] = useState(true);

  const handleStartWriting = () => setView(AppView.INPUT);

  const processJourney = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analisa cerita atau keluhan ini dari warga Jaticempaka: "${text}". 
        Berikan respon 1-2 kalimat yang sangat personal. Bayangkan kita sedang nongkrong di sekretariat Katar Jaticempaka tapi pembahasannya mendalam dan filosofis. 
        Validasi perasaan mereka di awal kalimat.`,
        config: {
          systemInstruction: `Kamu adalah representasi Karang Taruna Jaticempaka yang bertindak sebagai pendengar setia sekaligus psikolog profesional dengan gaya narasi Ferry Irwandi. 
          Gaya bahasamu filosofis, membumi, santai, namun sangat empati. 
          Gunakan diksi khas Ferry Irwandi seperti 'pada akhirnya', 'naratif hidup', 'ruang aman', atau 'pertaruhan'. 
          
          ATURAN WAJIB RESPON:
          1. Buka dengan pendekatan personal seperti: 'Wajar nggak sih?', 'Menurut gue lo udah bener', 'Iya, wajar kalau capek', atau 'Kayaknya lu menjiwai banget ya ceritanya'.
          2. Jika input sangat pendek/tidak jelas, gunakan: 'Idih, dry text banget'.
          3. Jika input berupa keluhan tentang organisasi/lingkungan, gunakan: 'Iya, gue minta maaf atas nama Katar'.
          4. Jangan gunakan kata-kata motivasi klise yang manis. Berikan perspektif realitas yang menenangkan.
          5. Maksimal 2 kalimat pendek agar nyaman dibaca di mobile.`,
        }
      });

      const aiResponse = response.text || "Pada akhirnya, cerita lo adalah narasi yang perlu divalidasi di Jaticempaka ini.";
      
      const categories: ('red' | 'yellow' | 'green')[] = ['red', 'yellow', 'green'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      const newEntry: JourneyEntry = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        timestamp: Date.now(),
        aiResponse,
        category: randomCategory
      };

      setEntries(prev => [newEntry, ...prev]);
      setCurrentResult(aiResponse);
      setView(AppView.RECAP);
    } catch (error) {
      console.error("AI processing failed", error);
      alert("Maaf, koneksi narasi kita terputus. Coba lagi ya!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen selection:bg-pink-200 flex flex-col relative">
      {/* Initial Beta Notice Modal */}
      {showNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-extreme custom-shadow p-6 sm:p-8 relative overflow-hidden animate-in zoom-in duration-300">
            {/* Background Blob decoration */}
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#FFF59D] opacity-30 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 text-center">
              <div className="bg-[#A5D6A7] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 custom-shadow">
                <Info className="text-white" size={24} />
              </div>
              <h2 className="font-syne text-xl mb-3">Halo, Warga! 🌟</h2>
              <p className="text-sm sm:text-base opacity-80 leading-relaxed mb-6">
                Website ini masih <span className="font-bold text-[#FF9B9B]">beta</span> dan dalam pengembangan. Semua yang ditulis tidak akan tersimpan selagi situs ini belum aktif secara publik. Terima kasih!
              </p>
              
              <div className="pt-4 border-t border-gray-100 mb-6">
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">Tim Balik Layar</p>
                <div className="flex flex-col gap-1 text-xs">
                  <p><span className="opacity-50">Inisiator:</span> <span className="font-semibold text-[#FF9B9B]">Nofal</span></p>
                  <p><span className="opacity-50">Pengembang:</span> <span className="font-semibold text-[#A5D6A7]">Fahri</span></p>
                  <p><span className="opacity-50">Konten:</span> <span className="font-semibold text-[#FFF59D] bg-black/5 px-1 rounded">Gita</span></p>
                </div>
              </div>

              <button 
                onClick={() => setShowNotice(false)}
                className="w-full bg-black text-white py-3 rounded-full font-bold hover:bg-gray-800 transition-colors active:scale-95"
              >
                Paham! ✌️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col items-center justify-center">
        
        {view === AppView.LANDING && (
          <div className="text-center relative w-full flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 sm:gap-4 w-full mb-12 sm:mb-20">
              <div className="animate-float">
                <ClayObject color="#A5D6A7" icon={<MessageSquare />} />
              </div>
              <div className="animate-float-delayed mt-10 sm:mt-16">
                <ClayObject color="#FF9B9B" icon={<Megaphone />} />
              </div>
              <div className="animate-float mt-4 sm:mt-8">
                <ClayObject color="#FFF59D" icon={<Camera />} />
              </div>
            </div>

            <h1 className="font-syne text-3xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] mb-6 sm:mb-8 max-w-4xl">
              Ruang aman untuk <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9B9B] via-[#FFF59D] to-[#A5D6A7]">
                setiap cerita
              </span> <br className="hidden sm:block" />
              yang belum terdengar.
            </h1>
            
            <p className="max-w-md md:max-w-xl mx-auto text-base sm:text-lg md:text-xl opacity-70 mb-8 sm:mb-12 px-4">
              Mari berbagi rasa, tanpa sekat. Perjalanan Jaticempaka adalah tentang kita dan mimpi kita.
            </p>

            <button 
              onClick={handleStartWriting}
              className="bg-[#A5D6A7] px-6 sm:px-10 py-4 sm:py-5 rounded-extreme font-bold text-lg sm:text-xl flex items-center gap-2 sm:gap-3 custom-shadow hover-lift active:translate-y-1"
            >
              Tulis sesuatu <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>

            <div className="mt-12 sm:mt-20 text-[10px] sm:text-xs font-medium uppercase tracking-widest opacity-40">
              Journey Recap • Jaticempaka • 2026
            </div>
          </div>
        )}

        {view === AppView.INPUT && (
          <div className="w-full max-w-2xl bg-white p-6 sm:p-10 rounded-extreme custom-shadow animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="font-syne text-2xl sm:text-3xl">Suara Hati</h2>
              <button onClick={() => setView(AppView.LANDING)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ceritakan harimu..."
              className="w-full h-40 sm:h-48 p-4 sm:p-6 text-lg sm:text-xl border-2 border-[#FFF59D] rounded-3xl focus:border-[#A5D6A7] focus:outline-none resize-none bg-[#F9F9F9]"
            />

            <div className="mt-6 sm:mt-8 flex justify-end">
              <button 
                disabled={isProcessing || !inputText.trim()}
                onClick={() => processJourney(inputText)}
                className={`
                  bg-[#A5D6A7] px-6 sm:px-8 py-3 sm:py-4 rounded-extreme font-bold text-base sm:text-lg flex items-center gap-2 sm:gap-3
                  ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'custom-shadow hover-lift'}
                `}
              >
                {isProcessing ? 'Memproses...' : 'Kirim ✨'}
              </button>
            </div>
          </div>
        )}

        {view === AppView.RECAP && currentResult && (
          <div className="w-full max-w-4xl animate-in zoom-in duration-700">
            <div className="bg-[#FFF59D] p-8 sm:p-12 md:p-20 rounded-extreme custom-shadow relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-5 sm:opacity-10 rotate-12 hidden sm:block">
                <Wind size={300} />
              </div>
              
              <div className="relative z-10 text-center">
                <span className="inline-block px-3 py-1 bg-white rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6">
                  Warta Jaticempaka
                </span>
                <h3 className="font-syne text-xl sm:text-3xl md:text-5xl leading-snug mb-6 sm:mb-8 px-2">
                  "{currentResult}"
                </h3>
                <div className="w-12 sm:w-20 h-1 bg-black mx-auto mb-6 sm:mb-8 rounded-full"></div>
                <p className="italic opacity-60 text-sm sm:text-base md:text-lg line-clamp-2">
                  "{inputText.length > 50 ? `${inputText.substring(0, 50)}...` : inputText}"
                </p>
              </div>
            </div>

            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
              <button 
                onClick={() => { setInputText(''); setView(AppView.LANDING); }}
                className="bg-white px-6 sm:px-8 py-3 sm:py-4 rounded-extreme font-bold border-2 border-black flex items-center justify-center gap-2 text-sm sm:text-base order-2 sm:order-1"
              >
                Kembali
              </button>
              <button 
                onClick={() => { setInputText(''); setView(AppView.INPUT); }}
                className="bg-[#FF9B9B] px-6 sm:px-8 py-3 sm:py-4 rounded-extreme font-bold custom-shadow hover-lift flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
              >
                Tulis Lagi <Sparkles size={16} />
              </button>
            </div>
          </div>
        )}

      </main>

      <footer className="w-full py-6 px-6 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] sm:text-xs font-bold opacity-30">
          <Heart size={14} fill="currentColor" /> KARANG TARUNA JATICEMPAKA
        </div>
      </footer>

      <div className="fixed -right-20 top-1/4 w-40 h-40 sm:w-64 sm:h-64 bg-[#FFF59D] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed -left-20 bottom-1/4 w-60 h-60 sm:w-96 sm:h-96 bg-[#A5D6A7] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default App;
