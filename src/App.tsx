/**
 * @license
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
  Compass,
  Sparkles,
  Heart,
  Info,
  AlertTriangle,
  RefreshCw,
  Check,
  ChevronRight,
  ChevronLeft,
  Tv,
  Layers,
  Shirt,
  HelpCircle,
  Clock,
  ExternalLink,
  Plus,
  Minus,
  CheckCircle,
  VolumeX,
  Footprints,
  Menu,
  X,
  Gift,
  Download,
  Share2,
  Smartphone
} from 'lucide-react';
import { QuestionnaireAnswers, RecommendationResult, BabyAge, BabyState, PeriodOfDay, ThermalSensitivity, EnvironmentCondition, AmbientFeeling } from './types.ts';
import { calculateClothing } from './babyLogic.ts';
const menuClothesLogo = "https://site.maecompleta.com/wp-content/uploads/2026/05/Design-sem-nome-34.png";

// Illustrative baby clothes catalog with exact premium image assets and heating levels
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
    desc: 'Algodão ultra flexível para cobrir e dar total mobilidade às perninhas.',
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
    name: 'Macacão Soft/Peluciado (meia-estação)',
    desc: 'Ideal para dias frescos e de meia-estação.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-115407.png',
    heatingLevel: 'Médio'
  },
  'macacao-plush': {
    name: 'Macacão Plush (inverno intenso)',
    desc: 'Aconchegante camada aveludada para combater o frio intenso.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-114550.png',
    heatingLevel: 'Alto'
  },
  'saco-dormir-leve': {
    name: 'Saco de dormir leve (verão)',
    desc: 'Mantém o bebê coberto a noite toda com frescor ideal.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-115515.png',
    heatingLevel: 'Leve'
  },
  'saco-dormir-soft': {
    name: 'Saco de dormir soft (meia-estação)',
    desc: 'Protege o bebê contra friagens moderadas durante o sono.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-115422.png',
    heatingLevel: 'Médio'
  },
  'saco-dormir-plush': {
    name: 'Saco de dormir plush com mangas (inverno)',
    desc: 'Proteção térmica total e segura para o bebê nos dias mais frios do ano.',
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

// Main Application Component
export default function App() {
  // Navigation Screens: 'welcome' | 'wizard' | 'loading' | 'result'
  const [screen, setScreen] = useState<'welcome' | 'wizard' | 'loading' | 'result'>('welcome');
  
  // Current step inside the wizard: 1 | 2 | 3 | 4
  const [step, setStep] = useState<number>(1);

  // Default values for Questionnaire
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    age: '0-3-meses',
    state: 'acordado',
    period: 'dia',
    sensitivity: 'normal',
    condition: 'fechado',
    feeling: 'agradavel',
    temperature: null,
    wantsExtras: true,
  });

  // Compiled result state
  const [result, setResult] = useState<RecommendationResult | null>(null);

  // Quick Check states
  const [quickTemp, setQuickTemp] = useState<number>(22);

  // PWA & Navigation Menu States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPwaInstructionOpen, setIsPwaInstructionOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(true); // Default to true so iOS instruction button always shows in menu

  // Hook to handle PWA installation eligibility
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already standalone, we hide button
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else {
      setIsPwaInstructionOpen(true);
    }
  };
  const [quickPeriod, setQuickPeriod] = useState<PeriodOfDay>('dia');

  // Loading text cycling effect state
  const [loadingText, setLoadingText] = useState('Analisando as variáveis de clima...');

  // Effect to cycle warm motherly comments during loading
  useEffect(() => {
    if (screen !== 'loading') return;
    
    const messages = [
      'Analisando as variáveis de clima... 🌡️',
      'Dobrando as roupinhas com carinho... 🧺',
      'Sentindo se há brisa ou vento lá fora... 🍃',
      'Calculando o equilíbrio ideal de camadas... ⚖️',
      'Preparando dicas práticas para o seu dia... ✨',
      'Prontinho! Gerando conforto para o seu bebê... ❤️'
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < messages.length - 1) {
        messageIndex++;
        setLoadingText(messages[messageIndex]);
      }
    }, 800);

    // Transition to result screen after 2.6 seconds
    const timeout = setTimeout(() => {
      const calculation = calculateClothing(answers);
      setResult(calculation);
      setScreen('result');
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [screen, answers]);

  // Handle immediate form calculation triggers
  const startWizard = () => {
    setStep(1);
    setScreen('wizard');
  };

  const handleQuickCheck = (temp: number, pOfDay: PeriodOfDay) => {
    let feel: AmbientFeeling = 'agradavel';
    if (temp < 12) feel = 'muito-frio';
    else if (temp < 16) feel = 'frio';
    else if (temp < 19) feel = 'fresquinho';
    else if (temp < 25) feel = 'agradavel';
    else if (temp < 31) feel = 'quente';
    else feel = 'muito-quente';

    setAnswers({
      age: '0-3-meses',
      state: 'acordado',
      period: pOfDay,
      sensitivity: 'normal',
      condition: 'fechado',
      feeling: feel,
      temperature: temp,
      wantsExtras: true,
    });
    setScreen('loading');
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setScreen('loading');
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setScreen('welcome');
    }
  };

  // Quick adjusters inside final result screen (quality of life feature for moms)
  const adjustResultTemperature = (delta: number) => {
    setAnswers(prev => {
      let currentTemp = prev.temperature;
      if (currentTemp === null) {
        // default based on feeling
        if (prev.feeling === 'muito-quente') currentTemp = 33;
        else if (prev.feeling === 'quente') currentTemp = 28;
        else if (prev.feeling === 'agradavel') currentTemp = 23;
        else if (prev.feeling === 'fresquinho') currentTemp = 19;
        else if (prev.feeling === 'frio') currentTemp = 14;
        else currentTemp = 9;
      }
      const newTemp = Math.max(5, Math.min(41, currentTemp + delta));
      const updatedAnswers = { ...prev, temperature: newTemp };
      // Recalculate result instantly
      const calculation = calculateClothing(updatedAnswers);
      setResult(calculation);
      return updatedAnswers;
    });
  };

  const toggleResultWind = () => {
    setAnswers(prev => {
      const isWind = prev.condition === 'vento-frio';
      const updatedAnswers = { ...prev, condition: (isWind ? 'fechado' : 'vento-frio') as EnvironmentCondition };
      const calculation = calculateClothing(updatedAnswers);
      setResult(calculation);
      return updatedAnswers;
    });
  };

  // Convert key formats to readable labels
  const getAgeFriendlyName = (ageKey: BabyAge) => {
    switch (ageKey) {
      case 'recem-nascido': return 'Recém-Nascido (até 28 dias)';
      case '0-3-meses': return '0 a 3 meses';
      case '3-6-meses': return '3 a 6 meses';
      case '6-12-meses': return '6 a 12 meses';
      case 'mais-de-1-ano': return 'Mais de 1 ano';
    }
  };

  const getStateFriendlyName = (stateKey: BabyState) => {
    switch (stateKey) {
      case 'dormindo': return 'Dormindo bochechando';
      case 'acordado': return 'Acordado e brincalhão';
      case 'passeando': return 'Passeando lá fora';
      case 'colo-sling': return 'No colo ou sling quentinho';
      case 'carrinho': return 'Dentro do carrinho protegido';
    }
  };

  const getConditionFriendlyName = (condKey: EnvironmentCondition) => {
    switch (condKey) {
      case 'fechado': return 'Fechado e aconchegante';
      case 'ventilado': return 'Ventilado';
      case 'ventilador': return 'Com ventilador';
      case 'ar-condicionado': return 'Com ar-condicionado';
      case 'externo': return 'Área externa';
      case 'vento-frio': return 'Com vento frio';
    }
  };

  const getFeelingFriendlyName = (feelKey: AmbientFeeling) => {
    switch (feelKey) {
      case 'muito-quente': return '🥵 Muito quente';
      case 'quente': return '☀️ Quente';
      case 'agradavel': return '😊 Agradável';
      case 'fresquinho': return '🌥️ Fresquinho';
      case 'frio': return '🥶 Frio';
      case 'muito-frio': return '❄️ Muito frio';
    }
  };

  // Dynamic Thermometer colors based on Celsius degree
  const getTempColorStyle = (temp: number | null, feeling: AmbientFeeling) => {
    let t = temp;
    if (t === null) {
      if (feeling === 'muito-quente') t = 33;
      else if (feeling === 'quente') t = 28;
      else if (feeling === 'agradavel') t = 23;
      else if (feeling === 'fresquinho') t = 19;
      else if (feeling === 'frio') t = 14;
      else t = 9;
    }
    if (t < 16) return { bg: 'bg-blue-50 text-blue-700 border-blue-200', fill: 'bg-blue-500', pill: 'bg-blue-600 text-white' };
    if (t >= 16 && t < 20) return { bg: 'bg-teal-50 text-teal-700 border-teal-200', fill: 'bg-teal-400', pill: 'bg-[#51a7b4] text-white' };
    if (t >= 20 && t < 24) return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', fill: 'bg-emerald-500', pill: 'bg-[#299c6f] text-white' };
    if (t >= 24 && t < 28) return { bg: 'bg-amber-50 text-amber-800 border-amber-200', fill: 'bg-amber-500', pill: 'bg-[#d69324] text-white' };
    if (t >= 28 && t < 32) return { bg: 'bg-orange-50 text-orange-850 border-orange-200', fill: 'bg-orange-500', pill: 'bg-[#df6a14] text-white' };
    return { bg: 'bg-rose-50 text-rose-800 border-rose-200', fill: 'bg-rose-500', pill: 'bg-rose-600 text-white' };
  };

  return (
    <div className="min-h-screen bg-gradient-premium selection:bg-pink-100 selection:text-pink-900 text-slate-700 flex flex-col items-center justify-between pb-8 pt-4 px-4 sm:px-6 relative overflow-x-hidden">
      
      {/* Playful & Cozy Header with pastel frames and PWA install shortcuts */}
      <header className="w-full max-w-xl flex items-center justify-between py-1 mb-4 z-20">
        <div className="flex items-center gap-2">
          {/* Menu Trigger Button with baby-pink frame */}
          <motion.button 
            id="btn-open-menu"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsMenuOpen(true)}
            className="p-2.5 bg-pink-50 border-2 border-pink-100 hover:bg-pink-100 text-pink-600 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center relative"
          >
            <Menu className="w-4 h-4 stroke-[2.5]" />
          </motion.button>
        </div>

        {/* Center application branding with clean pink frame */}
        <motion.div 
          onClick={() => { setScreen('welcome'); setStep(1); }}
          className="cursor-pointer flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full shadow-xs group hover:bg-slate-50 hover:border-slate-300 transition-all"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="w-5.5 h-5.5 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 shadow-xxs">
            <img 
              src={menuClothesLogo} 
              alt="Logo ClimaBaby" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-display font-semibold text-xs sm:text-sm text-pink-600 select-none tracking-tight">
            ClimaBaby 👶
          </span>
        </motion.div>

        {/* Right download PWA icon shortcut with clean neutral frame */}
        <div className="flex items-center">
          <motion.button 
            id="header-btn-install"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleInstallApp}
            className="p-2.5 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-750 rounded-full shadow-sm transition-all cursor-pointer flex items-center justify-center"
            title="Instalar Aplicativo"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
          </motion.button>
        </div>
      </header>

      {/* Primary Card Viewport styled with generous roundedness, sleek charcoal border, clean shadows */}
      <main className="w-full max-w-xl bg-white rounded-[2rem] border-2 border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 z-10 overflow-hidden min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* WELCOME SCREEN */}
          {screen === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-between p-6 sm:p-8 text-center"
              id="screen-welcome"
            >
              <div className="pt-4 flex-1 flex flex-col justify-center items-center">
                {/* Playful & Soft Premium App Icon Container */}
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-pink-300 to-rose-300 rounded-[3rem] blur-md opacity-40 animate-pulse" />
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto bg-white rounded-[2.8rem] flex items-center justify-center overflow-hidden border-2 border-pink-200/60 shadow-md z-1">
                    <motion.img
                      animate={{ y: [0, -3, 0], scale: [1, 1.02, 1] }}
                      transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                      src={menuClothesLogo}
                      alt="Logo ClimaBaby"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-850 tracking-tight leading-tight mb-1">
                  ClimaBaby
                </h1>
                <h2 className="font-display text-lg sm:text-xl font-medium text-slate-600 tracking-tight leading-snug mb-3">
                  Vamos vestir seu bebê com carinho ♥
                </h2>

                <p className="text-slate-600 font-medium text-xs sm:text-sm max-w-sm leading-relaxed mb-6">
                  Esqueça a insegurança de vestir a mais ou a menos. Responda a algumas perguntas simples e receba recomendações seguras baseadas no método de camadas.
                </p>

                {/* Elegant, clean baby badge categories with unified 4-color style */}
                <div className="flex flex-wrap justify-center gap-2 mb-6 pointer-events-none">
                  <span className="text-xs font-semibold px-3 py-1.5 bg-slate-50 text-slate-750 rounded-full border border-slate-200/80 flex items-center gap-1 shadow-2xs">👶 Sem excesso</span>
                  <span className="text-xs font-semibold px-3 py-1.5 bg-slate-50 text-slate-750 rounded-full border border-slate-200/80 flex items-center gap-1 shadow-2xs">🌙 Sono seguro</span>
                  <span className="text-xs font-semibold px-3 py-1.5 bg-slate-50 text-slate-750 rounded-full border border-slate-200/80 flex items-center gap-1 shadow-2xs">🌡️ Apoio térmico</span>
                </div>
              </div>

              <div className="w-full mt-4 space-y-6">
                
                {/* Playful & Solid Primary Button in brand Pink */}
                <motion.button
                  id="btn-start"
                  onClick={startWizard}
                  whileHover={{ scale: 1.01, y: -0.5 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-4.5 bg-pink-500 hover:bg-pink-600 text-white font-display font-semibold rounded-2xl shadow-sm transition-all outline-none cursor-pointer flex items-center justify-center gap-2 text-md active:translate-y-[1px]"
                >
                  <span>Começar calculadora de roupas</span>
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </motion.button>

                {/* QUICK CHECK COMPONENT: ULTRA CLEAN SYSTEM */}
                <div className="pt-6 border-t border-slate-200 text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-display font-semibold text-sm text-pink-600 tracking-wide uppercase flex items-center gap-1">
                      🩺 Consulta Rápida Express! ⏱️
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                    Com pressa? Informe apenas a temperatura da sala e o período do dia para ver a sugestão de roupa.
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-3xs">
                    
                    {/* Temperature Controls */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-750 flex items-center gap-1.5">
                        <Thermometer className="w-4 h-4 text-pink-500 shrink-0" /> Qual a temperatura?
                      </label>
                      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1.5 max-w-[170px] shadow-xs">
                        <motion.button
                          type="button"
                          id="btn-quick-dec"
                          onClick={() => setQuickTemp(prev => Math.max(5, prev - 1))}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-pink-50 hover:text-pink-600 border border-slate-200 flex items-center justify-center text-slate-700 font-bold transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[3]" />
                        </motion.button>
                        <span className="font-sans font-bold text-md text-slate-850 min-w-[32px] text-center font-mono">
                          {quickTemp}°C
                        </span>
                        <motion.button
                          type="button"
                          id="btn-quick-inc"
                          onClick={() => setQuickTemp(prev => Math.min(41, prev + 1))}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-pink-50 hover:text-pink-600 border border-slate-200 flex items-center justify-center text-slate-700 font-bold transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Period Controls */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-750 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-pink-500 shrink-0" /> Período do Dia:
                      </label>
                      <div className="grid grid-cols-2 gap-1 bg-white border border-slate-200 rounded-2xl p-1 shadow-xs">
                        <button
                          type="button"
                          id="btn-quick-day"
                          onClick={() => setQuickPeriod('dia')}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            quickPeriod === 'dia'
                              ? 'bg-pink-500 border border-pink-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-850 hover:bg-slate-50'
                          }`}
                        >
                          Dia ☀️
                        </button>
                        <button
                          type="button"
                          id="btn-quick-night"
                          onClick={() => setQuickPeriod('noite')}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            quickPeriod === 'noite'
                              ? 'bg-pink-500 border border-pink-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-850 hover:bg-slate-50'
                          }`}
                        >
                          Noite 🌙
                        </button>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    id="btn-quick-submit"
                    onClick={() => handleQuickCheck(quickTemp, quickPeriod)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full mt-3.5 py-4 bg-pink-500 hover:bg-pink-600 text-white font-display font-semibold text-sm rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    Ver recomendação direta <ChevronRight className="w-5 h-5 stroke-[2]" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* WIZARD CONTAINER */}
          {screen === 'wizard' && (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="flex-1 flex flex-col justify-between p-6 sm:p-8"
              id="screen-wizard"
            >
              {/* Playful & Soft Steppers Header */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs text-pink-600 font-bold mb-2">
                  <span className="font-display font-bold">Passo {step} de 3 🌸</span>
                  <span className="font-display font-semibold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {step === 1 && 'Sobre o bebê 🍼'}
                    {step === 2 && 'Momento & Lugar 🏡'}
                    {step === 3 && 'O Clima atual 🌡️'}
                  </span>
                </div>
                {/* Playful and colorful animated progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-205/50 shadow-xxs">
                  <motion.div 
                    className="h-full bg-pink-500 rounded-full" 
                    initial={{ width: '33.3%' }}
                    animate={{ width: `${step * 33.3}%` }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                </div>
              </div>

              {/* Dynamic Steps Render with child themes */}
              <div className="flex-1 flex flex-col justify-center my-2">
                <AnimatePresence mode="wait">
                  
                  {/* STEP 1: ABOUT THE BABY */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="font-display text-base sm:text-lg font-semibold text-slate-850 block mb-1">
                          Qual a idade do bebê? 🍼
                        </label>
                        <p className="text-xs text-gray-500 font-medium mb-3 leading-relaxed">
                          Bebês muito novos regulam menos a temperatura corporal e requerem mais aconchego.
                        </p>
                        <div className="space-y-2">
                          {[
                            { key: 'recem-nascido', label: 'Recém-nascido', desc: 'Até os primeiros 28 dias' },
                            { key: '0-3-meses', label: '0 a 3 meses', desc: 'Fase de acomodação' },
                            { key: '3-6-meses', label: '3 a 6 meses', desc: 'Já ganha ritmo térmico' },
                            { key: '6-12-meses', label: '6 a 12 meses', desc: 'Fisicamente mais ativo' },
                            { key: 'mais-de-1-ano', label: 'Mais de 1 ano', desc: 'Regula bem e engatinha/anda' }
                          ].map((item) => (
                            <button
                              key={item.key}
                              id={`age-opt-${item.key}`}
                              onClick={() => setAnswers(prev => ({ ...prev, age: item.key as BabyAge }))}
                              className={`w-full p-3 rounded-2xl text-left border-2 transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm ${
                                answers.age === item.key
                                  ? 'bg-white border-pink-500 text-pink-600 scale-[1.01]'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-850'
                              }`}
                            >
                              <div>
                                <span className={`font-display font-bold text-sm sm:text-base block ${answers.age === item.key ? 'text-pink-600' : 'text-slate-850'}`}>{item.label}</span>
                                <span className={`text-[11px] font-medium mt-0.5 block ${answers.age === item.key ? 'text-pink-550' : 'text-gray-500'}`}>{item.desc}</span>
                              </div>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                answers.age === item.key 
                                  ? 'bg-pink-500 border-transparent text-white' 
                                  : 'border-slate-200 bg-slate-50'
                              }`}>
                                {answers.age === item.key && <Check className="w-4 h-4 stroke-[4] text-white" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="font-display text-base sm:text-lg font-semibold text-slate-850 block mb-1">
                          O bebê costuma sentir: 🌡️
                        </label>
                        <p className="text-xs text-gray-500 font-medium mb-3 leading-relaxed">
                          Cada criança possui seu próprio biotipo natural de metabolizar calor.
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: 'calor', label: 'Mais calor', emoji: '🥵' },
                            { key: 'normal', label: 'Normal / Neutro', emoji: '😊' },
                            { key: 'frio', label: 'Mais frio', emoji: '🥶' }
                          ].map((item) => (
                            <button
                              key={item.key}
                              id={`sens-opt-${item.key}`}
                              onClick={() => setAnswers(prev => ({ ...prev, sensitivity: item.key as ThermalSensitivity }))}
                              className={`p-3 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 shadow-sm hover:scale-102 ${
                                answers.sensitivity === item.key
                                  ? 'bg-white border-pink-500 text-pink-600 scale-102'
                                  : 'bg-white hover:bg-slate-50 border-slate-201 text-slate-700'
                              }`}
                            >
                              <span className="text-2xl">{item.emoji}</span>
                              <span className="text-xs leading-none font-semibold">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: CONTEXT & PLACE */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="font-display text-base sm:text-lg font-semibold text-slate-850 block mb-1">
                          Vamos vestir o bebê para: 🛌
                        </label>
                        <p className="text-xs text-gray-500 font-medium mb-3">
                          Selecione o momento ou atividade atual do bebê.
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { key: 'dormindo', label: 'Dormir', desc: 'Confortável e seguro 💤' },
                            { key: 'acordado', label: 'Acordado em casa', desc: 'Tempo livre para brincar e se movimentar 🧸' },
                            { key: 'passeando', label: 'Passear ao ar livre', desc: 'Caminhando ou passeando na rua 🌳' },
                            { key: 'colo-sling', label: 'No colo / Sling', desc: 'Colinho aconchegante de mãe ou pai 🤗' },
                            { key: 'carrinho', label: 'Dentro do carrinho', desc: 'Protegido da brisa direta 🛒' }
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              id={`state-opt-${item.key}`}
                              onClick={() => setAnswers(prev => ({ ...prev, state: item.key as BabyState }))}
                              className={`w-full p-3 rounded-2xl text-left border-2 transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm ${
                                answers.state === item.key
                                  ? 'bg-white border-pink-500 text-pink-650 scale-[1.01]'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div>
                                <span className={`font-display font-bold text-xs sm:text-sm block ${answers.state === item.key ? 'text-pink-650' : 'text-slate-800'}`}>{item.label}</span>
                                <span className={`text-[11px] font-semibold mt-0.5 block ${answers.state === item.key ? 'text-pink-500' : 'text-gray-500'}`}>{item.desc}</span>
                              </div>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                answers.state === item.key 
                                  ? 'bg-pink-500 border-transparent text-white' 
                                  : 'border-slate-200 bg-slate-50'
                              }`}>
                                {answers.state === item.key && <Check className="w-4 h-4 stroke-[4] text-white" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="font-display text-base sm:text-lg font-semibold text-slate-850 block mb-1">
                          O ambiente está: 🏡
                        </label>
                        <p className="text-xs text-gray-500 font-medium mb-2.5">
                          A sensação real do lugar onde o bebê passará esse momento.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'fechado', label: 'Fechado', desc: 'Aconchegante e quente' },
                            { key: 'ventilado', label: 'Ventilado', desc: 'Ar correndo levemente' },
                            { key: 'ventilador', label: 'Com ventilador', desc: 'Fluxo contínuo ativo' },
                            { key: 'ar-condicionado', label: 'Ar Condicionado', desc: 'Climatizado mais frio' },
                            { key: 'externo', label: 'Área externa', desc: 'Ao ar livre' },
                            { key: 'vento-frio', label: 'Vento frio', desc: 'Brisas e correntes frias' }
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              id={`cond-opt-${item.key}`}
                              onClick={() => setAnswers(prev => ({ ...prev, condition: item.key as EnvironmentCondition }))}
                              className={`p-2.5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer shadow-sm hover:scale-102 ${
                                answers.condition === item.key
                                  ? 'bg-white border-pink-500 text-pink-650 scale-[1.01]'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-850'
                              }`}
                            >
                              <span className={`font-display font-semibold text-xs block ${answers.condition === item.key ? 'text-pink-600' : 'text-slate-800'}`}>{item.label}</span>
                              <span className={`text-[10px] font-medium mt-0.5 block ${answers.condition === item.key ? 'text-pink-500' : 'text-gray-500'}`}>{item.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1">
                        <label className="font-display text-sm font-semibold text-slate-850 block mb-2">
                          Período do Dia: ☀️🌙
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'dia', label: 'Dia ☀️' },
                            { key: 'noite', label: 'Noite 🌙' }
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              id={`period-opt-${item.key}`}
                              onClick={() => setAnswers(prev => ({ ...prev, period: item.key as PeriodOfDay }))}
                              className={`p-3 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer text-xs font-semibold shadow-sm ${
                                answers.period === item.key
                                  ? 'bg-pink-500 border-pink-500 text-white'
                                  : 'bg-white border-slate-205 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      <div className="text-center">
                        <label className="font-display text-base sm:text-lg font-semibold text-slate-850 block mb-1">
                          Como o ambiente está agora? 🌡️
                        </label>
                        <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                          Substitua a lida puramente numérica pela percepção do clima atual.
                        </p>

                        {/* Feeling options list/grid with beautiful responsive climatic coloring */}
                        <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
                          {[
                            { 
                              key: 'muito-quente', 
                              label: 'Muito quente', 
                              emoji: '🥵', 
                              desc: 'Acima de 30°C',
                              activeBg: 'bg-white border-pink-500 text-pink-650 shadow-xs scale-102',
                              normalBg: 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                            },
                            { 
                              key: 'quente', 
                              label: 'Quente', 
                              emoji: '☀️', 
                              desc: '27°C a 30°C',
                              activeBg: 'bg-white border-pink-500 text-pink-650 shadow-xs scale-102',
                              normalBg: 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                            },
                            { 
                              key: 'agradavel', 
                              label: 'Agradável', 
                              emoji: '😊', 
                              desc: '22°C a 26°C',
                              activeBg: 'bg-white border-pink-500 text-pink-650 shadow-xs scale-102',
                              normalBg: 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                            },
                            { 
                              key: 'fresquinho', 
                              label: 'Fresquinho', 
                              emoji: '🌥️', 
                              desc: '18°C a 21°C',
                              activeBg: 'bg-white border-pink-500 text-pink-650 shadow-xs scale-102',
                              normalBg: 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                            },
                            { 
                              key: 'frio', 
                              label: 'Frio', 
                              emoji: '🥶', 
                              desc: '12°C a 17°C',
                              activeBg: 'bg-white border-pink-500 text-pink-650 shadow-xs scale-102',
                              normalBg: 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                            },
                            { 
                              key: 'muito-frio', 
                              label: 'Muito frio', 
                              emoji: '❄️', 
                              desc: 'Abaixo de 12°C',
                              activeBg: 'bg-white border-pink-500 text-pink-650 shadow-xs scale-102',
                              normalBg: 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                            }
                          ].map((item) => {
                            const isSelected = answers.feeling === item.key;
                            return (
                              <button
                                key={item.key}
                                type="button"
                                id={`feel-opt-${item.key}`}
                                onClick={() => setAnswers(prev => {
                                  const updated = { ...prev, feeling: item.key as AmbientFeeling };
                                  if (prev.temperature !== null) {
                                    let defaultT = 23;
                                    if (item.key === 'muito-quente') defaultT = 33;
                                    else if (item.key === 'quente') defaultT = 28;
                                    else if (item.key === 'agradavel') defaultT = 23;
                                    else if (item.key === 'fresquinho') defaultT = 19;
                                    else if (item.key === 'frio') defaultT = 14;
                                    else defaultT = 9;
                                    updated.temperature = defaultT;
                                  }
                                  return updated;
                                })}
                                className={`p-3 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between h-[80px] hover:scale-102 ${
                                  isSelected ? item.activeBg : item.normalBg
                                }`}
                              >
                                <div className="flex items-center justify-between w-full h-full">
                                  <div>
                                    <span className={`font-display font-semibold text-xs sm:text-sm block leading-tight ${isSelected ? 'text-pink-600' : 'text-slate-800'}`}>{item.label}</span>
                                    <span className={`text-[10px] font-medium block mt-1 leading-snug ${isSelected ? 'text-pink-500' : 'text-slate-500'}`}>{item.desc}</span>
                                  </div>
                                  <span className="text-3xl ml-1 leading-none">{item.emoji}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
 
                      {/* Optional: Input de temperatura aproximada em graus com design lúdico e amigável */}
                      <div className="pt-4 border-t border-pink-100">
                        <button
                          type="button"
                          id="btn-toggle-temp"
                          onClick={() => {
                            if (answers.temperature === null) {
                              let defaultT = 23;
                              if (answers.feeling === 'muito-quente') defaultT = 33;
                              else if (answers.feeling === 'quente') defaultT = 28;
                              else if (answers.feeling === 'agradavel') defaultT = 23;
                              else if (answers.feeling === 'fresquinho') defaultT = 19;
                              else if (answers.feeling === 'frio') defaultT = 14;
                              else defaultT = 9;
                              setAnswers(prev => ({ ...prev, temperature: defaultT }));
                            } else {
                              setAnswers(prev => ({ ...prev, temperature: null }));
                            }
                          }}
                          className={`flex items-center gap-2.5 text-xs font-semibold p-3.5 rounded-2xl transition-all shadow-xs cursor-pointer w-full justify-center border-2 ${
                            answers.temperature !== null 
                              ? 'bg-pink-50 text-pink-700 border-pink-200' 
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100/50'
                          }`}
                        >
                          <Thermometer className={`w-4 h-4 ${answers.temperature !== null ? 'text-pink-650' : 'text-slate-500'}`} />
                          {answers.temperature !== null 
                            ? 'Omitir temperatura exata em graus (°C)' 
                            : 'Opcional: Informar temperatura exata em graus (°C)'}
                        </button>
 
                        {answers.temperature !== null && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4 text-center overflow-hidden"
                          >
                            <p className="text-[11px] text-slate-500 font-medium mb-1">
                              Ajuste os graus de forma fina utilizando os botões de - e + ou arraste o controle deslizante abaixo:
                            </p>
 
                            {/* Interactive Thermometer Status Widget but extremely clean rounded layout */}
                            <div className="mx-auto rounded-[1.75rem] p-4 border-2 border-slate-200 text-center transition-all max-w-sm bg-white shadow-xs text-slate-950">
                              <span className="text-3xl font-display font-bold tracking-tight text-pink-600">
                                {answers.temperature}<span className="text-xl font-bold">°C</span>
                              </span>
                              
                              <div className="flex items-center justify-center gap-3 mt-3">
                                <motion.button
                                  id="btn-temp-dec-wiz"
                                  type="button"
                                  onClick={() => setAnswers(prev => ({ ...prev, temperature: Math.max(5, (prev.temperature || 22) - 1) }))}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-10 h-10 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-slate-700 shadow-xs cursor-pointer"
                                  title="Diminuir 1 grau"
                                >
                                  <Minus className="w-4 h-4 stroke-[3]" />
                                </motion.button>
 
                                <div className="flex-1 max-w-[150px]">
                                  <input
                                    id="input-temp-slider-wiz"
                                    type="range"
                                    min="5"
                                    max="40"
                                    value={answers.temperature}
                                    onChange={(e) => setAnswers(prev => ({ ...prev, temperature: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-pink-500 focus:outline-none"
                                  />
                                </div>
 
                                <motion.button
                                  id="btn-temp-inc-wiz"
                                  type="button"
                                  onClick={() => setAnswers(prev => ({ ...prev, temperature: Math.min(40, (prev.temperature || 22) + 1) }))}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-10 h-10 rounded-xl bg-pink-100 border-2 border-pink-200 flex items-center justify-center text-pink-700 shadow-xs cursor-pointer"
                                  title="Aumentar 1 grau"
                                >
                                  <Plus className="w-4 h-4 stroke-[3]" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
 
                </AnimatePresence>
              </div>
 
              {/* Step Navigation Button Row with bouncy elements */}
              <div className="flex gap-3 pt-6 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  id="btn-back"
                  onClick={handlePrevStep}
                  className="px-5 py-4 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 text-sm font-display font-semibold rounded-2xl cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2]" /> Voltar
                </button>
 
                <button
                  type="button"
                  id="btn-next"
                  onClick={handleNextStep}
                  className="flex-1 py-4.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-display font-semibold rounded-2xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md active:translate-y-[1px]"
                >
                  {step === 3 ? 'Calcular recomendação ⚡' : 'Continuar'} <ChevronRight className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* LOADING SCREEN WITH DELIGHTFUL PULSING ANIMATIONS */}
          {screen === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-gradient-to-br from-pink-50/50 to-pink-100/50"
              id="screen-loading"
            >
              <div className="relative mb-6">
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-300 via-rose-300 to-slate-200 rounded-full blur opacity-80 animate-pulse" />
                <div className="relative w-20 h-20 bg-white border-2 border-pink-100 rounded-full flex items-center justify-center shadow-lg">
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                    className="text-3xl select-none"
                  >
                    👶
                  </motion.div>
                  <div className="absolute -top-1 -right-1 text-xl select-none">✨</div>
                </div>
              </div>
 
              <AnimatePresence mode="wait">
                <motion.h3
                  key={loadingText}
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -7 }}
                  transition={{ duration: 0.25 }}
                  className="font-display text-md font-bold text-pink-700 max-w-xs mt-2"
                >
                  {loadingText}
                </motion.h3>
              </AnimatePresence>

              <p className="text-xs text-slate-500 font-semibold mt-3.5 max-w-xs leading-relaxed">
                Analisando as camadas térmicas e o conforto seguro para o maior bem-estar do seu bebê! 🌸🧸
              </p>
            </motion.div>
          )}

          {/* FINAL RESULTS VIEW */}
          {screen === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-between p-5 sm:p-7 space-y-5"
              id="screen-result"
            >
              {/* Header result badge info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 border-b-2 border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-full ${getTempColorStyle(answers.temperature, answers.feeling).pill} border-2 border-white shadow-xs`}>
                    <Thermometer className="w-5 h-5 text-slate-800" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg sm:text-xl text-pink-600 leading-tight border-none outline-none">
                      {result.temperatureCategory}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Sensibilidade: {getAgeFriendlyName(answers.age)}
                    </p>
                  </div>
                </div>
 
                {/* Instant thermal adjuster panel (extremely practical for parents on the fly) with clean design */}
                <div className="flex items-center gap-1.5 self-start bg-slate-50 border-2 border-slate-200 rounded-2xl p-1 shadow-xs">
                  <button
                    id="btn-res-dec"
                    type="button"
                    onClick={() => adjustResultTemperature(-1)}
                    className="p-2 hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 rounded-xl transition-all cursor-pointer bg-white/60 border border-slate-200/50 shadow-xxs"
                    title="Testar com 1°C a menos"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <span className="text-xs font-display font-semibold text-slate-800 px-2.5 bg-white border border-slate-200 rounded-xl shadow-xs py-1.5 min-w-[55px] text-center">
                    {answers.temperature !== null ? `${answers.temperature}°C` : getFeelingFriendlyName(answers.feeling)}
                  </span>
                  <button
                    id="btn-res-inc"
                    type="button"
                    onClick={() => adjustResultTemperature(1)}
                    className="p-2 hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 rounded-xl transition-all cursor-pointer bg-white/60 border border-slate-200/50 shadow-xxs"
                    title="Testar com 1°C a mais"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  
                  {/* Wind toggle button right inside results */}
                  <button
                    id="btn-res-wind"
                    type="button"
                    onClick={toggleResultWind}
                    className={`p-2 rounded-xl transition-all cursor-pointer border ${answers.condition === 'vento-frio' ? 'bg-pink-500 text-white border-transparent shadow-xs' : 'text-slate-400 bg-white/60 border-slate-200/50 hover:text-slate-600'}`}
                    title={answers.condition === 'vento-frio' ? "Remover efeito de vento" : "Simular vento/sensação fria"}
                  >
                    <Wind className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
 
              {/* COGNITIVE VISUAL THERMOMETER */}
              <div className="bg-white rounded-3xl p-4.5 border-2 border-slate-200 flex flex-col items-center shadow-xs">
                <span className="text-[10px] font-display font-semibold text-pink-600 uppercase tracking-wider mb-3 flex items-center gap-1.5 leading-none">
                  <Thermometer className="w-3.5 h-3.5 text-pink-500" /> Termômetro de Conforto Térmico
                </span>
                {(() => {
                  const effectiveTemp = answers.temperature !== null ? answers.temperature : (() => {
                    if (answers.feeling === 'muito-quente') return 33;
                    if (answers.feeling === 'quente') return 28;
                    if (answers.feeling === 'agradavel') return 23;
                    if (answers.feeling === 'fresquinho') return 19;
                    if (answers.feeling === 'frio') return 14;
                    return 9;
                  })();
                  return (
                    <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm">
                       <div className={`py-2.5 px-3 rounded-2xl text-center flex flex-col items-center justify-center transition-all duration-300 w-full border-2 ${
                        effectiveTemp < 19 
                          ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-xs font-semibold' 
                          : 'bg-white border-slate-100 text-slate-300 font-medium opacity-50'
                      }`}>
                         <span className="text-xl">🥶</span>
                        <span className="text-[11px] mt-1 font-display font-medium">Frio</span>
                      </div>
                      <div className={`py-2.5 px-3 rounded-2xl text-center flex flex-col items-center justify-center transition-all duration-300 w-full border-2 ${
                        effectiveTemp >= 19 && effectiveTemp < 27
                          ? 'bg-pink-500 border-transparent text-white shadow-xs font-semibold' 
                          : 'bg-white border-slate-100 text-slate-300 font-medium opacity-50'
                      }`}>
                        <span className="text-xl">😊</span>
                        <span className="text-[11px] mt-1 font-display font-medium">Adequado</span>
                      </div>
                      <div className={`py-2.5 px-3 rounded-2xl text-center flex flex-col items-center justify-center transition-all duration-300 w-full border-2 ${
                        effectiveTemp >= 27
                          ? 'bg-slate-900 border-transparent text-white shadow-xs font-semibold' 
                          : 'bg-white border-slate-100 text-slate-300 font-medium opacity-50'
                      }`}>
                        <span className="text-xl">🥵</span>
                        <span className="text-[11px] mt-1 font-display font-medium">Calor</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
 
              {/* CORE METRIC CARD: LAYER COUNT */}
              <div className="bg-gradient-to-br from-pink-100/55 via-white to-rose-100/35 border-2 border-pink-300 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-5 shadow-sm relative overflow-hidden ring-4 ring-pink-500/10">
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-pink-100/30 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-rose-100/35 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex-1 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full bg-pink-500 text-pink-850 text-[10.5px] font-display font-bold uppercase tracking-wider shadow-xxs border border-pink-600/10">
                    <Layers className="w-3.5 h-3.5 stroke-[2.5]" /> RECOMENDAÇÃO DE CAMADAS
                  </div>
                  <h4 className="font-display font-extrabold text-2xl text-slate-800 mb-2 tracking-tight">
                    {result.layerCount} {result.layerCount === 1 ? 'Camada única' : result.layerCount === 2 ? 'Camadas leves' : 'Camadas aconchegantes'}
                  </h4>
                  <p className="text-sm text-slate-705 font-medium leading-relaxed font-sans">
                    {result.layersDescription}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-3 italic flex items-center gap-1">
                    ✨ Combine as peças abaixo de acordo com as instruções.
                  </p>
                </div>
 
                {/* Layer visual stack pills */}
                <div className="flex flex-col gap-2 w-full md:w-48 shrink-0 relative z-10">
                  <span className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest text-center md:text-left mb-1 block">Estrutura de Roupas</span>
                  {Array.from({ length: result.layerCount }).map((_, i) => {
                    let layerBg = 'bg-pink-100 border-pink-250 text-pink-700';
                    let layerName = 'Base (Corpo)';
                    let layerIcon = '👶';
                    if (i === 0) {
                      layerBg = 'bg-blue-100 border-blue-200 text-blue-700';
                      layerName = '1ª Camada: Bodysuit';
                      layerIcon = '👕';
                    } else if (i === 1) {
                      layerBg = 'bg-purple-100 border-purple-205 text-purple-705';
                      layerName = '2ª Camada: Macacão';
                      layerIcon = '👖';
                    } else if (i === 2) {
                      layerBg = 'bg-rose-100 border-rose-250 text-rose-700';
                      layerName = '3ª Camada: Manta/Casaco';
                      layerIcon = '🧥';
                    }
                    return (
                      <motion.div
                        key={i}
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: i * 0.15, type: 'spring', stiffness: 100 }}
                        className={`h-9.5 rounded-2xl flex items-center justify-between px-3 text-xs font-display font-semibold shadow-xxs border ${layerBg} transition-all duration-300 hover:scale-[1.02]`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm">{layerIcon}</span>
                          <span>{layerName}</span>
                        </span>
                        <span className="text-[8.5px] bg-white/60 px-1.5 py-0.5 rounded-md border border-white/80 font-bold uppercase tracking-wide">
                          {i === 0 && 'Base'}
                          {i === 1 && 'Aquecer'}
                          {i === 2 && 'Manter'}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white rounded-3xl p-5 border-2 border-pink-100 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-pink-150">
                  <div className="p-1.5 bg-pink-50 text-pink-700 border border-pink-100 rounded-xl shadow-xs">
                    <Shirt className="w-4.5 h-4.5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-sm sm:text-base text-pink-750">
                      Look Recomendado para esta Temperatura
                    </h4>
                    <p className="text-[11px] text-amber-900 font-medium opacity-85">
                      O conjunto perfeito combinado para vestir seu bebê com facilidade.
                    </p>
                  </div>
                </div>
 
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {result.visualItems.map((itemId) => {
                    const itemInfo = CLOTHING_DATABASE[itemId];
                    if (!itemInfo) return null;
                    
                    let badgeStyles = 'bg-[#F0FDF4] text-emerald-700 border-emerald-200';
                    if (itemInfo.heatingLevel === 'Médio') {
                      badgeStyles = 'bg-[#FEF3C7] text-amber-800 border-amber-250';
                    } else if (itemInfo.heatingLevel === 'Alto') {
                      badgeStyles = 'bg-[#FFF1F2] text-rose-700 border-rose-250';
                    } else if (itemInfo.heatingLevel === 'Muito Alto') {
                      badgeStyles = 'bg-[#F5F3FF] text-indigo-700 border-indigo-250';
                    }
 
                    return (
                      <motion.div
                        key={itemId}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gradient-to-b from-white to-pink-50/10 border-2 border-pink-150 rounded-2xl overflow-hidden flex flex-col group shadow-xs hover:border-pink-300 transition-all duration-300"
                      >
                        {/* Cloth picture wrapper */}
                        <div className="relative aspect-square w-full bg-[#FCFDFE] overflow-hidden flex items-center justify-center border-b-2 border-pink-100/50">
                          <img
                            src={itemInfo.url}
                            alt={itemInfo.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-104 select-none"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLDivElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="fallback-icon absolute inset-0 bg-pink-50/20 flex flex-col items-center justify-center p-3 text-center pointer-events-none" style={{ display: 'none' }}>
                            <Shirt className="w-8 h-8 text-pink-350 mb-1.5" />
                            <span className="text-[9px] text-pink-500 font-semibold uppercase">Sem foto</span>
                          </div>
                          
                          <div className="absolute top-2 right-2 bg-pink-500 text-[8px] font-display font-semibold text-white px-2 py-0.5 rounded-full select-none shadow-xs">
                            Look ✓
                          </div>
                        </div>
 
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <h5 className="font-display text-[11px] sm:text-xs md:text-sm font-semibold text-rose-700 leading-snug break-words group-hover:text-pink-650 transition-colors">
                              {itemInfo.name}
                            </h5>
                            <p className="text-[10px] sm:text-[10.5px] text-slate-500 font-medium leading-snug sm:leading-relaxed mt-1 break-words line-clamp-3 sm:line-clamp-none">
                              {itemInfo.desc}
                            </p>
                          </div>
                          
                          <div className="pt-2 border-t border-slate-100 flex flex-row items-center justify-between gap-1">
                            <span className="text-[8.5px] sm:text-[9px] text-slate-400 font-semibold uppercase tracking-wide">Aquecer</span>
                            <span className={`text-[9px] sm:text-[9.5px] font-display font-semibold px-1.5 sm:px-2 py-0.5 rounded-lg border-2 text-center whitespace-nowrap ${badgeStyles}`}>
                              {itemInfo.heatingLevel}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* THREE COLUMNS GRID: OUTFITS, FABRICS, ACCESSORIES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
                
                {/* OUTFIT RECOMMENDATION */}
                <div className="bg-white rounded-2xl p-4.5 border-2 border-slate-200 shadow-xs hover:border-pink-200 transition-all duration-300">
                  <span className="text-xs font-display font-bold text-pink-600 flex items-center gap-1.5 mb-2.5">
                    <Shirt className="w-4 h-4 text-pink-500 shrink-0" /> Peças Sugeridas:
                  </span>
                  <ul className="space-y-2">
                    {result.outfitSuggestions.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 leading-relaxed font-bold">
                        <span className="text-pink-400 shrink-0 select-none">🌸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
 
                {/* RECOMMENDED FABRICS */}
                <div className="bg-white rounded-2xl p-4.5 border-2 border-slate-200 shadow-xs hover:border-pink-200 transition-all duration-300">
                  <span className="text-xs font-display font-bold text-pink-600 flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-4 h-4 text-pink-500 shrink-0" /> Tecidos Recomendados:
                  </span>
                  <ul className="space-y-2">
                    {result.recommendedFabrics.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 leading-relaxed font-medium">
                        <span className="text-pink-500 shrink-0 select-none">✓</span>
                        <span className="text-slate-800">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-pink-600 font-semibold mt-2.5 leading-tight">
                    *Prefira fibras naturais como o algodão para deixar a pele respirar livremente.
                  </p>
                </div>
 
                {/* ACCESSORIES */}
                <div className="bg-white rounded-2xl p-4.5 border-2 border-slate-200 shadow-xs hover:border-pink-200 transition-all duration-300">
                  <span className="text-xs font-display font-semibold text-slate-800 flex items-center gap-1.5 mb-2.5">
                    <Footprints className="w-4 h-4 text-pink-550 shrink-0" /> Acessórios Indicados:
                  </span>
                  {result.accessories.length > 0 ? (
                    <ul className="space-y-2">
                       {result.accessories.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 leading-relaxed font-medium">
                          <span className="text-pink-400 shrink-0 select-none">✦</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-slate-400 italic font-semibold">
                      Nenhum acessório extravagante indicado. Pés livres! 👣
                    </div>
                  )}
                </div>
 
              </div>
 
              {/* COZY VOICE COUNSEL BUBBLE + EXTRA TIPS */}
              <div className="space-y-4">
                {/* COZY VOICE COUNSEL BUBBLE */}
                <div className="bg-pink-50/40 rounded-3xl p-5 border-2 border-pink-100 relative shadow-xs">
                  <div className="absolute -top-3 left-5 px-3 py-1 bg-pink-500 text-white text-[10px] font-display font-semibold uppercase tracking-wider rounded-full flex items-center gap-1 shadow-sm border border-pink-200">
                    <Heart className="w-2.5 h-2.5 fill-white" /> Conselho do Coração
                  </div>
                  <div className="space-y-2 mt-1.5">
                    {result.cozyParagraphs.map((para, i) => (
                      <p key={i} className="text-slate-750 font-sans text-xs md:text-sm font-medium leading-relaxed opacity-95">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
 
                {/* EXTRA ADVICES */}
                {result.extraTips && (
                  <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs">
                    <span className="text-xs font-display font-semibold text-slate-800 flex items-center gap-1.5 mb-3">
                      <Heart className="w-4 h-4 text-pink-500" /> Dicas Extras e Cuidados:
                    </span>
                    <ul className="space-y-2">
                      {result.extraTips.map((tip, idx) => (
                        <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2.5 font-medium">
                          <span className="text-pink-400 shrink-0 mt-0.5">🧸</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
 
              {/* SAFE SLEEP PERMANENT ADVISORY (CRITICAL USER REQUEST) */}
              <div className="bg-gradient-to-br from-purple-100 via-white to-purple-50/50 border-2 border-purple-300 rounded-3xl p-5 sm:p-5.5 shadow-sm relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-300/20 rounded-full blur-xl pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xxs shrink-0 mt-0.5 animate-pulse">
                    <Moon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-300 text-purple-900 text-[9.5px] font-display font-extrabold uppercase tracking-wide border border-purple-300/20 shadow-xxs">
                      🚨 Alerta de Sono Seguro
                    </div>
                    <h5 className="font-display font-bold text-sm text-slate-800 tracking-tight leading-snug">
                      Lembrete de Proteção: Nunca deixe o bebê dormir de touca nem cobertor sem supervisão
                    </h5>
                    <p className="text-xs text-slate-705 leading-relaxed font-sans font-medium">
                      Colocar toucas, gorros ou cobertores soltos enquanto o bebê dorme sem vigilância direta aumenta expressivamente os riscos de superaquecimento e asfixia mecânica acidental.
                    </p>
                    <div className="mt-2 text-[11px] leading-relaxed p-3 rounded-2xl bg-[#FFFDF9] border border-purple-200/60 shadow-xxs font-sans text-slate-700">
                      <span className="font-semibold text-purple-800 block mb-1">💡 Dica de Conforto & Segurança:</span>
                      Uma excelente opção é usar um <strong className="text-purple-950 font-bold">saco de dormir quentinho com mangas</strong> ao invés de cobertores. Ele mantém seu bebê totalmente protegido, livre de perigo e super aconchegante a noite toda!
                    </div>
                  </div>
                </div>
              </div>
 
              {/* SECURITY ALERTS BLOCK */}
              <div className="bg-pink-50/25 rounded-3xl p-5 border-2 border-pink-200">
                <span className="text-xs font-display font-semibold text-pink-850 flex items-center gap-1.5 mb-2.5 uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-pink-650" /> Alertas de Segurança:
                </span>
                <ul className="space-y-2">
                  {result.importantAlerts.map((alert, idx) => (
                    <li key={idx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2 font-medium">
                      <span className="text-pink-550 font-semibold shrink-0 mt-0.5">⚠️</span>
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
 
              {/* VERIFIED COMFORT CHECKBOX BOX */}
              <div className="text-center text-xs text-slate-700 font-semibold bg-white border-2 border-slate-200 py-3 px-5 rounded-2xl flex items-center justify-center gap-2 leading-relaxed shadow-xs font-sans">
                <CheckCircle className="w-5 h-5 text-pink-500 shrink-0" />
                <span>Sempre observe a nuca e o peito para avaliar de fato o conforto térmico de seu bebê.</span>
              </div>
 
              {/* BOTTOM CONTROL ACTIONS WITH PLAYFUL BABY LOOK */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  id="btn-recalculate"
                  onClick={() => {
                    setStep(1);
                    setScreen('wizard');
                  }}
                  className="flex-1 py-4 bg-pink-500 hover:bg-pink-600 text-white text-sm font-display font-semibold rounded-3xl cursor-pointer flex items-center justify-center gap-2 shadow-md active:translate-y-[1px]"
                >
                  <RefreshCw className="w-4 h-4 shrink-0 animate-spin-reverse" /> Alterar Dados
                </button>
                
                <button
                  type="button"
                  id="btn-reset"
                  onClick={() => {
                    setAnswers({
                      age: '0-3-meses',
                      state: 'acordado',
                      period: 'dia',
                      temperature: 22,
                      hasWind: false,
                      sensitivity: 'normal',
                      location: 'fechado',
                      condition: 'fechado',
                      wantsExtras: true,
                    });
                    setStep(1);
                    setScreen('welcome');
                  }}
                  className="px-6 py-4 bg-white hover:bg-pink-50/25 text-pink-650 border-2 border-pink-200 hover:border-pink-350 text-xs sm:text-sm font-display font-semibold rounded-3xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
                >
                  Reiniciar Tudo
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer Details */}
      <footer className="w-full max-w-xl text-center mt-5 text-[11px] text-[#A69799] font-light space-y-1 select-none z-10 pb-6">
        <p>Criado com amor para simplificar o cuidado com seu bebê. 🧸</p>
        <p>© 2026 ClimaBaby</p>
      </footer>

      {/* OVERLAY SYSTEM (DRAWER, ABOUT, INSTALL MODALS) */}
      <AnimatePresence>
        {isMenuOpen && (
          <React.Fragment key="drawer-holder">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-gray-955 z-40 cursor-pointer"
            />

            {/* Pastel Drawer Panel Custom Slide */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[340px] bg-white z-50 shadow-2xl flex flex-col justify-between rounded-r-2xl border-r border-gray-255"
            >
              {/* Drawer Content */}
              <div className="p-6 flex-1 flex flex-col overflow-y-auto">
                {/* Header of Drawer */}
                <div className="flex justify-between items-center pb-5 border-b border-gray-100 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-gray-200 shrink-0">
                      <img 
                        src={menuClothesLogo} 
                        alt="Logo ClimaBaby" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-sans font-semibold text-sm text-gray-900">ClimaBaby</h4>
                      <span className="text-[10px] text-gray-405 font-normal block leading-tight">ClimaBaby PWA</span>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 hover:bg-gray-100 text-gray-850 rounded-full transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Sidebar Navigation Items */}
                <div className="space-y-2 flex-1">
                  {/* Item Home */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setScreen('welcome');
                      setStep(1);
                    }}
                    className="w-full flex items-center gap-3.5 p-2 rounded-xl text-left font-sans font-medium text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-all group cursor-pointer"
                  >
                    <div className="p-1.5 bg-gray-50 border border-gray-200 rounded-xl group-hover:bg-gray-950 group-hover:text-white transition-all text-gray-600">
                      <Home className="w-4 h-4" />
                    </div>
                    <span>Início</span>
                  </button>

                  {/* Install PWA Option */}
                  {isInstallable && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleInstallApp();
                      }}
                      className="w-full flex items-center gap-3.5 p-2 rounded-xl text-left font-sans font-medium text-sm text-gray-705 hover:bg-gray-50 hover:text-black transition-all group cursor-pointer"
                    >
                      <div className="p-1.5 bg-gray-50 border border-gray-200 rounded-xl group-hover:bg-gray-950 group-hover:text-white transition-all text-gray-600">
                        <Download className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-bold">Adicionar à Tela Inicial</span>
                        <span className="text-[10px] font-normal text-gray-500 block leading-tight">Instalação aplicativo rápida</span>
                      </div>
                    </button>
                  )}

                  {/* WhatsApp Support */}
                  <a
                    href="https://wa.me/message/R2T4NMNY46OEL1"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3.5 p-2 rounded-xl text-left font-sans font-medium text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-all group cursor-pointer"
                  >
                    <div className="p-1.5 bg-gray-50 border border-gray-200 rounded-xl group-hover:bg-gray-950 group-hover:text-white transition-all text-gray-600">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-gray-900 font-medium">Suporte ou sugestões</span>
                      <span className="text-[10px] font-normal text-gray-500 block leading-tight">Fale conosco pelo WhatsApp</span>
                    </div>
                  </a>

                  {/* WhatsApp Offers Channel */}
                  <a
                    href="https://chat.whatsapp.com/IvwQos4ntsGEfgLZzZdayx?mode=gi_t"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3.5 p-2 rounded-xl text-left font-sans font-medium text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-all group cursor-pointer"
                  >
                    <div className="p-1.5 bg-gray-50 border border-gray-200 rounded-xl group-hover:bg-gray-950 group-hover:text-white transition-all text-gray-600">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-gray-900 font-medium">Grupo de Ofertas</span>
                      <span className="text-[10px] font-normal text-gray-500 block leading-tight">Dicas e promoções especiais</span>
                    </div>
                  </a>

                  {/* About the Application Item */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAboutOpen(true);
                    }}
                    className="w-full flex items-center gap-3.5 p-2 rounded-xl text-left font-sans font-medium text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-all group cursor-pointer"
                  >
                    <div className="p-1.5 bg-gray-50 border border-gray-200 rounded-xl group-hover:bg-gray-950 group-hover:text-white transition-all text-gray-600">
                      <Info className="w-4 h-4" />
                    </div>
                    <span>Sobre o App</span>
                  </button>
                </div>

                {/* Lovely Pastel App Installer Mini Banner inside Drawer */}
                {isInstallable && (
                  <div className="mt-auto bg-gray-50 p-4 rounded-xl border border-gray-200 text-center shadow-xs">
                    <p className="text-[11.5px] text-gray-600 font-normal leading-relaxed mb-3">
                      Instale o app na sua tela inicial para acessar mais rápido no dia a dia.
                    </p>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleInstallApp();
                      }}
                      className="w-full py-2 bg-gray-950 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors cursor-pointer"
                    >
                      Instalar Agora
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer Details */}
              <div className="p-5 border-t border-gray-100 bg-gray-50 text-center rounded-br-2xl">
                <span className="text-[10px] text-gray-400 block uppercase tracking-wide font-mono">ClimaBaby v3.2</span>
                <span className="text-[9.5px] text-gray-400 font-normal block leading-relaxed mt-1">Carrega atualizações em tempo real</span>
              </div>
            </motion.div>
          </React.Fragment>
        )}

        {isAboutOpen && (
          <React.Fragment key="about-modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAboutOpen(false)}
              className="fixed inset-0 bg-gray-955 z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-2xl p-6 shadow-2xl z-55 border border-gray-150 flex flex-col gap-4 text-center"
            >
              <div className="w-12 h-12 bg-gray-50 text-gray-800 rounded-full flex items-center justify-center mx-auto border border-gray-150">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-semibold text-lg text-gray-900 border-none outline-none leading-tight">Sobre o ClimaBaby</h3>
              <p className="text-xs sm:text-sm text-gray-650 font-normal leading-relaxed">
                O <strong>ClimaBaby</strong> é um aplicativo progressivo (PWA) de utilidade prática criado para de forma descomplicada apoiar cuidadores a escolherem as camadas perfeitas de vestimenta para os pequenos.
              </p>
              <p className="text-[11.5px] text-gray-600 font-normal leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-150">
                Utilizamos algoritmos térmicos baseados em consensos de pediatria e neonatologia para guiar o sono seguro, a transpiração livre e minimizar riscos de superaquecimento.
              </p>
              <div className="flex flex-col gap-2 pt-2 border-none">
                <button
                  onClick={() => setIsAboutOpen(false)}
                  className="w-full py-2.5 bg-gray-955 hover:bg-black text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Entendi, obrigado!
                </button>
              </div>
            </motion.div>
          </React.Fragment>
        )}

        {isPwaInstructionOpen && (
          <React.Fragment key="install-modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPwaInstructionOpen(false)}
              className="fixed inset-0 bg-gray-955 z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-2xl p-6 shadow-2xl z-55 border border-gray-150 flex flex-col gap-4 focus:outline-none"
            >
              <div className="w-12 h-12 bg-gray-50 text-gray-850 rounded-full flex items-center justify-center mx-auto border border-gray-200">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-center text-lg text-gray-900 leading-tight">Instalar na Tela Inicial</h3>
              
              <div className="space-y-4 py-1 text-xs text-gray-600 font-normal">
                <p className="text-center text-xs text-gray-500 leading-relaxed">
                  Acesse com apenas um toque no seu celular! Funciona de modo prático inclusive offline.
                </p>

                {/* iPhone / Safari specific manual */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
                  <span className="font-sans font-bold text-gray-900 text-xs block uppercase tracking-wide">No iPhone (iOS - Safari)</span>
                  <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed text-gray-700">
                    <li>Toque no botão de <strong>Compartilhar</strong> <Share2 className="w-3.5 h-3.5 inline inline-block text-gray-850" /> no Safari (setinha no rodapé).</li>
                    <li>Role o menu de opções para baixo.</li>
                    <li>Clique em <strong>Adicionar à Tela de Início</strong>.</li>
                  </ol>
                </div>

                {/* Android / Chrome specific manual */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-155 space-y-2">
                  <span className="font-sans font-bold text-gray-900 text-xs block uppercase tracking-wide">No Android (Chrome)</span>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-gray-700 leading-relaxed">
                    <li>Toque no botão de <strong>3 pontinhos</strong> do navegador.</li>
                    <li>Selecione <strong>Adicionar à Tela Inicial</strong> ou <strong>Instalar Aplicativo</strong>.</li>
                  </ol>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-none">
                <button
                  onClick={() => setIsPwaInstructionOpen(false)}
                  className="w-full py-2.5 bg-gray-955 hover:bg-black text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors text-center"
                >
                  Entendi, vou instalar!
                </button>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>

    </div>
  );
}
