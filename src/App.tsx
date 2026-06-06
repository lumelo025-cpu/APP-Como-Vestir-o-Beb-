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
  Award
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
import babyHeroImg from './assets/images/baby_sleeping_hero_1780707097305.png';
import menuClothesLogoImg from './assets/images/menu_clothes_logo_1779899134603.png';

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

  const [tempInputValue, setTempInputValue] = useState<string>('');
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
    <div className="min-h-screen bg-[#FAF5EE] text-[#4B4642] flex flex-col items-center justify-start pb-28 pt-4 px-4 sm:px-6 relative overflow-x-hidden antialiased">
      
      {/* Decorative Warm Elements to Match Cozy Visual Aesthetic */}
      <div className="absolute top-0 inset-x-0 h-[380px] bg-gradient-to-b from-[#F9F0E6] via-[#FAF5EE] to-transparent pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#F7E0D5]/50 via-[#E4EDE7]/30 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-24 left-10 w-24 h-24 rounded-full bg-[#FAF0E6]/70 blur-xl pointer-events-none" />

      {/* Playful & Cozy Header with PWA install shortcuts */}
      <header className="w-full max-w-xl flex items-center justify-between py-1.5 mb-5 z-20 relative px-1">
        <div className="flex items-center">
          {/* Menu Button precisely like picture (fully round, white/gray, clear lines) */}
          <motion.button 
            id="btn-open-menu"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(true)}
            className="w-12 h-12 bg-white border border-[#EDE5DB]/70 rounded-full shadow-[0_2px_12px_rgba(75,70,66,0.04)] hover:bg-[#FAF9F5] text-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <div className="flex flex-col gap-1 w-4.5 items-center justify-center">
              <span className="w-4.5 h-[1.8px] bg-[#8B847C] rounded-full" />
              <span className="w-4.5 h-[1.8px] bg-[#8B847C] rounded-full" />
              <span className="w-4.5 h-[1.8px] bg-[#8B847C] rounded-full" />
            </div>
          </motion.button>
        </div>

        {/* Brand Hanger-Heart Wordmark Logo precisely matches ClimaBaby custom colors & bare image placement */}
        <motion.div 
          onClick={() => { setActiveTab('inicio'); setScreen('welcome'); }}
          className="cursor-pointer flex items-center gap-1.5"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <img 
            src={menuClothesLogoImg} 
            alt="Logo ClimaBaby" 
            className="h-10 w-auto object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex items-center font-display tracking-tight text-[24px]">
            <span className="font-semibold text-[#8EB79F]">Clima</span>
            <span className="font-medium text-[#E49F8C]">Baby</span>
          </div>
        </motion.div>

        {/* Right Active Bell Notification Button (fully round, exact inline position and orange badge) */}
        <div className="flex items-center">
          <motion.button 
            id="header-btn-notification"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setBellNotification("🛡️ Tudo perfeito por aqui! Não há alertas climáticos severos para as próximas horas.");
            }}
            className="w-12 h-12 bg-white border border-[#EDE5DB]/70 rounded-full shadow-[0_2px_12px_rgba(75,70,66,0.04)] hover:bg-[#FAF9F5] text-slate-700 transition-all cursor-pointer flex items-center justify-center relative shrink-0"
            title="Alertas do Dia"
          >
            <Bell className="w-5 h-5 text-[#8B847C] stroke-[2]" />
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
                id="screen-welcome"
              >
                
                {/* HERO BLOCK WITH GEOMETRIC BEAUTY AND GENERATED PHOTO */}
                <div className="flex flex-row items-center justify-between gap-2.5 py-4 relative overflow-visible bg-transparent rounded-3xl">
                  
                  {/* Left Headings Column */}
                  <div className="space-y-4 flex-1 max-w-[56%] z-10 text-left">
                    <h2 className="text-[34px] sm:text-[38px] font-bold text-[#4B4642] tracking-normal leading-[1.12] font-display">
                      Seu bebê <br />
                      <span className="text-[#8EB79F] font-semibold text-[32px] sm:text-[36px] tracking-normal inline-block">merece o</span> <br />
                      <span className="text-[#E49F8C] font-semibold text-[32px] sm:text-[36px] tracking-normal inline-flex items-center gap-1">
                        conforto ideal.
                        {/* Custom floating heart sticker precisely like the peach heart in model image */}
                        <svg className="w-5 h-5 text-[#E49F8C] fill-current transform rotate-[15deg] shrink-0 inline-block ml-0.5" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </span>
                    </h2>
                    
                    <p className="text-[13px] sm:text-[14px] text-[#6E6760] font-normal leading-relaxed">
                      Responda em poucos segundos e descubra a roupa <span className="font-bold text-[#4B4642]">ideal</span> para cada momento do dia.
                    </p>
 
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#FAF4ED] text-[#716962] text-[11px] font-semibold rounded-2xl border border-[#EDE5DB]/50 shadow-[0_1px_4px_rgba(75,70,66,0.02)]">
                        {/* Elegant Green Shield Check precisely matching the mockup */}
                        <svg className="w-4.5 h-4.5 text-[#8EB79F] shrink-0 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Recomendações seguras baseadas em especialistas</span>
                      </span>
                    </div>
                  </div>
 
                  {/* Right circular baby portrait with exact mockup doodles */}
                  <div className="relative shrink-0 w-[148px] h-[148px] sm:w-[175px] sm:h-[175px] mr-1.5 z-10">
                    {/* Decorative Background Doodles exactly from the reference picture */}
                    
                    {/* 1. Custom Sun Doodle in top-left */}
                    <div className="absolute -top-4 -left-3 select-none flex items-center justify-center pointer-events-none z-20">
                      <div className="relative w-10 h-10">
                        {/* Sun core */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-[#FFD1A9]/90 border border-[#FCD2B3]" />
                        {/* Ray dashes */}
                        <span className="absolute top-1 left-1.5 w-1 h-2 bg-[#FFD1A9] rounded-full rotate-[-45deg]" />
                        <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-2 bg-[#FFD1A9] rounded-full" />
                        <span className="absolute top-1 right-1.5 w-1 h-2 bg-[#FFD1A9] rounded-full rotate-[45deg]" />
                        <span className="absolute top-1/2 -translate-y-1/2 right-0.5 w-2 h-1 bg-[#FFD1A9] rounded-full" />
                        <span className="absolute bottom-1 right-1.5 w-1 h-2 bg-[#FFD1A9] rounded-full rotate-[135deg]" />
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-2 bg-[#FFD1A9] rounded-full" />
                        <span className="absolute bottom-1 left-2 w-1 h-2 bg-[#FFD1A9] rounded-full rotate-[225deg]" />
                        <span className="absolute top-1/2 -translate-y-1/2 left-0.5 w-2 h-1 bg-[#FFD1A9] rounded-full" />
                      </div>
                    </div>
 
                    {/* 2. Soft lavender heart */}
                    <div className="absolute -top-3.5 left-[42%] select-none pointer-events-none z-20">
                      <svg className="w-4 h-4 text-[#C9BFD6] fill-current opacity-85 transform rotate-[-10deg]" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
 
                    {/* 3. Soft Green Cloud doodle exactly on top right */}
                    <div className="absolute -top-5 -right-1.5 select-none pointer-events-none z-20">
                      <div className="relative w-11 h-7 bg-[#8EB79F]/35 border border-[#8EB79F]/15 rounded-full blur-[0.4px]">
                        <div className="absolute -top-1.5 left-2 w-5 h-5 bg-[#8EB79F]/35 rounded-full" />
                        <div className="absolute -top-1 left-5.5 w-4.5 h-4.5 bg-[#8EB79F]/35 rounded-full" />
                      </div>
                    </div>
 
                    {/* Soft background peach-pink framing halo circle */}
                    <div className="absolute inset-1.5 bg-[#FAE7DF]/75 rounded-full pointer-events-none border border-[#FBE3D9]" />
                    
                    {/* Main Organic Soft Portrait Mask precisamente como na imagem */}
                    <div className="w-[92%] h-[92%] absolute top-[4%] left-[4%] rounded-full overflow-hidden border-[3px] border-white shadow-[0_4px_16px_rgba(75,70,66,0.06)] bg-white">
                      <img 
                        src={babyHeroImg} 
                        alt="Bebê dormindo confortavelmente" 
                        className="w-full h-full object-cover scale-[1.05]" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                {/* FORM CONTAINER - PREMIUM ROUNDED WHITE BENTO-CARD LAYOUT */}
                <div className="bg-white rounded-[2rem] border border-[#EDE5DB] shadow-[0_8px_30px_rgba(75,70,66,0.03)] p-5 sm:p-7 space-y-6">
                  
                  {/* SEÇÃO 1: COMO ESTÁ O AMBIENTE */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#FAF2EC] flex items-center justify-center text-[#E29A88] border border-[#F5E1D5]">
                        <Thermometer className="w-4.5 h-4.5 stroke-[2.5]" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Como está o ambiente agora?
                      </h4>
                    </div>

                    {/* Horizontal feeling buttons row exactly like layout reference */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {(['muito-quente', 'quente', 'agradavel', 'fresquinho', 'frio', 'muito-frio'] as AmbientFeeling[]).map((feel) => {
                        const isSelected = answers.feeling === feel;
                        const dataEmoji: Record<AmbientFeeling, { emoji: string; text: string; bg: string; textCol: string; borderCol: string }> = {
                          'muito-quente': { emoji: '🥵', text: 'Muito quente', bg: 'bg-amber-50', textCol: 'text-amber-800', borderCol: 'border-amber-400' },
                          'quente': { emoji: '☀️', text: 'Quente', bg: 'bg-[#FFF9E6]', textCol: 'text-amber-800', borderCol: 'border-amber-300' },
                          'agradavel': { emoji: '😊', text: 'Agradável', bg: 'bg-[#EEFAF2]', textCol: 'text-emerald-800', borderCol: 'border-[#A3E2B8]' },
                          'fresquinho': { emoji: '☁️', text: 'Fresquinho', bg: 'bg-[#F1F8FA]', textCol: 'text-blue-800', borderCol: 'border-blue-300' },
                          'frio': { emoji: '❄️', text: 'Frio', bg: 'bg-[#EDF4F9]', textCol: 'text-blue-900', borderCol: 'border-blue-400' },
                          'muito-frio': { emoji: '🥶', text: 'Muito frio', bg: 'bg-[#F2EEFA]', textCol: 'text-purple-900', borderCol: 'border-purple-300' }
                        };
                        const setup = dataEmoji[feel];

                        return (
                          <button
                            key={feel}
                            type="button"
                            id={`feel-btn-${feel}`}
                            onClick={() => setAnswers(prev => ({ ...prev, feeling: feel }))}
                            className={`py-3 px-1 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 relative ${
                              isSelected
                                ? `${setup.bg} ${setup.borderCol} ${setup.textCol} shadow-sm font-bold scale-102`
                                : 'bg-white border-[#EDE5DB] text-[#5F5A55] hover:bg-[#F8F4EE] hover:border-slate-300'
                            }`}
                          >
                            <span className="text-2xl select-none leading-none">{setup.emoji}</span>
                            <span className="text-[10px] leading-tight select-none font-bold font-sans">{setup.text}</span>
                            
                            {/* Checkmark indicator badge at top-right exactly like mockup */}
                            {isSelected && (
                              <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-3xs">
                                <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SEÇÃO 2: QUAL O MOMENTO (Horizontal Row layout like picture) */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-[#FAF2EC] gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FAF2EC] flex items-center justify-center text-[#E29A88]">
                        <Sun className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#4B4642]">Qual o momento?</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {(['dia', 'noite'] as PeriodOfDay[]).map((p) => {
                        const isSelected = answers.period === p;
                        const labelsEmoji: Record<PeriodOfDay, { text: string; icon: React.ReactNode }> = {
                          'dia': { text: 'Dia', icon: <Sun className="w-3.5 h-3.5 mr-1" /> },
                          'noite': { text: 'Noite', icon: <Moon className="w-3.5 h-3.5 mr-1" /> }
                        };
                        return (
                          <button
                            key={p}
                            type="button"
                            id={`period-btn-${p}`}
                            onClick={() => setAnswers(prev => ({ ...prev, period: p }))}
                            className={`py-2 px-4 rounded-xl border-2 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#FAF2EC] border-[#E29A88] text-[#B96552] font-semibold'
                                : 'bg-white border-[#EDE5DB] text-slate-700 hover:bg-[#F8F4EE]'
                            }`}
                          >
                            {labelsEmoji[p].icon}
                            <span>{labelsEmoji[p].text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SEÇÃO 3: O BEBÊ ESTARÁ */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-3 border-b border-[#FAF2EC] gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FAF2EC] flex items-center justify-center text-[#E29A88]">
                        <Baby className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#4B4642] whitespace-nowrap">O bebê estará...</span>
                    </div>

                    <div className="grid grid-cols-2 md:flex md:items-center md:flex-wrap gap-1.5 justify-end">
                      {(['acordado', 'dormindo', 'colo-sling', 'passeando'] as BabyState[]).map((st) => {
                        const isSelected = answers.state === st;
                        const stateLayout: Record<BabyState, { name: string; icon: string }> = {
                          'acordado': { name: 'Acordado', icon: '😊' },
                          'dormindo': { name: 'Dormindo', icon: '😴' },
                          'colo-sling': { name: 'No colo/sling', icon: '🤱' },
                          'passeando': { name: 'Passeando', icon: '🛒' }
                        };
                        return (
                          <button
                            key={st}
                            type="button"
                            id={`state-btn-${st}`}
                            onClick={() => setAnswers(prev => ({ ...prev, state: st }))}
                            className={`py-2 px-2 rounded-xl border-2 text-[10px] font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 min-w-[76px] ${
                              isSelected
                                ? 'bg-[#FAF2EC] border-[#E29A88] text-[#B96552]'
                                : 'bg-white border-[#EDE5DB] text-slate-700 hover:bg-[#F8F4EE]'
                            }`}
                          >
                            <span className="text-md leading-none select-none">{stateLayout[st].icon}</span>
                            <span className="leading-tight select-none font-sans font-semibold">{stateLayout[st].name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SEÇÃO 4: IDADE DO BEBÊ */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-3 border-b border-[#FAF2EC] gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FAF2EC] flex items-center justify-center text-[#E29A88]">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#4B4642] whitespace-nowrap font-sans">Idade do bebê</span>
                    </div>

                    <div className="grid grid-cols-2 md:flex md:items-center md:flex-wrap gap-1.5 justify-end">
                      {(['recem-nascido', '1-6-meses', '6-12-meses', 'mais-de-1-ano'] as BabyAge[]).map((ag) => {
                        const isSelected = answers.age === ag;
                        const labelText: Record<BabyAge, { text: string; sub: string; icon: string }> = {
                          'recem-nascido': { text: 'Recém-nas.', sub: '0 a 28 dias', icon: '👶' },
                          '1-6-meses': { text: '1 a 6 meses', sub: 'Bebezinho', icon: '🍼' },
                          '6-12-meses': { text: '6 a 12 m', sub: 'Engatinhando', icon: '👧' },
                          'mais-de-1-ano': { text: 'Acima 1 ano', sub: 'Andando', icon: '🌟' }
                        };
                        return (
                          <button
                            key={ag}
                            type="button"
                            id={`age-btn-${ag}`}
                            onClick={() => setAnswers(prev => ({ ...prev, age: ag }))}
                            className={`py-2 px-1 md:px-2.5 rounded-xl border-2 text-[10px] text-center leading-snug transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 min-w-[76px] ${
                              isSelected
                                ? 'bg-[#FAF2EC] border-[#E29A88] text-[#B96552] font-bold'
                                : 'bg-white border-[#EDE5DB] text-slate-705 hover:bg-[#F8F4EE]'
                            }`}
                          >
                            <span className="text-md leading-none select-none">{labelText[ag].icon}</span>
                            <span className="font-sans font-bold leading-none">{labelText[ag].text}</span>
                            <span className="text-[7.5px] opacity-75 font-sans leading-none">{labelText[ag].sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SEÇÃO 5: AMBIENTE (Condition) */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-3 border-b border-[#FAF2EC] gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FAF2EC] flex items-center justify-center text-[#E29A88]">
                        <Home className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#4B4642] whitespace-nowrap">Ambiente</span>
                    </div>

                    <div className="grid grid-cols-2 md:flex md:items-center md:flex-wrap gap-1.5 justify-end">
                      {(['fechado', 'ventilador', 'ar-condicionado', 'vento-frio', 'externo'] as EnvironmentCondition[]).map((cond) => {
                        const isSelected = answers.condition === cond;
                        const labelEmoji: Record<EnvironmentCondition, { text: string; icon: string }> = {
                          'fechado': { text: 'Fechado', icon: '🏠' },
                          'ventilador': { text: 'Ventilador', icon: '🌀' },
                          'ar-condicionado': { text: 'Ar-cond.', icon: '❄️' },
                          'vento-frio': { text: 'Vento frio', icon: '💨' },
                          'externo': { text: 'Área ext.', icon: '🌳' }
                        };
                        return (
                          <button
                            key={cond}
                            type="button"
                            id={`cond-btn-${cond}`}
                            onClick={() => setAnswers(prev => ({ ...prev, condition: cond }))}
                            className={`py-2 px-1 rounded-xl border-2 text-[10px] text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 min-w-[72px] ${
                              isSelected
                                ? 'bg-[#FAF2EC] border-[#E29A88] text-[#B96552] font-bold'
                                : 'bg-white border-[#EDE5DB] text-[#5F5A55] hover:bg-[#F8F4EE]'
                            }`}
                          >
                            <span className="text-md leading-none select-none">{labelEmoji[cond].icon}</span>
                            <span className="font-sans font-semibold leading-tight">{labelEmoji[cond].text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SEÇÃO OPCIONAL: TEMPERATURA APROXIMADA */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-[#FAF2EC] gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FAF2EC] flex items-center justify-center text-[#E29A88]">
                        <Thermometer className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#4B4642] block leading-none">Temperatura aproximada</span>
                        <span className="text-[8.5px] text-slate-400 font-semibold">(opcional)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 max-w-[170px] w-full">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          pattern="[0-9]*"
                          placeholder="Ex: 20°C"
                          value={tempInputValue}
                          onChange={(e) => setTempInputValue(e.target.value.replace(/[^0-9.-]/g, ''))}
                          className="w-full bg-[#FAFBF9] border border-[#EDE5DB] rounded-xl py-2 pl-3.5 pr-8 text-xs font-semibold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#FAF2EC]/50 focus:border-[#E29A88]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">°C</span>
                      </div>
                      {tempInputValue && (
                        <button
                          type="button"
                          onClick={() => setTempInputValue('')}
                          className="text-[9px] font-bold px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200/80 cursor-pointer"
                        >
                          X
                        </button>
                      )}
                    </div>
                  </div>

                  {/* BIG SUBMIT ACTION BUTTON AT THE BOTTOM OF THE CARD */}
                  <div className="pt-2">
                    <motion.button
                      id="btn-get-recommendation"
                      onClick={handleGetRecommendation}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-4.5 bg-gradient-to-r from-[#F4BFA8] to-[#E29A88] text-white font-semibold rounded-2xl shadow-sm cursor-pointer flex items-center justify-center gap-2 text-sm transition-all uppercase tracking-wider text-center"
                    >
                      <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
                      <span className="font-display font-medium text-white tracking-widest text-xs">Ver Recomendação Ideal</span>
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </motion.button>
                  </div>

                </div>

                {/* TRUST BADGES ROW EXACTLY MATCHING VISUAL PICTURE FOOTER DETAILS */}
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
                          {result.layerCount} {result.layerCount === 1 ? 'Camada Essencial' : 'Camadas de Roupas'}
                        </h4>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed font-sans">
                          {result.layersDescription}
                        </p>
                      </div>

                      {/* Vertical stacked visual lines of safety layers */}
                      <div className="flex flex-col gap-1 w-full md:w-44 shrink-0 font-sans">
                        {Array.from({ length: result.layerCount }).map((_, idx) => {
                          let layerColor = 'bg-slate-50 text-slate-600 border-slate-200';
                          let layerTag = '';
                          if (idx === 0) {
                            layerColor = 'bg-[#EDF4F9] text-blue-700 border-blue-105';
                            layerTag = '1ª Camada: Pele (Body)';
                          } else if (idx === 1) {
                            layerColor = 'bg-[#FAF2EC] text-[#B96552] border-[#F2DCD0]';
                            layerTag = '2ª Camada: Meio (Culote)';
                          } else {
                            layerColor = 'bg-[#EEFAF2] text-emerald-800 border-emerald-150';
                            layerTag = '3ª Camada: Calor (Macacão)';
                          }
                          return (
                            <div key={idx} className={`text-[9px] font-bold py-1 px-2.5 rounded-lg border border-dashed flex justify-between items-center ${layerColor}`}>
                              <span>{layerTag}</span>
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

                  {/* SAFE SLEEP CRITICAL BOX */}
                  <div className="bg-gradient-to-br from-purple-50 via-white to-[#FDFBF7] border border-purple-150 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#F3EEF9] flex items-center justify-center text-[#967CBA] shrink-0 mt-0.5">
                        <Moon className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <span className="text-[8px] font-extrabold bg-[#E6DCF1] text-purple-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans inline-block leading-none">
                          Alerta Crítico de Sono Seguro
                        </span>
                        <h5 className="text-[11px] font-bold text-slate-800 font-sans leading-snug">
                          Evite cobertores soltos e toucas durante o sono
                        </h5>
                        <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                          Para evitar riscos de asfixia e superaquecimento acidental, nunca use cobertores soltos ou toucas enquanto o bebê dorme no berço sem supervisão. Prefira sempre um saco de dormir macio de tamanho apropriado!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CRITICAL IMPORTANT VITAL WARNING NEWS */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-2 text-left">
                    <span className="text-[10px] font-bold text-slate-800 flex items-center gap-1.5 uppercase font-sans">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#E29A88]" /> Notas importantes de proteção
                    </span>
                    <ul className="space-y-1.5">
                      {result.importantAlerts.map((alert, idx) => (
                        <li key={idx} className="text-[10.5px] text-slate-600 leading-relaxed flex items-start gap-1 pb-1 border-b border-dashed border-slate-100 last:border-none font-sans">
                          <span className="text-[#E29A88] shrink-0 mt-0.5">⚠️</span>
                          <span>{alert}</span>
                        </li>
                      ))}
                    </ul>
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
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                      <img 
                        src={menuClothesLogoImg} 
                        alt="Logo ClimaBaby" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-none">ClimaBaby</h4>
                      <span className="text-[8px] text-slate-400 font-extrabold block uppercase tracking-wider mt-0.5">Consultoria Especializada</span>
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
