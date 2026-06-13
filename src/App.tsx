/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Baby,
  Thermometer,
  Wind,
  Sun,
  Moon,
  Home,
  Sparkles,
  Heart,
  Info,
  AlertTriangle,
  RefreshCw,
  Check,
  ChevronRight,
  Shirt,
  HelpCircle,
  Clock,
  Download,
  Share2,
  Smartphone,
  CheckCircle,
  X,
  Gift,
  Bell,
  Sliders,
  Award,
  Flame,
  Snowflake,
  CloudSun,
  Cloud,
  Smile,
  Compass,
  Star,
  Minus,
  Plus
} from 'lucide-react';
import {
  QuestionnaireAnswers,
  RecommendationResult,
  BabyAge,
  BabyState,
  PeriodOfDay,
  EnvironmentCondition,
  AmbientFeeling
} from './types.ts';
import { calculateClothing } from './babyLogic.ts';

// Import local premium asset paths
const babyHeroImg = 'https://site.maecompleta.com/wp-content/uploads/2026/06/ChatGPT-Image-5-de-jun.-de-2026-23_06_49.png';
const menuClothesLogoImg = 'https://site.maecompleta.com/wp-content/uploads/2026/06/Design-sem-nome-36.png';

// Database of clothes matching Portuguese logical codes
const CLOTHING_DATABASE: Record<string, { name: string; desc: string; url: string; heatingLevel: string }> = {
  'body-manga-longa': {
    name: 'Body Manga Longa',
    desc: 'Algodão macio encostado na pele para aquecer os bracinhos.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-114453.png',
    heatingLevel: 'Médio'
  },
  'body-manga-curta': {
    name: 'Body Manga Curta',
    desc: 'Peça essencial leve, perfeitamente arejada para dias quentes.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-114507.png',
    heatingLevel: 'Leve'
  },
  'calca': {
    name: 'Calça Culote (Mijão)',
    desc: 'Algodão macio para cobrir e dar total mobilidade às perninhas.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-114519.png',
    heatingLevel: 'Leve'
  },
  'macacao-algodao': {
    name: 'Macacão de Algodão (leve)',
    desc: 'Macacão leve de algodão ideal para temperaturas agradáveis ou amenas.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-114531.png',
    heatingLevel: 'Leve'
  },
  'macacao-soft': {
    name: 'Macacão Soft/Peluciado',
    desc: 'Ideal para dias frescos e de meia-estação.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-115407.png',
    heatingLevel: 'Médio'
  },
  'macacao-plush': {
    name: 'Macacão Plush',
    desc: 'Aconchegante camada aveludada para combater o frio intenso.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-114550.png',
    heatingLevel: 'Alto'
  },
  'saco-dormir-leve': {
    name: 'Saco de dormir leve',
    desc: 'Mantém o bebê coberto a noite toda com frescor ideal.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-115515.png',
    heatingLevel: 'Leve'
  },
  'saco-dormir-soft': {
    name: 'Saco de dormir soft',
    desc: 'Protege o bebê contra friagens moderadas durante o sono.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-115422.png',
    heatingLevel: 'Médio'
  },
  'saco-dormir-plush': {
    name: 'Saco de dormir plush com mangas',
    desc: 'Proteção térmica total e segura para o bebê nos dias mais frios.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-115437.png',
    heatingLevel: 'Muito Alto'
  },
  'meias': {
    name: 'Meias de Bebê',
    desc: 'Proteção suave e macia para evitar os pezinhos gelados.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-114627.png',
    heatingLevel: 'Leve'
  },
  'touca': {
    name: 'Touca Protetora',
    desc: 'Garante proteção para os ouvidos em locais frios ou sob vento.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-114635.png',
    heatingLevel: 'Médio'
  },
  'luvas': {
    name: 'Luvas Macias',
    desc: 'Ideal para manter as mãozinhas quentes e seguras nas frentes frias.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-114650.png',
    heatingLevel: 'Leve'
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'inicio' | 'historico' | 'favoritos' | 'mais'>('inicio');
  const [screen, setScreen] = useState<'welcome' | 'loading' | 'result'>('welcome');

  // Unified Form input matching the visual mockup
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    feeling: 'agradavel',
    period: 'dia',
    state: 'acordado',
    age: '1-6-meses',
    condition: 'fechado',
    temperature: null
  });

  const [tempInputValue, setTempInputValue] = useState<string>('22');
  const [result, setResult] = useState<RecommendationResult | null>(null);

  // loading screen text loop
  const [loadingText, setLoadingText] = useState('Analisando as variáveis de clima...');

  // Overlays / notifications / sidebar states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPwaInstructionOpen, setIsPwaInstructionOpen] = useState(false);
  const [bellNotification, setBellNotification] = useState<string | null>(null);

  // Local storage lists for history + favorites
  const [historyList, setHistoryList] = useState<Array<{ id: string; timestamp: string; answers: QuestionnaireAnswers; result: RecommendationResult }>>([]);
  const [favoritesList, setFavoritesList] = useState<Array<{ id: string; answers: QuestionnaireAnswers; result: RecommendationResult }>>([]);

  // Load history/favorites from localStorage on run
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('climababy_history');
      if (savedHistory) setHistoryList(JSON.parse(savedHistory));
      
      const savedFavorites = localStorage.getItem('climababy_favorites');
      if (savedFavorites) setFavoritesList(JSON.parse(savedFavorites));
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
  }, []);

  const saveHistory = (newHistory: typeof historyList) => {
    setHistoryList(newHistory);
    localStorage.setItem('climababy_history', JSON.stringify(newHistory));
  };

  const saveFavorites = (newFavorites: typeof favoritesList) => {
    setFavoritesList(newFavorites);
    localStorage.setItem('climababy_favorites', JSON.stringify(newFavorites));
  };

  const toggleFavorite = (answersObj: QuestionnaireAnswers, resultObj: RecommendationResult) => {
    const key = JSON.stringify(answersObj);
    const exists = favoritesList.find(f => JSON.stringify(f.answers) === key);
    if (exists) {
      const filtered = favoritesList.filter(f => JSON.stringify(f.answers) !== key);
      saveFavorites(filtered);
    } else {
      const added = [...favoritesList, { id: 'fav_' + Date.now(), answers: answersObj, result: resultObj }];
      saveFavorites(added);
    }
  };

  const isCurrentFavorite = () => {
    if (!result) return false;
    const key = JSON.stringify(answers);
    return favoritesList.some(f => JSON.stringify(f.answers) === key);
  };

  // Loading animation message sequence
  useEffect(() => {
    if (screen !== 'loading') return;

    const messages = [
      'Sentindo se há brisa ou vento lá fora... 🍃',
      'Dobrando as roupinhas com carinho... 🧺',
      'Analisando as variáveis de clima... 🌡️',
      'Calculando o equilíbrio seguro de camadas... ⚖️',
      'Prontinho! Preparando as orientações... ❤️'
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < messages.length - 1) {
        messageIndex++;
        setLoadingText(messages[messageIndex]);
      }
    }, 450);

    const timeout = setTimeout(() => {
      const parsedTemp = tempInputValue && !isNaN(Number(tempInputValue)) ? Number(tempInputValue) : null;
      const finalAnswers = { ...answers, temperature: parsedTemp };
      const calcResult = calculateClothing(finalAnswers);
      
      setResult(calcResult);
      
      // Save to history storage
      const historyItem = {
        id: 'hist_' + Date.now(),
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        answers: finalAnswers,
        result: calcResult
      };
      const updatedHistory = [historyItem, ...historyList].slice(0, 20); // Keep last 20
      saveHistory(updatedHistory);
      
      setScreen('result');
    }, 1800);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [screen, answers, tempInputValue]);

  const handleGetRecommendation = () => {
    setLoadingText('Consultando roupinha ideal...');
    setScreen('loading');
  };

  const handleLoadFromHistoryOrFavorites = (savedAns: QuestionnaireAnswers, savedRes: RecommendationResult) => {
    setAnswers(savedAns);
    setTempInputValue(savedAns.temperature !== null ? String(savedAns.temperature) : '');
    setResult(savedRes);
    setActiveTab('inicio');
    setScreen('result');
  };

  const getAgeFriendlyName = (ageKey: BabyAge) => {
    switch (ageKey) {
      case 'recem-nascido': return 'Recém-nas.';
      case '1-6-meses': return '1 a 6 m';
      case '6-12-meses': return '6 a 12 m';
      case 'mais-de-1-ano': return 'Acima 1 ano';
    }
  };

  const getConditionFriendlyName = (condKey: EnvironmentCondition) => {
    switch (condKey) {
      case 'fechado': return 'Fechado';
      case 'ventilador': return 'Ventilador';
      case 'ar-condicionado': return 'Ar-cond.';
      case 'vento-frio': return 'Vento Frio';
      case 'externo': return 'Área ext.';
    }
  };

  const getFeelingFriendlyDescription = (feelKey: AmbientFeeling) => {
    switch (feelKey) {
      case 'muito-quente': return 'Muito quente';
      case 'quente': return 'Quente';
      case 'agradavel': return 'Agradável';
      case 'fresquinho': return 'Fresquinho';
      case 'frio': return 'Frio';
      case 'muito-frio': return 'Muito frio';
    }
  };

  // Instant update in results view
  const handleImmediateAdjustment = (field: keyof QuestionnaireAnswers, value: any) => {
    setAnswers(prev => {
      const updated = { ...prev, [field]: value };
      const calcResult = calculateClothing(updated);
      setResult(calcResult);
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE] text-[#5F5A55] flex flex-col items-center justify-start pb-28 px-4 sm:px-6 relative overflow-x-hidden antialiased main-app-container">
      
      {/* TOPO: Compact Premium App Header Layout */}
      <header className="w-full max-w-xl flex items-center justify-between py-2 mb-4 z-20 relative px-1">
        <div className="flex items-center">
          {/* Menu button inspired by modern iOS apps */}
          <motion.button 
            id="btn-open-menu"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#EDE5DB]/70 rounded-full shadow-[0_2px_12px_rgba(75,70,66,0.03)] hover:bg-[#FAF9F5] text-[#5F5A55] transition-all cursor-pointer text-xs font-bold"
          >
            <div className="flex flex-col gap-0.5 items-center justify-center">
              <span className="w-3.5 h-[1.8px] bg-[#5F5A55] rounded-full" />
              <span className="w-3.5 h-[1.8px] bg-[#5F5A55] rounded-full" />
              <span className="w-3.5 h-[1.8px] bg-[#5F5A55] rounded-full" />
            </div>
            <span>Menu</span>
          </motion.button>
        </div>

        {/* Small Centralized Brand Logo */}
        <motion.div 
          onClick={() => { setActiveTab('inicio'); setScreen('welcome'); }}
          className="cursor-pointer flex items-center gap-1 focus:outline-none"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <img 
            src={menuClothesLogoImg} 
            alt="Logo ClimaBaby" 
            className="h-5 w-auto object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex items-center font-logo tracking-tight text-base leading-none select-none">
            <span className="font-bold text-[#8EB79F]">Clima</span>
            <span className="font-bold text-[#E49F8C]">Baby</span>
          </div>
        </motion.div>

        {/* Right Active Bell Notification Button */}
        <div className="flex items-center">
          <motion.button 
            id="header-btn-notification"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setBellNotification("🛡️ Tudo perfeito por aqui! Não há alertas climáticos severos para as próximas horas.");
            }}
            className="w-10 h-10 bg-white border border-[#EDE5DB]/70 rounded-full shadow-[0_2px_12px_rgba(75,70,66,0.03)] hover:bg-[#FAF9F5] text-[#5F5A55] transition-all cursor-pointer flex items-center justify-center relative shrink-0"
            title="Notificações"
          >
            <Bell className="w-4 h-4 text-[#5F5A55] stroke-[2]" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#E49F8C] rounded-full ring-2 ring-white animate-pulse" />
          </motion.button>
        </div>
      </header>

      {/* BELL NOTIFICATION POPUP PANEL */}
      <AnimatePresence>
        {bellNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-xl mx-auto mb-4 bg-emerald-50 border border-emerald-150 rounded-2xl p-4 shadow-sm z-30 relative text-left"
          >
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">🙌</span>
              <p className="text-xs text-emerald-800 font-semibold leading-relaxed flex-1">
                {bellNotification}
              </p>
              <button 
                onClick={() => setBellNotification(null)}
                className="p-1 hover:bg-emerald-100 text-emerald-600 rounded-full cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN VIEW SYSTEM MAP SWITCH (INICIO / HISTORICO / FAVORITOS / MAIS) */}
      <div className="w-full max-w-xl z-10">
        
        {activeTab === 'inicio' && (
          <AnimatePresence mode="wait">
            
            {/* WELCOME DASHBOARD INI SCREEN */}
            {screen === 'welcome' && (
              <motion.div
                key="welcome-dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2.5"
                id="screen-welcome"
              >
                
                {/* NEW INTEGRATED LANDING HERO (SEAMLESSLY DE-CARDED, BLENDS INTO PAGE BACKGROUND - Ajuste 1) */}
                <div className="w-full relative overflow-hidden py-3 sm:py-4 mb-0 flex flex-col justify-center min-h-[135px] sm:min-h-[145px] select-none">
                  
                  {/* Floating ambient glow wash behind the text and baby - Soft ethereal background (Ajuste 1, 3) */}
                  <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[85%] h-[150%] rounded-full bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F4C7B8]/30 blur-[28px] opacity-90 -z-10 pointer-events-none" />

                  {/* Floating ornaments surrounding the baby on the right side */}
                  <div className="absolute right-[-4%] top-0 bottom-0 w-[58%] pointer-events-none select-none z-10 overflow-hidden">
                    
                    {/* The baby image - aligned right, borderless, organic float transition, enlarged ~15% (Ajuste 2) */}
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-[105%] h-[115%] max-h-[160px] overflow-hidden rounded-2xl border-2 border-white/80 shadow-3xs">
                      <img 
                        src={babyHeroImg} 
                        alt="Bebê dormindo" 
                        className="w-full h-full object-cover object-center"
                        referrerPolicy="no-referrer"
                      />
                      {/* Ethereal light peach overlay */}
                      <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    </div>

                    {/* Highly discreet, premium floating graphic shapes (Ajuste 6) */}
                    <motion.div 
                      animate={{ y: [0, -4, 0], rotate: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="absolute left-[5%] top-[18%] text-amber-400/70 opacity-60 flex items-center justify-center pointer-events-none"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    </motion.div>

                    <motion.div 
                      animate={{ y: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                      className="absolute right-[8%] top-[10%] text-[#E29A88]/80 opacity-70 pointer-events-none"
                    >
                      <Heart className="w-2.5 h-2.5 fill-[#E29A88] text-[#E29A88]" />
                    </motion.div>

                    <motion.div 
                      animate={{ y: [0, -3, 0], scale: [0.95, 1.05, 0.95] }}
                      transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                      className="absolute left-[12%] bottom-[18%] text-[#6E8FBE] opacity-50 pointer-events-none"
                    >
                      <Moon className="w-3.5 h-3.5 fill-[#6E8FBE]/20 text-[#6E8FBE]" />
                    </motion.div>

                    <motion.div 
                      animate={{ scale: [1, 1.12, 1] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="absolute right-[18%] bottom-[15%] text-amber-400 opacity-70 pointer-events-none"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </motion.div>

                    <motion.div 
                      animate={{ x: [0, 2, 0] }}
                      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                      className="absolute left-[1%] top-[45%] text-emerald-400/60 opacity-55 flex items-center justify-center pointer-events-none"
                    >
                      <Cloud className="w-3.5 h-3.5 fill-emerald-50/40 text-emerald-400" />
                    </motion.div>
                  </div>

                  {/* LEFT TEXT PANEL — occupying ~50% width to prevent overlap (Ajuste 8) */}
                  <div className="w-[52%] sm:w-[50%] z-20 text-left space-y-1 relative select-none pr-1">
                    <span className="inline-block text-[8.5px] font-black text-[#CB7C69] bg-[#FFF3EE] px-2.5 py-0.5 rounded-full border border-[#F4C7B8]/40 tracking-wider uppercase">
                      🍼 Guia Inteligente
                    </span>
                    <h2 className="text-md sm:text-lg font-black text-[#5F5A55] tracking-tight leading-tight">
                      Como vestir seu bebê hoje? 💛
                    </h2>
                    <p className="text-[10px] sm:text-[11px] text-[#5F5A55]/85 font-medium leading-relaxed">
                      Descubra a roupa ideal em menos de 30 segundos.
                    </p>
                  </div>

                </div>
 
                {/* INSTRUCTIONAL CALL TO ACTION (FONTE DE TÍTULO, COR SECUNDÁRIA, CENTRALIZADO, BASTANTE RESPIRO ACIMA E ABAIXO) */}
                <div className="text-center py-6 sm:py-8 px-4 select-none">
                  <h3 className="font-logo font-bold text-sm sm:text-[15px] text-[#CB7C69] leading-relaxed max-w-xs sm:max-w-md mx-auto">
                    Escolha as opções abaixo e descubra a combinação ideal de roupas para o seu bebê.
                  </h3>
                </div>

                {/* FORM AREA: INDEPENDENT STYLISH WIDGET CARDS FOR NATIVE APP FEEL */}
                <div className="space-y-3">
                  
                  {/* BLOCO 1: Como está o ambiente? */}
                  <div className="bg-white/70 hover:bg-white/95 backdrop-blur-[6px] rounded-[1.75rem] border border-[#EDE5DB]/30 p-4 shadow-3xs hover:shadow-2xs transition-all duration-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-[#5F5A55]/70 uppercase tracking-wider block">
                        Como está o ambiente?
                      </label>
                      <span className="text-[9px] text-[#A1BDD1] font-bold bg-[#EDF4F9]/70 px-2.5 py-0.5 rounded-full">Clima ideal</span>
                    </div>

                    {/* Premium Outline iOS Buttons Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {([
                        { value: 'muito-quente', label: 'Muito quente', icon: <Flame className="w-4 h-4 transition-transform duration-300" />, activeClass: 'bg-[#FFF3EE] border-[#F4C7B8] text-[#CB7C69] shadow-[0_4px_16px_rgba(244,199,184,0.3)] ring-1 ring-[#F4C7B8]/40' },
                        { value: 'quente', label: 'Quente', icon: <Sun className="w-4 h-4 transition-transform duration-300" />, activeClass: 'bg-[#FFF9E6] border-[#FADCA0] text-[#B5823D] shadow-[0_4px_16px_rgba(250,220,160,0.25)] ring-1 ring-[#FADCA0]/30' },
                        { value: 'agradavel', label: 'Agradável', icon: <CloudSun className="w-4 h-4 transition-transform duration-300" />, activeClass: 'bg-[#F2F5EE] border-[#BFC8B2] text-[#697453] shadow-[0_4px_16px_rgba(191,200,178,0.3)] ring-1 ring-[#BFC8B2]/40' },
                        { value: 'fresquinho', label: 'Fresquinho', icon: <Cloud className="w-4 h-4 transition-transform duration-300" />, activeClass: 'bg-[#EDF4F9] border-[#A1BDD1] text-[#41729C] shadow-[0_4px_16px_rgba(161,189,209,0.25)] ring-1 ring-[#A1BDD1]/30' },
                        { value: 'frio', label: 'Frio', icon: <Thermometer className="w-4 h-4 transition-transform duration-300" />, activeClass: 'bg-[#ECF1F7] border-[#9BC4E0] text-[#2C5272] shadow-[0_4px_16px_rgba(155,196,224,0.25)] ring-1 ring-[#9BC4E0]/30' },
                        { value: 'muito-frio', label: 'Muito frio', icon: <Snowflake className="w-4 h-4 transition-transform duration-300" />, activeClass: 'bg-[#F3EEF9] border-[#DCCFE8] text-[#5B437C] shadow-[0_4px_16px_rgba(220,207,232,0.3)] ring-1 ring-[#DCCFE8]/40' }
                      ] as const).map((item) => {
                        const isSelected = answers.feeling === item.value;
                        return (
                          <motion.button
                            key={item.value}
                            type="button"
                            id={`feel-btn-${item.value}`}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setAnswers(prev => ({ ...prev, feeling: item.value }))}
                            className={`py-2 px-2 rounded-xl border-1.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 relative ${
                              isSelected
                                ? `${item.activeClass} font-bold scale-[1.03]`
                                : 'bg-white/80 border-[#EDE5DB]/70 text-[#5F5A55] hover:bg-[#F8F4EE] hover:border-slate-350 shadow-[0_1px_4px_rgba(95,90,85,0.01)]'
                            }`}
                          >
                            <span className={`${isSelected ? 'scale-110 text-current' : 'opacity-70'}`}>
                              {item.icon}
                            </span>
                            <span className="text-[10.5px] leading-tight select-none font-sans font-bold">
                              {item.label}
                            </span>
                            
                            {/* Selected micro circle */}
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#E29A88] border-2 border-white flex items-center justify-center shadow-3xs">
                                <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* BLOCO 2: Qual o momento? */}
                  <div className="bg-white/70 hover:bg-white/95 backdrop-blur-[6px] rounded-[1.75rem] border border-[#EDE5DB]/30 p-4 shadow-3xs hover:shadow-2xs transition-all duration-300 space-y-3">
                    <label className="text-[10px] font-black text-[#5F5A55]/70 uppercase tracking-wider block">
                      Qual o momento?
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { value: 'dia', label: 'Dia', icon: <Sun className="w-4 h-4 text-[#B5823D]" />, activeClass: 'bg-[#FFF9E6] border-[#FADCA0] text-[#B5823D] shadow-[0_4px_16px_rgba(250,220,160,0.25)] ring-1 ring-[#FADCA0]/30' },
                        { value: 'noite', label: 'Noite', icon: <Moon className="w-4 h-4 text-[#5B437C]" />, activeClass: 'bg-[#F3EEF9] border-[#DCCFE8] text-[#5B437C] shadow-[0_4px_16px_rgba(220,207,232,0.3)] ring-1 ring-[#DCCFE8]/40' }
                      ] as const).map((item) => {
                        const isSelected = answers.period === item.value;
                        return (
                          <motion.button
                            key={item.value}
                            type="button"
                            id={`period-btn-${item.value}`}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setAnswers(prev => ({ ...prev, period: item.value }))}
                            className={`py-2.5 px-3 rounded-xl border-1.5 transition-all cursor-pointer flex items-center justify-center gap-2.5 relative ${
                              isSelected
                                ? `${item.activeClass} font-bold scale-[1.03]`
                                : 'bg-white/80 border-[#EDE5DB]/70 text-[#5F5A55] hover:bg-[#F8F4EE] shadow-[0_1px_4px_rgba(95,90,85,0.01)]'
                            }`}
                          >
                            <span className={`${isSelected ? 'scale-110' : 'opacity-70'}`}>
                              {item.icon}
                            </span>
                            <span className="text-xs font-bold font-sans">{item.label}</span>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#E29A88] border-2 border-white flex items-center justify-center shadow-3xs">
                                <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* BLOCO 3: O bebê estará: */}
                  <div className="bg-white/70 hover:bg-white/95 backdrop-blur-[6px] rounded-[1.75rem] border border-[#EDE5DB]/30 p-4 shadow-3xs hover:shadow-2xs transition-all duration-300 space-y-3">
                    <label className="text-[10px] font-black text-[#5F5A55]/70 uppercase tracking-wider block">
                      O bebê estará:
                    </label>

                    <div className="grid grid-cols-2 gap-2.5">
                      {([
                        { value: 'acordado', label: 'Acordado', icon: <Smile className="w-4 h-4 text-[#8CB69F]" /> },
                        { value: 'dormindo', label: 'Dormindo', icon: <Moon className="w-4 h-4 text-[#5B437C]" /> },
                        { value: 'colo-sling', label: 'Colo ou sling', icon: <Heart className="w-4 h-4 text-[#E29A88]" /> },
                        { value: 'passeando', label: 'Passeando', icon: <Compass className="w-4 h-4 text-[#41729C]" /> }
                      ] as const).map((item) => {
                        const isSelected = answers.state === item.value;
                        return (
                          <motion.button
                            key={item.value}
                            type="button"
                            id={`state-btn-${item.value}`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setAnswers(prev => ({ ...prev, state: item.value }))}
                            className={`py-2.5 px-3 rounded-xl border-1.5 transition-all cursor-pointer flex items-center gap-2.5 text-left relative ${
                              isSelected
                                ? 'bg-[#FFF3EE] border-[#F4C7B8] text-[#CB7C69] shadow-[0_4px_16px_rgba(244,199,184,0.3)] ring-1 ring-[#F4C7B8]/40 font-bold scale-[1.03]'
                                : 'bg-white/80 border-[#EDE5DB]/70 text-[#5F5A55] hover:bg-[#F8F4EE] shadow-[0_1px_4px_rgba(95,90,85,0.01)]'
                            }`}
                          >
                            <span className={`${isSelected ? 'scale-110 text-current' : 'opacity-70'}`}>
                              {item.icon}
                            </span>
                            <span className="text-xs font-bold font-sans">{item.label}</span>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#E29A88] border-2 border-white flex items-center justify-center shadow-3xs">
                                <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* BLOCO 4: Idade do bebê */}
                  <div className="bg-white/70 hover:bg-white/95 backdrop-blur-[6px] rounded-[1.75rem] border border-[#EDE5DB]/30 p-4 shadow-3xs hover:shadow-2xs transition-all duration-300 space-y-3">
                    <label className="text-[10px] font-black text-[#5F5A55]/70 uppercase tracking-wider block">
                      Idade do bebê
                    </label>

                    <div className="grid grid-cols-2 gap-2.5">
                      {([
                        { value: 'recem-nascido', label: 'Recém-nascido', icon: <Baby className="w-4 h-4 text-[#E29A88]" /> },
                        { value: '1-6-meses', label: '1 a 6 meses', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
                        { value: '6-12-meses', label: '6 a 12 meses', icon: <Award className="w-4 h-4 text-[#8CB69F]" /> },
                        { value: 'mais-de-1-ano', label: 'Acima de 1 ano', icon: <Star className="w-4 h-4 text-indigo-400" /> }
                      ] as const).map((item) => {
                        const isSelected = answers.age === item.value;
                        return (
                          <motion.button
                            key={item.value}
                            type="button"
                            id={`age-btn-${item.value}`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setAnswers(prev => ({ ...prev, age: item.value }))}
                            className={`py-2.5 px-3 rounded-xl border-1.5 transition-all cursor-pointer flex items-center gap-2.5 text-left relative ${
                              isSelected
                                ? 'bg-[#F2F5EE] border-[#BFC8B2] text-[#697453] shadow-[0_4px_16px_rgba(191,200,178,0.3)] ring-1 ring-[#BFC8B2]/40 font-bold scale-[1.03]'
                                : 'bg-white/80 border-[#EDE5DB]/70 text-[#5F5A55] hover:bg-[#F8F4EE] shadow-[0_1px_4px_rgba(95,90,85,0.01)]'
                            }`}
                          >
                            <span className={`${isSelected ? 'scale-110 text-current' : 'opacity-70'}`}>
                              {item.icon}
                            </span>
                            <span className="text-xs font-bold font-sans">{item.label}</span>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#E29A88] border-2 border-white flex items-center justify-center shadow-3xs">
                                <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* BLOCO 5: Ambiente */}
                  <div className="bg-white/70 hover:bg-white/95 backdrop-blur-[6px] rounded-[1.75rem] border border-[#EDE5DB]/30 p-4 shadow-3xs hover:shadow-2xs transition-all duration-300 space-y-3">
                    <label className="text-[10px] font-black text-[#5F5A55]/70 uppercase tracking-wider block">
                      Ambiente
                    </label>

                    <div className="grid grid-cols-2 gap-2.5">
                      {([
                        { value: 'fechado', label: 'Ambiente fechado', icon: <Home className="w-4 h-4 text-[#8CB69F]" /> },
                        { value: 'ventilador', label: 'Ventilador', icon: <Wind className="w-4 h-4 text-[#41729C]" /> },
                        { value: 'ar-condicionado', label: 'Ar-condicionado', icon: <Snowflake className="w-4 h-4 text-sky-400" /> },
                        { value: 'vento-frio', label: 'Vento frio', icon: <Wind className="w-4 h-4 text-slate-500" /> },
                        { value: 'externo', label: 'Área externa', icon: <Compass className="w-4 h-4 text-emerald-600" />, span: true }
                      ] as const).map((item) => {
                        const isSelected = answers.condition === item.value;
                        return (
                          <motion.button
                            key={item.value}
                            type="button"
                            id={`cond-btn-${item.value}`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setAnswers(prev => ({ ...prev, condition: item.value }))}
                            className={`py-2.5 px-3 rounded-xl border-1.5 transition-all cursor-pointer flex items-center gap-2.5 text-left relative ${
                              ('span' in item && item.span) ? 'col-span-2 justify-center py-2.5' : 'py-2.5'
                            } ${
                              isSelected
                                ? 'bg-[#EDF4F9] border-[#A1BDD1] text-[#41729C] shadow-[0_4px_16px_rgba(161,189,209,0.25)] ring-1 ring-[#A1BDD1]/30 font-bold scale-[1.03]'
                                : 'bg-white/80 border-[#EDE5DB]/70 text-[#5F5A55] hover:bg-[#F8F4EE] shadow-[0_1px_4px_rgba(95,90,85,0.01)]'
                            }`}
                          >
                            <span className={`${isSelected ? 'scale-110 text-current' : 'opacity-70'}`}>
                              {item.icon}
                            </span>
                            <span className="text-xs font-bold font-sans">{item.label}</span>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#E29A88] border-2 border-white flex items-center justify-center shadow-3xs">
                                <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* OPÇÃO DE TEMPERATURA APROXIMADA: Interactive rounded iOS +/- adjuster */}
                  <div className="bg-white/70 hover:bg-white/95 backdrop-blur-[6px] rounded-[1.75rem] border border-[#EDE5DB]/30 p-4 shadow-3xs hover:shadow-2xs transition-all duration-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#5F5A55]/70 uppercase tracking-wider block">
                        Temperatura aproximada
                      </span>
                      <span className="text-[9px] text-[#8CB69F] font-bold bg-[#F2F5EE]/70 px-2.5 py-0.5 rounded-full">Toque para ajustar</span>
                    </div>

                    <div className="flex items-center justify-between bg-white border border-[#EDE5DB]/60 rounded-2xl p-2 max-w-[280px] mx-auto shadow-4xs">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => {
                          const current = Number(tempInputValue) || 22;
                          if (current > 5) setTempInputValue(String(current - 1));
                        }}
                        className="w-10 h-10 rounded-xl bg-[#FAF8F5] text-[#5F5A55] border border-[#EDE5DB]/50 flex items-center justify-center hover:bg-[#F3EDE4] transition-colors cursor-pointer select-none"
                      >
                        <Minus className="w-4 h-4 text-[#5F5A55] stroke-[3]" />
                      </motion.button>

                      <div className="flex flex-col items-center justify-center min-w-[100px] select-none">
                        <span className="text-xl font-black font-sans text-[#5F5A55] leading-none flex items-baseline gap-0.5">
                          {tempInputValue || '22'}
                          <span className="text-sm font-extrabold text-[#E29A88]">°C</span>
                        </span>
                        <span className="text-[8.5px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Ajuste fino</span>
                      </div>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => {
                          const current = Number(tempInputValue) || 22;
                          if (current < 45) setTempInputValue(String(current + 1));
                        }}
                        className="w-10 h-10 rounded-xl bg-[#FAF8F5] text-[#5F5A55] border border-[#EDE5DB]/50 flex items-center justify-center hover:bg-[#F3EDE4] transition-colors cursor-pointer select-none"
                      >
                        <Plus className="w-4 h-4 text-[#5F5A55] stroke-[3]" />
                      </motion.button>
                    </div>
                  </div>

                  {/* BOTÃO PRINCIPAL: Grande, Centralizado, Cor Principal da Marca */}
                  <div className="pt-2">
                    <motion.button
                      id="btn-get-recommendation"
                      onClick={handleGetRecommendation}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4.5 bg-[#E29A88] hover:bg-[#D58876] text-white font-bold rounded-[1.5rem] shadow-[0_8px_24px_rgba(226,154,140,0.35)] cursor-pointer flex items-center justify-center gap-2 text-sm transition-all tracking-wide text-center uppercase"
                    >
                      <Sparkles className="w-5 h-5 text-white animate-pulse" />
                      <span className="font-display font-extrabold text-white tracking-widest text-xs">Ver recomendação</span>
                    </motion.button>
                  </div>

                </div>

                {/* TRUST BADGES ROW */}
                <div className="grid grid-cols-3 gap-2 py-4 bg-[#FFF9E6]/20 border border-[#EDE5DB]/50 rounded-[1.5rem] px-3 sm:px-4 text-center select-none">
                  <div className="flex flex-col items-center justify-center p-2.5 space-y-1 border-r border-[#EDE5DB]/60">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-800 block font-display leading-none">Seguro e confiável</span>
                    <span className="text-[8px] text-slate-400 block font-sans leading-relaxed">Baseado em especialistas</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2.5 space-y-1 border-r border-[#EDE5DB]/60">
                    <Heart className="w-5 h-5 text-[#E29A88] fill-current shrink-0" />
                    <span className="text-[10px] font-bold text-slate-800 block font-display leading-none">Feito para mães</span>
                    <span className="text-[8px] text-slate-400 block font-sans leading-relaxed">Prático e acolhedor</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2.5 space-y-1">
                    <Award className="w-5 h-5 text-[#8CB69F] shrink-0" />
                    <span className="text-[10px] font-bold text-slate-800 block font-display leading-none">Sempre Atualizado</span>
                    <span className="text-[8px] text-slate-400 block font-sans leading-relaxed">Ideal para cada estação</span>
                  </div>
                </div>

              </motion.div>
            )}

            {/* LOADING PULSING TRANSITION SCREEN */}
            {screen === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col justify-center items-center py-24 px-8 text-center bg-white rounded-[2rem] border border-[#EDE5DB] shadow-sm"
                id="screen-loading"
              >
                <div className="relative mb-6">
                  <div className="absolute -inset-3 bg-gradient-to-r from-pink-300 via-emerald-200 to-amber-200 rounded-full blur-md opacity-40 animate-pulse" />
                  <div className="relative w-20 h-20 bg-white border border-pink-100 rounded-full flex items-center justify-center shadow-sm">
                    <motion.div
                      animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                      className="text-3xl select-none"
                    >
                      👶
                    </motion.div>
                    <div className="absolute -top-1 -right-1 text-xl select-none animate-bounce">✨</div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.h3
                    key={loadingText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-bold text-[#6F2718] max-w-xs mt-2"
                  >
                    {loadingText}
                  </motion.h3>
                </AnimatePresence>

                <p className="text-[11px] text-slate-400 font-medium mt-3 max-w-xs leading-relaxed">
                  Calculando as camadas para {getAgeFriendlyName(answers.age)} no clima de {getFeelingFriendlyDescription(answers.feeling)}...
                </p>
              </motion.div>
            )}

            {/* COZY RECOMMENDATION REPORT SCREEN */}
            {screen === 'result' && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
                id="screen-result"
              >
                {/* Result header card */}
                <div className="bg-white border border-[#EDE5DB] rounded-[2rem] shadow-sm p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#FAF2EC] gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-[#FAF2EC] text-[#E29A88] border border-[#F5E1D5]">
                        <Baby className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div>
                        <span className="text-[9px] bg-[#E29A88]/10 text-[#B96552] font-extrabold uppercase px-2.5 py-0.5 rounded-full block w-max mb-1 select-none font-sans">
                          Look Recomendado
                        </span>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight">
                          {result.temperatureCategory}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Active Favorite Toggle */}
                      <button
                        onClick={() => toggleFavorite(answers, result)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                          isCurrentFavorite()
                            ? 'bg-rose-50 border-rose-200 text-rose-500'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                        title="Salvar nos Favoritos"
                      >
                        <Heart className={`w-4 h-4 ${isCurrentFavorite() ? 'fill-current' : ''}`} />
                      </button>

                      {/* Instant Interactive adjustments right on the results screen */}
                      <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                        <button
                          onClick={() => handleImmediateAdjustment('period', answers.period === 'dia' ? 'noite' : 'dia')}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold cursor-pointer text-[#5F5A55]"
                        >
                          {answers.period === 'dia' ? '☀️ Dia' : '🌙 Noite'}
                        </button>
                        <button
                          onClick={() => {
                            const states: BabyState[] = ['acordado', 'dormindo', 'colo-sling', 'passeando'];
                            const nextIdx = (states.indexOf(answers.state) + 1) % states.length;
                            handleImmediateAdjustment('state', states[nextIdx]);
                          }}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold cursor-pointer text-[#5F5A55]"
                        >
                          🔄 {answers.state === 'colo-sling' ? 'Colo' : answers.state === 'acordado' ? 'Acordado' : answers.state === 'dormindo' ? 'Dormindo' : 'Passeando'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Context interpretation caption */}
                  <div className="bg-[#FFF9E6]/30 border border-amber-100 rounded-2xl p-4 text-xs text-slate-705 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#E29A88] shrink-0 mt-0.5 animate-pulse" />
                    <p className="leading-relaxed font-sans">{result.temperatureDescription}</p>
                  </div>

                  {/* RECOMMENDED LAYERS STACK COZY BADGE */}
                  <div className="bg-gradient-to-tr from-[#FAF2EC] via-white to-[#FDFBF7] border border-[#F2ECE5] rounded-2xl p-4.5 shadow-3xs relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <span className="text-[9px] font-extrabold text-[#B96552] block uppercase tracking-wider font-sans leading-none">
                          Método de Camadas ClimaBaby
                        </span>
                        <h4 className="text-md font-bold text-slate-800 font-display">
                          {result.layerCount} {result.layerCount === 1 ? 'Camada de Proteção' : 'Camadas de Proteção'}
                        </h4>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed font-sans">
                          {result.layersDescription}
                        </p>
                      </div>

                      {/* Vertical stacked visual lines of safety layers */}
                      <div className="flex flex-col gap-1 w-full md:w-44 shrink-0 font-sans">
                        {(result.layerDetails || [
                          {
                            id: 'base',
                            name: '🟦 Camada Base',
                            items: 'Body manga longa + calça',
                            funcao: 'Toque inicial super macio, mantendo contato delicado e protegendo os bracinhos e as perninhas.',
                            color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
                          }
                        ]).map((layer, idx) => {
                          return (
                            <div key={idx} className={`text-[9px] font-bold py-1 px-2.5 rounded-lg border border-dashed flex justify-between items-center ${layer.color}`}>
                              <span>{layer.name}</span>
                              <span className="text-[7px] bg-white px-1 py-0.2 rounded border border-current font-extrabold">OK</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* CLOTHING OUTFIT ITEMS PHOTO VISUAL SHOWCASE */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800 block font-display">
                      👕 Peças Escolhidas para o Look
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {result.visualItems.map((itemId) => {
                        const cloth = CLOTHING_DATABASE[itemId];
                        if (!cloth) return null;

                        let levelColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                        if (cloth.heatingLevel === 'Médio') {
                          levelColor = 'bg-amber-50 text-amber-700 border-amber-100';
                        } else if (cloth.heatingLevel === 'Alto' || cloth.heatingLevel === 'Muito Alto') {
                          levelColor = 'bg-rose-50 text-rose-700 border-rose-100';
                        }

                        return (
                          <motion.div
                            key={itemId}
                            whileHover={{ y: -1.5 }}
                            className="bg-[#FFFDF9] border border-slate-100 hover:border-[#E29A88] rounded-2xl overflow-hidden flex flex-col justify-between shadow-3xs transition-all p-1"
                          >
                            <div className="aspect-square bg-white rounded-xl p-2.5 flex items-center justify-center relative border border-slate-50">
                              <img
                                src={cloth.url}
                                alt={cloth.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain mix-blend-multiply"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  try {
                                    const fb = e.currentTarget.nextElementSibling as HTMLDivElement;
                                    if (fb) fb.style.display = 'flex';
                                  } catch {}
                                }}
                              />
                              <div style={{ display: 'none' }} className="absolute inset-0 bg-slate-50 flex-col items-center justify-center text-center p-2 rounded-xl">
                                <Shirt className="w-5 h-5 text-slate-300 mb-1" />
                                <span className="text-[8px] text-slate-400 font-bold uppercase font-sans">Visual</span>
                              </div>
                            </div>

                            <div className="p-2 space-y-1 flex-1 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] font-bold text-slate-800 block truncate leading-none font-sans">{cloth.name}</span>
                                <span className="text-[8.5px] text-slate-400 leading-tight block line-clamp-2 mt-0.5 font-sans">{cloth.desc}</span>
                              </div>

                              <div className="pt-1.5 mt-1 border-t border-slate-50 flex items-center justify-between text-[7.5px] font-bold uppercase text-slate-400 font-sans">
                                <span>Aquece</span>
                                <span className={`px-1 py-0.2 rounded text-[7px] border font-bold ${levelColor}`}>{cloth.heatingLevel}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COLO AND SLING NOTE CARDS */}
                  {answers.state === 'colo-sling' && (
                    <div className="bg-[#FAF2EC] border border-[#F2DCD0] rounded-xl p-3 text-xs text-[#B96552] leading-relaxed font-sans font-medium">
                      💡 <strong>Aconchego do Colo ou Sling:</strong> Como o contato corpo a corpo transmite muito calor natural dos pais, removemos automaticamente uma camada de roupinha para evitar desconforto. Aproveite esse chamego quentinho!
                    </div>
                  )}

                  {/* ESSENTIAL SUMMARY FROM MOM CONSULTANT */}
                  <div className="bg-[#FAF2EC]/50 rounded-2xl p-4.5 border border-[#F2DCD0] relative">
                    <span className="absolute -top-2.5 left-4 px-3 py-0.5 bg-[#E29A88] text-white text-[8px] font-bold uppercase tracking-widest rounded-lg shadow-3xs font-sans">
                      Orientação da Consultora 💛
                    </span>
                    <div className="space-y-2 mt-1">
                      {result.cozyParagraphs.map((para, i) => (
                        <p key={i} className="text-[#5F5A55] text-xs font-semibold leading-relaxed font-sans">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* IMPORTANT STACK ACCENT DETAIL CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="bg-[#FFFDF9] border border-slate-150 rounded-xl p-4 space-y-2">
                      <span className="text-[9px] font-extrabold text-[#B96552] uppercase tracking-wider block font-sans">
                        ✓ Peças Recomendadas
                      </span>
                      <ul className="space-y-1.5">
                        {result.outfitSuggestions.map((item, idx) => (
                          <li key={idx} className="text-[11px] text-[#4B4642] flex items-start gap-1.5 leading-relaxed font-bold font-sans">
                            <span className="text-[#E29A88] shrink-0">🌸</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#FFFDF9] border border-slate-150 rounded-xl p-4 space-y-2">
                      <span className="text-[9px] font-extrabold text-[#B96552] uppercase tracking-wider block font-sans">
                        🧵 Tecidos Ideais
                      </span>
                      <ul className="space-y-1.5">
                        {result.recommendedFabrics.map((item, idx) => (
                          <li key={idx} className="text-[11px] text-[#4B4642] flex items-start gap-1.5 leading-relaxed font-medium font-sans">
                            <span className="text-emerald-500 font-bold shrink-0">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[8px] text-slate-400 font-bold font-sans leading-none block">
                        *Dê preferência a fibras naturais suaves.
                      </p>
                    </div>
                  </div>

                  {/* COZY COMFORT ADJUSTMENT OBSERVATION CARD */}
                  <div className="bg-[#FFFDF9] border border-slate-150 rounded-xl p-4 space-y-1.5 text-left">
                    <span className="text-[9px] font-extrabold text-[#B96552] uppercase tracking-wider block font-sans">
                      🧦 Ajustes de conforto (opcional)
                    </span>
                    <p className="text-[11px] text-[#4B4642] leading-relaxed font-sans font-medium">
                      Cada bebê sente a temperatura de uma forma diferente. Caso necessário, pequenos ajustes como meias podem ser adicionados conforme a resposta do bebê.
                    </p>
                  </div>

                  {/* DYNAMIC ORIENTATION CARD: 💛 Orientação ClimaBaby */}
                  <div className="bg-[#FAF2EC]/50 border border-[#F2DCD0] rounded-2xl p-5 space-y-4 text-left">
                    <span className="text-[10px] font-extrabold bg-[#E29A88] text-white px-3 py-1 rounded-full uppercase tracking-wider font-sans inline-block leading-none">
                      💛 Orientação ClimaBaby
                    </span>
                    
                    {answers.state === 'dormindo' ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-md">😴</span>
                          <h4 className="text-[11.5px] font-bold text-slate-800 font-sans leading-tight">
                            Sono seguro ClimaBaby
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-700 font-bold font-sans leading-none block">
                          Mantenha seu bebê aquecido com segurança.
                        </p>
                        <ul className="space-y-2 pl-0.5">
                          <li className="text-[11px] text-slate-604 leading-relaxed flex items-start gap-2 font-sans font-medium">
                            <span className="text-[#E29A88] shrink-0 mt-0.5">•</span>
                            <span>Evite cobertores, mantas ou lençóis soltos dentro do berço sem supervisão.</span>
                          </li>
                          <li className="text-[11px] text-slate-604 leading-relaxed flex items-start gap-2 font-sans font-medium">
                            <span className="text-[#E29A88] shrink-0 mt-0.5">•</span>
                            <span>Não utilize toucas ou gorros durante o sono, pois podem aumentar o risco de superaquecimento e também apresentar risco de obstrução das vias respiratórias.</span>
                          </li>
                          <li className="text-[11px] text-slate-604 leading-relaxed flex items-start gap-2 font-sans font-medium">
                            <span className="text-[#E29A88] shrink-0 mt-0.5">•</span>
                            <span>Prefira um saco de dormir adequado à temperatura do ambiente, pois ele mantém o bebê aquecido sem a necessidade de cobertores soltos.</span>
                          </li>
                        </ul>
                        <div className="pt-2.5 border-t border-dashed border-[#F2DCD0] text-[10.5px] text-[#B96552] leading-relaxed font-semibold font-sans">
                          💛 Lembre-se: mãos e pezinhos frios nem sempre significam que o bebê está com frio. Observe principalmente a temperatura da nuca e do peitinho.
                        </div>
                      </div>
                    ) : (answers.feeling === 'frio' || answers.feeling === 'muito-frio') ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-md">❄️</span>
                          <h4 className="text-[11.5px] font-bold text-slate-800 font-sans leading-tight">
                            Cuidados nos dias frios
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-700 font-bold font-sans leading-none block">
                          Proteção sem excesso de roupas.
                        </p>
                        <ul className="space-y-2 pl-0.5">
                          <li className="text-[11px] text-slate-604 leading-relaxed flex items-start gap-2 font-sans font-medium">
                            <span className="text-[#E29A88] shrink-0 mt-0.5">•</span>
                            <span>Ao sair para ambientes externos, proteja o bebê do vento e do frio intenso.</span>
                          </li>
                          <li className="text-[11px] text-slate-604 leading-relaxed flex items-start gap-2 font-sans font-medium">
                            <span className="text-[#E29A88] shrink-0 mt-0.5">•</span>
                            <span>Ao retornar para locais aquecidos, retire camadas extras e reavalie o conforto térmico para evitar superaquecimento.</span>
                          </li>
                        </ul>
                        <div className="pt-2.5 border-t border-dashed border-[#F2DCD0] text-[10.5px] text-[#B96552] leading-relaxed font-semibold font-sans">
                          💛 Verifique sempre a nuca e o peitinho para avaliar a temperatura do bebê. Mãos e pés frios nem sempre significam que ele está com frio.
                        </div>
                      </div>
                    ) : (answers.feeling === 'quente' || answers.feeling === 'muito-quente') ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-md">☀️</span>
                          <h4 className="text-[11.5px] font-bold text-slate-800 font-sans leading-tight">
                            Conforto nos dias quentes
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-700 font-bold font-sans leading-none block">
                          Menos roupas também é cuidado.
                        </p>
                        <ul className="space-y-2 pl-0.5">
                          <li className="text-[11px] text-slate-604 leading-relaxed flex items-start gap-2 font-sans font-medium">
                            <span className="text-[#E29A88] shrink-0 mt-0.5">•</span>
                            <span>Prefira tecidos leves e respiráveis, como algodão, permitindo melhor ventilação da pele.</span>
                          </li>
                          <li className="text-[11px] text-slate-604 leading-relaxed flex items-start gap-2 font-sans font-medium">
                            <span className="text-[#E29A88] shrink-0 mt-0.5">•</span>
                            <span>Observe sinais de calor excessivo como suor, pele avermelhada, irritação ou desconforto.</span>
                          </li>
                        </ul>
                        <div className="pt-2.5 border-t border-dashed border-[#F2DCD0] text-[10.5px] text-[#B96552] leading-relaxed font-semibold font-sans">
                          💛 Em ambientes quentes, evite adicionar camadas desnecessárias apenas porque as mãos ou os pés parecem frios.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-md">🧸</span>
                          <h4 className="text-[11.5px] font-bold text-slate-800 font-sans leading-tight">
                            Conforto no dia a dia
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-700 font-bold font-sans leading-none block">
                          Cada bebê pode sentir a temperatura de uma forma diferente.
                        </p>
                        <ul className="space-y-2 pl-0.5">
                          <li className="text-[11px] text-slate-604 leading-relaxed flex items-start gap-2 font-sans font-medium">
                            <span className="text-[#E29A88] shrink-0 mt-0.5">•</span>
                            <span>A recomendação do ClimaBaby é um guia para ajudar na escolha das roupas, mas observar os sinais do seu bebê é sempre o mais importante.</span>
                          </li>
                        </ul>
                        <div className="pt-2.5 border-t border-dashed border-[#F2DCD0] text-[10.5px] text-[#B96552] leading-relaxed font-semibold font-sans">
                          💛 Um bebê confortável costuma ter a nuca e o peitinho com temperatura agradável, sem suor excessivo ou sensação de frio.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Recalculation Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      id="btn-recalculate"
                      onClick={() => {
                        setScreen('welcome');
                      }}
                      className="flex-1 py-4 bg-[#E29A88] hover:bg-[#D48977] text-white text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-sm font-sans"
                    >
                      <RefreshCw className="w-4 h-4" /> Recalcular Outro Período
                    </button>
                    
                    <button
                      type="button"
                      id="btn-reset"
                      onClick={() => {
                        setAnswers({
                          feeling: 'agradavel',
                          period: 'dia',
                          state: 'acordado',
                          age: '1-6-meses',
                          condition: 'fechado',
                          temperature: null
                        });
                        setTempInputValue('');
                        setScreen('welcome');
                      }}
                      className="px-5 py-4 bg-white hover:bg-slate-50 text-slate-605 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer shadow-3xs font-sans"
                    >
                      Limpar Tudo
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        )}

        {/* HISTÓRICO TAB VIEW */}
        {activeTab === 'historico' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white border border-[#EDE5DB] rounded-[2rem] p-5 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#FAF2EC]">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#E29A88]" />
                  <h3 className="text-md font-bold text-slate-800">Histórico de Consultas</h3>
                </div>
                <button
                  type="button"
                  onClick={() => saveHistory([])}
                  className="text-[10px] text-slate-400 font-bold hover:text-[#B96552] uppercase cursor-pointer"
                >
                  Limpar histórico
                </button>
              </div>

              {historyList.length === 0 ? (
                <div className="text-center py-10 space-y-3 font-sans">
                  <span className="text-3xl block">🧺</span>
                  <p className="text-xs text-slate-400 font-medium">Nenhuma consulta realizada recentemente.</p>
                  <p className="text-[10px] text-slate-400">As consultas que você fizer serão salvas localmente aqui para rápido acesso.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyList.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleLoadFromHistoryOrFavorites(item.answers, item.result)}
                      className="p-3 bg-[#FCFBF8] border border-slate-100 hover:border-[#E29A88] hover:bg-[#FAF2EC]/50 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2"
                    >
                      <div className="space-y-1 font-sans flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-800 bg-[#FAF2EC] px-2 py-0.5 rounded-md text-[#B96552]">
                            {getAgeFriendlyName(item.answers.age)}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">{item.timestamp}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-700 block truncate">
                          {getFeelingFriendlyDescription(item.answers.feeling)} • {item.result.layerCount} {item.result.layerCount === 1 ? 'Camada' : 'Camadas'}
                        </h4>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* FAVORITOS TAB VIEW */}
        {activeTab === 'favoritos' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white border border-[#EDE5DB] rounded-[2rem] p-5 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#FAF2EC]">
                <Heart className="w-5 h-5 text-rose-500 fill-current" />
                <h3 className="text-md font-bold text-slate-800">Meus Looks Favoritos</h3>
              </div>

              {favoritesList.length === 0 ? (
                <div className="text-center py-10 space-y-3 font-sans">
                  <span className="text-3xl block">💖</span>
                  <p className="text-xs text-slate-400 font-medium">Você ainda não favoritou nenhuma recomendação.</p>
                  <p className="text-[10px] text-slate-450 max-w-xs mx-auto leading-relaxed">
                    Clique no botão de coração ao realizar uma recomendação inteligente para salvá-la aqui como look de acesso imediato.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favoritesList.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3.5 bg-[#FFFDF9] border border-slate-100 hover:border-[#E29A88] rounded-2xl transition-all flex items-center justify-between gap-4"
                    >
                      <div 
                        onClick={() => handleLoadFromHistoryOrFavorites(item.answers, item.result)}
                        className="space-y-1 font-sans flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold text-white bg-[#E29A88] px-2 py-0.5 rounded-full leading-none">
                            {getAgeFriendlyName(item.answers.age)}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-800 bg-[#EEFAF2] px-2 py-0.5 rounded-full leading-none">
                            {getConditionFriendlyName(item.answers.condition)}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 block truncate mt-1">
                          {item.result.temperatureCategory}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{item.result.layersDescription}</p>
                      </div>

                      <button
                        onClick={() => toggleFavorite(item.answers, item.result)}
                        className="p-2 hover:bg-rose-50 text-rose-500 rounded-full cursor-pointer shrink-0"
                        title="Remover dos favoritos"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* MAIS OPTION TAB VIEW */}
        {activeTab === 'mais' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white border border-[#EDE5DB] rounded-[2rem] p-5 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#FAF2EC]">
                <Info className="w-5 h-5 text-[#E29A88]" />
                <h3 className="text-md font-bold text-slate-800">Mais Opções</h3>
              </div>

              <div className="space-y-2.5 font-sans">
                {/* About ClimaBaby Panel */}
                <button
                  onClick={() => setIsAboutOpen(true)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-[#FAF2EC]/40 rounded-xl text-left font-bold text-xs text-slate-700 transition-all cursor-pointer border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <Info className="w-4.5 h-4.5 text-[#E29A88]" />
                    <div>
                      <span className="block">Sobre o ClimaBaby</span>
                      <span className="text-[9.5px] font-normal text-slate-400 block mt-0.5">Conheça o segredo das camadas seguras</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Installation tutorial panel */}
                <button
                  onClick={() => setIsPwaInstructionOpen(true)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-[#FAF2EC]/40 rounded-xl text-left font-bold text-xs text-slate-705 transition-all cursor-pointer border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4.5 h-4.5 text-[#E29A88]" />
                    <div>
                      <span className="block font-bold">Como baixar no celular</span>
                      <span className="text-[9.5px] font-normal text-slate-400 block mt-0.5">Transforme o ClimaBaby em App</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Support Link */}
                <a
                  href="https://wa.me/message/R2T4NMNY46OEL1"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-[#FAF2EC]/40 rounded-xl text-left font-bold text-xs text-slate-700 transition-all cursor-pointer border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4.5 h-4.5 text-[#E29A88]" />
                    <div>
                      <span className="block">Suporte no WhatsApp</span>
                      <span className="text-[9.5px] font-normal text-slate-400 block mt-0.5">Fale diretamente conosco</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>

                {/* Secret Coupon Group WhatsApp Link */}
                <a
                  href="https://chat.whatsapp.com/IvwQos4ntsGEfgLZzZdayx?mode=gi_t"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-[#FAF2EC]/40 rounded-xl text-left font-bold text-xs text-slate-750 transition-all cursor-pointer border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <Gift className="w-4.5 h-4.5 text-[#E29A88]" />
                    <div>
                      <span className="block">Grupo de Ofertas Especial</span>
                      <span className="text-[9.5px] font-normal text-slate-400 block mt-0.5">Fique por dentro das promoções</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* Footer copyright block */}
      <footer className="w-full max-w-xl text-center mt-5 text-[10px] text-slate-400 font-medium select-none z-10 font-sans">
        <p>Desenvolvido com carinho para proteger o seu pequeno. 🧸</p>
        <p>© 2026 ClimaBaby</p>
      </footer>

      {/* PERSISTENT FLOATING NAVIGATION TAB BAR AT AT THE BOTTOM (Exactly matching reference picture) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-150 py-2.5 px-6 flex justify-around items-center z-40 shadow-[0_-5px_22px_rgba(75,70,66,0.06)] rounded-t-3xl max-w-xl mx-auto">
        <button
          onClick={() => { setActiveTab('inicio'); }}
          className={`flex flex-col items-center gap-0.5 transition-all w-16 cursor-pointer ${
            activeTab === 'inicio' ? 'text-[#E29A88] font-bold font-display scale-105' : 'text-slate-405 hover:text-slate-600 font-sans'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px]">Início</span>
        </button>

        <button
          onClick={() => { setActiveTab('historico'); }}
          className={`flex flex-col items-center gap-0.5 transition-all w-16 cursor-pointer ${
            activeTab === 'historico' ? 'text-[#E29A88] font-bold font-display scale-105' : 'text-slate-405 hover:text-slate-600 font-sans'
          }`}
        >
          <Clock className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px]">Histórico</span>
        </button>

        <button
          onClick={() => { setActiveTab('favoritos'); }}
          className={`flex flex-col items-center gap-0.5 transition-all w-16 cursor-pointer ${
            activeTab === 'favoritos' ? 'text-[#E29A88] font-bold font-display scale-105' : 'text-slate-405 hover:text-slate-600 font-sans'
          }`}
        >
          <Heart className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px]">Favoritos</span>
        </button>

        <button
          onClick={() => { setActiveTab('mais'); }}
          className={`flex flex-col items-center gap-0.5 transition-all w-16 cursor-pointer ${
            activeTab === 'mais' ? 'text-[#E29A88] font-bold font-display scale-105' : 'text-slate-450 hover:text-slate-600 font-sans'
          }`}
        >
          <div className="flex gap-1 items-center justify-center pt-1 pb-1 w-5">
            <span className="w-1 h-1 bg-current rounded-full" />
            <span className="w-1 h-1 bg-current rounded-full" />
            <span className="w-1 h-1 bg-current rounded-full" />
          </div>
          <span className="text-[10px]">Mais</span>
        </button>
      </nav>

      {/* SIDEBAR DRAWER AND INFORMATION OVERLAYS */}
      <AnimatePresence>
        
        {/* Navigation/utility Menu Drawer overlay */}
        {isMenuOpen && (
          <React.Fragment key="drawer-overlay-holder">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-[#3D3936] z-45 cursor-pointer"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 210 }}
              className="fixed top-0 left-0 bottom-0 w-[84%] max-w-[310px] bg-white z-50 shadow-2xl flex flex-col justify-between rounded-r-3xl border-r border-[#EDE5DB] font-sans"
            >
              <div className="p-5 flex-1 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-1.5">
                    <img 
                      src={menuClothesLogoImg} 
                      alt="Logo ClimaBaby" 
                      className="h-8 w-auto object-contain shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-logo font-medium text-[18px] leading-none select-none flex items-center">
                        <span className="text-[#8EB79F]">Clima</span>
                        <span className="text-[#E49F8C]">Baby</span>
                      </div>
                      <span className="text-[8px] text-slate-400 font-extrabold block uppercase tracking-wider mt-1">Consultoria Especializada</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 hover:bg-slate-50 text-slate-500 rounded-xl cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 flex-1">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveTab('inicio');
                      setScreen('welcome');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left font-bold text-xs text-slate-700 hover:bg-[#FAF2EC]/50 cursor-pointer transition-all"
                  >
                    <Home className="w-4 h-4 text-[#E29A88]" />
                    <span>Início</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveTab('historico');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left font-bold text-xs text-slate-700 hover:bg-[#FAF2EC]/50 cursor-pointer transition-all"
                  >
                    <Clock className="w-4 h-4 text-[#E29A88]" />
                    <span>Histórico de consultas</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveTab('favoritos');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left font-bold text-xs text-slate-700 hover:bg-[#FAF2EC]/50 cursor-pointer transition-all"
                  >
                    <Heart className="w-4 h-4 text-[#E29A88]" />
                    <span>Looks Favoritos</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAboutOpen(true);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left font-bold text-xs text-slate-700 hover:bg-[#FAF2EC]/50 cursor-pointer transition-all"
                  >
                    <Info className="w-4 h-4 text-[#E29A88]" />
                    <span>Sobre o ClimaBaby</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsPwaInstructionOpen(true);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left font-bold text-xs text-slate-705 hover:bg-[#FAF2EC]/50 cursor-pointer transition-all"
                  >
                    <Smartphone className="w-4 h-4 text-[#E29A88]" />
                    <div>
                      <span className="block font-bold">Instalar Aplicativo</span>
                      <span className="text-[8.5px] font-normal text-slate-400 block">Facilite seu acesso diário</span>
                    </div>
                  </button>

                  <a
                    href="https://wa.me/message/R2T4NMNY46OEL1"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left font-bold text-xs text-slate-705 hover:bg-[#FAF2EC]/50 cursor-pointer transition-all block"
                  >
                    <HelpCircle className="w-4 h-4 text-[#E29A88]" />
                    <div>
                      <span className="block">Dúvidas ou Sugestões</span>
                      <span className="text-[8.5px] font-normal text-slate-400 block">Fale conosco por WhatsApp</span>
                    </div>
                  </a>
                </div>

                <div className="mt-4 bg-[#FAF2EC]/30 p-4 rounded-2xl border border-[#EDE5DB]/50 text-center">
                  <p className="text-[10px] text-slate-500 leading-normal mb-3 font-semibold">
                    Tenha o ClimaBaby direto na sua tela inicial para usar a qualquer momento!
                  </p>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsPwaInstructionOpen(true);
                    }}
                    className="w-full py-2 bg-[#E29A88] hover:bg-[#D48977] text-white text-[10px] font-bold rounded-lg cursor-pointer font-sans"
                  >
                    Instalar Aplicativo
                  </button>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-[#FDFBF7] text-center">
                <span className="text-[9px] text-slate-400 block font-mono">ClimaBaby v4.2 PRO</span>
              </div>
            </motion.div>
          </React.Fragment>
        )}

        {/* Modal: About ClimaBaby */}
        {isAboutOpen && (
          <React.Fragment key="about-modal-holder">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAboutOpen(false)}
              className="fixed inset-0 bg-[#3D3936] z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-[2rem] p-5 shadow-2xl z-55 border border-[#EDE5DB] text-center font-sans"
            >
              <div className="w-11 h-11 bg-[#FAF2EC] text-[#E29A88] rounded-full flex items-center justify-center mx-auto border border-[#F5E1D5] mb-3">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-md text-slate-800 leading-tight mb-2">Sobre o ClimaBaby</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3 font-semibold text-left">
                O <strong>ClimaBaby</strong> é uma consultoria inteligente de camadas desenvolvida para simplificar a vida de mães e pais, sugerindo looks plenamente ajustados ao clima e à rotina do bebê.
              </p>
              <p className="text-[10px] text-slate-450 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-150 mb-4 font-semibold text-left">
                Consideramos a ventilação, o uso de ar condicionado, vento e o sono seguro. O método evita colocar toucas ou cobertores soltos durante o sono noturno sem supervisão, eliminando riscos de asfixia e oferecendo o Saco de Dormir como alternativa primária.
              </p>
              <button
                onClick={() => setIsAboutOpen(false)}
                className="w-full py-2.5 bg-[#E29A88] hover:bg-[#D48977] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Concluir
              </button>
            </motion.div>
          </React.Fragment>
        )}

        {/* Modal: PWA Installation instructions */}
        {isPwaInstructionOpen && (
          <React.Fragment key="install-modal-holder">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPwaInstructionOpen(false)}
              className="fixed inset-0 bg-[#3D3936] z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-[2rem] p-5 shadow-2xl z-55 border border-[#EDE5DB] font-sans"
            >
              <div className="w-11 h-11 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mx-auto border border-slate-200 mb-3">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-center text-md text-slate-800 leading-tight mb-1">Passo a Passo de Instalação</h3>
              
              <div className="space-y-3 py-2 text-xs text-slate-600 font-medium leading-relaxed">
                <p className="text-center text-[10.5px] text-slate-450">
                  Tenha acesso imediato ao ClimaBaby adicionando o ícone à tela inicial!
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1">
                  <span className="font-bold text-slate-800 text-[9.5px] block uppercase tracking-wider">No iPhone (iOS - Safari)</span>
                  <ol className="list-decimal list-inside text-slate-600 text-[9px] space-y-1">
                    <li>Toque no botão de <strong>Compartilhar</strong> <Share2 className="w-3.5 h-3.5 inline text-slate-800" />.</li>
                    <li>Role as opções e clique em <strong>Adicionar à Tela de Início</strong>.</li>
                  </ol>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1">
                  <span className="font-bold text-slate-800 text-[9.5px] block uppercase tracking-wider">No Android (Chrome)</span>
                  <ol className="list-decimal list-inside text-slate-600 text-[9px] space-y-1">
                    <li>Toque nas <strong>configurações (três pontinhos)</strong> no canto superior.</li>
                    <li>Clique na opção <strong>Instalar Aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
                  </ol>
                </div>
              </div>

              <button
                onClick={() => setIsPwaInstructionOpen(false)}
                className="w-full py-2.5 bg-[#E29A88] hover:bg-[#D48977] text-white text-xs font-bold rounded-xl cursor-pointer text-center mt-3"
              >
                Entendido!
              </button>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>

    </div>
  );
}
