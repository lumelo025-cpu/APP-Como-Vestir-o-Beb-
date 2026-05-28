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
import menuClothesLogo from './assets/images/menu_clothes_logo_1779899134603.png';

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
    <div className="min-h-screen bg-[#FAF6F0] selection:bg-brand-pink/60 selection:text-brand-charcoal text-scale-subtle flex flex-col items-center justify-between pb-8 pt-4 px-4 sm:px-6 relative overflow-x-hidden">
      
      {/* Absolute Cosmic Backdrop for elegant playfulness with a futuristic touch */}
      <div className="absolute top-0 left-0 right-0 h-[450px] overflow-hidden pointer-events-none z-0 select-none">
        {/* Soft atmospheric glow planets/orbs */}
        <div className="absolute -top-28 -left-28 w-[400px] h-[400px] rounded-full bg-[#FCE8E6] opacity-75 blur-3xl animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-24 right-[-120px] w-[350px] h-[350px] rounded-full bg-[#F2EEFC] opacity-80 blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute -top-10 left-[30%] w-80 h-80 rounded-full bg-[#EAF0EC] opacity-60 blur-3xl"></div>
        
        {/* Futuristic thin orbits */}
        <div className="absolute top-10 left-10 w-[240px] h-[240px] rounded-full border border-pink-200/20 opacity-30 animate-spin-slow" style={{ animationDuration: '30s' }} />
        <div className="absolute top-24 right-20 w-[180px] h-[180px] rounded-full border border-purple-200/25 opacity-40 animate-spin-slow" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
        
        {/* Little floating stars / stardust */}
        <div className="absolute top-12 left-[15%] w-2 h-2 rounded-full bg-pink-300 opacity-40 animate-stardust-slow"></div>
        <div className="absolute top-48 left-[45%] w-1.5 h-1.5 rounded-full bg-purple-300 opacity-50 animate-stardust-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-32 right-[25%] w-2.5 h-2.5 rounded-full bg-amber-200 opacity-65 animate-stardust-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Modern App Header with Hamburger & PWA install shortcuts */}
      <header className="w-full max-w-xl flex items-center justify-between py-1 mb-3.5 z-20">
        <div className="flex items-center gap-2">
          {/* Menu Trigger Button */}
          <motion.button 
            id="btn-open-menu"
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(true)}
            className="p-2.5 bg-white border border-[#FAEDE2] hover:bg-[#FAF6F0] text-brand-charcoal rounded-full shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-center relative"
          >
            <Menu className="w-5 h-5 text-brand-charcoal" />
          </motion.button>
        </div>

        {/* Center application branding */}
        <motion.div 
          onClick={() => { setScreen('welcome'); setStep(1); }}
          className="cursor-pointer flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-[#FAEDE2] rounded-full shadow-3xs group hover:border-[#F2D7CD] transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center border border-brand-rose/20 shrink-0">
            <img 
              src={menuClothesLogo} 
              alt="Logo Como Vestir o Bebê" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-display font-medium text-xs sm:text-sm text-brand-charcoal select-none tracking-tight">
            Como Vestir o Bebê
          </span>
        </motion.div>

        {/* Right download PWA icon shortcut */}
        <div className="flex items-center">
          <motion.button 
            id="header-btn-install"
            whileTap={{ scale: 0.9 }}
            onClick={handleInstallApp}
            className="p-2.5 bg-brand-rose/10 text-brand-rose border border-brand-rose/10 hover:bg-brand-rose/20 rounded-full shadow-3xs hover:shadow-2xs transition-all cursor-pointer flex items-center justify-center"
            title="Instalar Aplicativo"
          >
            <Download className="w-4 h-4" />
          </motion.button>
        </div>
      </header>

      {/* Primary Card Viewport with elegant rounded glass edges and double-layer neon shadows */}
      <main className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl border border-white/65 shadow-[0_20px_50px_rgba(229,135,147,0.06)] hover:shadow-[0_25px_60px_rgba(229,135,147,0.12)] transition-all duration-500 z-10 overflow-hidden min-h-[500px] flex flex-col">
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
                
                {/* Visual Avatar Cover with Futuristic Back Orbit Ring */}
                <div className="relative mb-6">
                  {/* Outer Cyber Spin Orbit Ring */}
                  <div className="absolute inset-[-14px] rounded-full border border-dashed border-[#E58793]/40 animate-spin-slow"></div>
                  <div className="absolute inset-[-6px] rounded-full border border-gradient-to-tr from-[#FCE8E6] to-[#F2EEFC] opacity-70 animate-pulse"></div>
                  
                  {/* Soft Background Planetary Glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#FFF9F2] to-[#FCE8E6] rounded-full scale-125 blur-md"></div>
                  
                  {/* Logo Center */}
                  <div className="relative w-28 h-28 mx-auto bg-white rounded-full flex items-center justify-center overflow-hidden border border-[#FAEDE2] shadow-md z-1">
                    <motion.img
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                      src={menuClothesLogo}
                      alt="Logo Como Vestir o Bebê"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  {/* Radiant Sparks Badge */}
                  <div className="absolute -right-1.5 -bottom-1.5 bg-gradient-to-tr from-amber-400 to-yellow-300 p-2 rounded-full shadow-lg text-white z-2 border border-white animate-bounce" style={{ animationDuration: '4s' }}>
                    <Sparkles className="w-4 h-4 fill-white" />
                  </div>
                </div>

                <h2 className="font-display text-2xl sm:text-3.5xl font-bold text-brand-charcoal tracking-tight leading-tight mb-3 px-1">
                  Vestir seu bebê com <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4717E] to-[#E58793] glow-pink">carinho</span> e sem dúvidas!
                </h2>

                <p className="text-gray-500 font-light text-sm sm:text-base max-w-sm leading-relaxed mb-6">
                  Esqueça a insegurança de vestir a mais ou a menos. Responda a algumas perguntas simples sobre o dia de hoje e receba recomendações térmicas seguras e personalizadas.
                </p>

                {/* Aesthetic Glassmorphic Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-6 pointer-events-none">
                  <span className="text-xs font-medium px-3.5 py-1.5 bg-brand-sage/60 text-emerald-800 rounded-full border border-emerald-150 shadow-3xs backdrop-blur-xs flex items-center gap-1">👶 Sem excesso de camadas</span>
                  <span className="text-xs font-medium px-3.5 py-1.5 bg-[#F2EEFC]/60 text-purple-800 rounded-full border border-purple-150 shadow-3xs backdrop-blur-xs flex items-center gap-1">🌙 Sono seguro</span>
                  <span className="text-xs font-medium px-3.5 py-1.5 bg-brand-pink/60 text-[#D4717E] rounded-full border border-pink-150 shadow-2xs backdrop-blur-xs flex items-center gap-1">🌡️ Inteligência térmica</span>
                </div>
              </div>

              <div className="w-full mt-4 space-y-6">
                
                {/* Hero Gradient Conversion Button */}
                <motion.button
                  id="btn-start"
                  onClick={startWizard}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4.5 bg-gradient-to-r from-[#E58793] to-[#D4717E] hover:from-[#EC9CA7] hover:to-[#E58793] text-white font-semibold rounded-2xl shadow-lg shadow-brand-rose/30 hover:shadow-xl hover:shadow-brand-rose/40 transition-all outline-none cursor-pointer flex items-center justify-center gap-2 text-md sm:text-lg relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="flex items-center gap-2">
                    Começar Calculadora Dinâmica <ChevronRight className="w-5 h-5" />
                  </span>
                </motion.button>

                {/* CHECAGEM RÁPIDA (QUICK CHECK) CONTAINER WITH PREMIUM TRANSLUCENT DESIGN */}
                <div className="pt-6 border-t border-[#FAEDE2]/60 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center p-1 bg-brand-rose/10 text-[#D4717E] rounded-lg">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <h3 className="font-display font-semibold text-xs sm:text-sm text-brand-charcoal uppercase tracking-wider">
                      Checagem Rápida: Clima Instantâneo ⏱️
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 font-light mb-4">
                    Com pressa? Informe apenas a temperatura da sala e o período do dia para testar as roupas certas em um piscar de olhos.
                  </p>

                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4.5 border border-[#FAEDE2]/60 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-[0_4px_24px_rgba(229,135,147,0.02)]">
                    
                    {/* Temperature Controls */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-brand-charcoal flex items-center gap-1.5">
                        <Thermometer className="w-4 h-4 text-brand-rose" /> Qual a temperatura?
                      </label>
                      <div className="flex items-center justify-between bg-white/90 border border-[#EEDBCD]/50 rounded-xl p-1.5 max-w-[170px] shadow-3xs hover:border-[#F2D7CD] transition-colors">
                        <motion.button
                          type="button"
                          id="btn-quick-dec"
                          onClick={() => setQuickTemp(prev => Math.max(5, prev - 1))}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-[#FCE8E6]/40 flex items-center justify-center text-brand-charcoal font-bold transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-600" />
                        </motion.button>
                        <span className="font-display font-bold text-sm text-brand-charcoal min-w-[32px] text-center font-mono">
                          {quickTemp}°C
                        </span>
                        <motion.button
                          type="button"
                          id="btn-quick-inc"
                          onClick={() => setQuickTemp(prev => Math.min(41, prev + 1))}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-[#FCE8E6]/40 flex items-center justify-center text-brand-charcoal font-bold transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Period Controls */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-brand-charcoal flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-purple-600 animate-float-gentle" /> Período do Dia:
                      </label>
                      <div className="grid grid-cols-2 gap-1 bg-white/90 border border-[#EEDBCD]/50 rounded-xl p-1 shadow-3xs">
                        <button
                          type="button"
                          id="btn-quick-day"
                          onClick={() => setQuickPeriod('dia')}
                          className={`py-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            quickPeriod === 'dia'
                              ? 'bg-gradient-to-tr from-[#FFF9F2] to-amber-100/40 text-amber-800 shadow-3xs font-semibold border border-amber-200/50'
                              : 'text-gray-550 hover:text-gray-700 hover:bg-gray-50/50'
                          }`}
                        >
                          Dia ☀️
                        </button>
                        <button
                          type="button"
                          id="btn-quick-night"
                          onClick={() => setQuickPeriod('noite')}
                          className={`py-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            quickPeriod === 'noite'
                              ? 'bg-gradient-to-tr from-[#F2EEFC] to-purple-100/40 text-purple-800 shadow-3xs font-semibold border border-purple-200/50'
                              : 'text-gray-555 hover:text-gray-700 hover:bg-gray-50/50'
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
                    whileHover={{ scale: 1.015, y: -0.5 }}
                    whileTap={{ scale: 0.985 }}
                    className="w-full mt-3.5 py-3.5 bg-gradient-to-r from-emerald-50 to-[#EAF0EC] border border-emerald-200/80 hover:border-emerald-300 text-emerald-800 font-medium text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs"
                  >
                    Calcular Recomendações Únicas ⚡
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
              {/* Steppers Header */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                  <span className="font-display font-medium text-brand-rose">Passo {step} de 3</span>
                  <span className="font-light">
                    {step === 1 && 'Sobre o bebê'}
                    {step === 2 && 'Momento & Lugar'}
                    {step === 3 && 'O Clima atual'}
                  </span>
                </div>
                {/* Custom animated progress bar */}
                <div className="w-full h-1.5 bg-[#FAF6F0] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-brand-rose" 
                    initial={{ width: '33.3%' }}
                    animate={{ width: `${step * 33.3}%` }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                </div>
              </div>

              {/* Dynamic Steps Render */}
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
                        <label className="font-display text-md sm:text-lg font-medium text-brand-charcoal block mb-1">
                          Qual a idade do bebê? 🍼
                        </label>
                        <p className="text-xs text-gray-500 font-light mb-3">
                          Bebês muito novos regulam menos a temperatura corporal e requerem mais aconchego.
                        </p>
                        <div className="space-y-2.5">
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
                              className={`w-full p-3.5 rounded-2xl text-left border transition-all duration-300 cursor-pointer flex items-center justify-between shadow-2xs hover:shadow-xs ${
                                answers.age === item.key
                                  ? 'bg-gradient-to-r from-[#FCE8E6]/50 to-white border-[#E58793] glow-pink cyber-outline-pink'
                                  : 'bg-white hover:bg-gray-50 border-[#EEDBCD]/40'
                              }`}
                            >
                              <div>
                                <span className="font-semibold text-sm sm:text-base text-brand-charcoal block">{item.label}</span>
                                <span className="text-xs text-brand-charcoal/50 font-light mt-0.5 block">{item.desc}</span>
                              </div>
                              <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all shadow-4xs ${
                                answers.age === item.key 
                                  ? 'bg-gradient-to-tr from-[#E58793] to-[#D4717E] border-transparent text-white' 
                                  : 'border-[#EEDBCD]/60'
                              }`}>
                                {answers.age === item.key && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="font-display text-md sm:text-lg font-medium text-brand-charcoal block mb-1">
                          O bebê costuma sentir: 🌡️
                        </label>
                        <p className="text-xs text-gray-500 font-light mb-3">
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
                              className={`p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer flex flex-col items-center gap-1.5 shadow-2xs hover:shadow-xs hover:border-[#E58793]/40 ${
                                answers.sensitivity === item.key
                                  ? 'bg-gradient-to-tr from-[#FCE8E6]/50 to-white border-[#E58793] text-[#D4717E] font-semibold glow-pink'
                                  : 'bg-white hover:bg-gray-50 border-[#EEDBCD]/50 text-gray-600'
                              }`}
                            >
                              <span className="text-lg">{item.emoji}</span>
                              <span className="text-xs leading-none">{item.label}</span>
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
                        <label className="font-display text-md sm:text-lg font-medium text-brand-charcoal block mb-1">
                          Vamos vestir o bebê para: 🛌
                        </label>
                        <p className="text-xs text-gray-500 font-light mb-3">
                          selecione a opção que mais se encaixa para o momento que vamos vestir o bebê
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { key: 'dormindo', label: 'Dormir', desc: 'Confortável e seguro' },
                            { key: 'acordado', label: 'Acordado em casa', desc: 'Tempo livre para brincar e rolar' },
                            { key: 'passeando', label: 'Passear ao ar livre', desc: 'Caminhando ou ao ar livre' },
                            { key: 'colo-sling', label: 'No colo / Sling', desc: 'Colinho de mãe/pai que aquece bastantão' },
                            { key: 'carrinho', label: 'Dentro do carrinho', desc: 'Protegido da brisa direta' }
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              id={`state-opt-${item.key}`}
                              onClick={() => setAnswers(prev => ({ ...prev, state: item.key as BabyState }))}
                              className={`w-full p-3 rounded-xl text-left border transition-all duration-300 cursor-pointer flex items-center justify-between shadow-3xs hover:shadow-2xs ${
                                answers.state === item.key
                                  ? 'bg-gradient-to-r from-[#F2EEFC]/55 to-white border-purple-300 glow-purple cyber-outline-purple'
                                  : 'bg-white hover:bg-gray-50 border-[#EEDBCD]/40'
                              }`}
                            >
                              <div>
                                <span className="font-semibold text-xs sm:text-sm text-brand-charcoal block">{item.label}</span>
                                <span className="text-[11px] text-brand-charcoal/50 font-light mt-0.5 block">{item.desc}</span>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                answers.state === item.key 
                                  ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 border-transparent text-white' 
                                  : 'border-[#EEDBCD]/60'
                              }`}>
                                {answers.state === item.key && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="font-display text-md sm:text-lg font-medium text-brand-charcoal block mb-1">
                          O ambiente está: 🏡
                        </label>
                        <p className="text-xs text-gray-500 font-light mb-2.5">
                          A sensação real do lugar onde o bebê passará esse momento.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'fechado', label: 'Fechado', desc: 'Aconchegante e quente' },
                            { key: 'ventilado', label: 'Ventilado', desc: 'Ar correndo levemente' },
                            { key: 'ventilador', label: 'Com ventilador', desc: 'Fluxo contínuo ativo' },
                            { key: 'ar-condicionado', label: 'Ar Condicionado', desc: 'Climatizado mais frio' },
                            { key: 'externo', label: 'Área externa', desc: 'Ao ar livre' },
                            { key: 'vento-frio', label: 'Vento frio', desc: 'Brigas e correntes frias' }
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              id={`cond-opt-${item.key}`}
                              onClick={() => setAnswers(prev => ({ ...prev, condition: item.key as EnvironmentCondition }))}
                              className={`p-2.5 rounded-xl border text-left transition-all duration-300 cursor-pointer shadow-3xs hover:shadow-2xs ${
                                answers.condition === item.key
                                  ? 'bg-gradient-to-r from-emerald-50/50 to-white border-emerald-300 text-emerald-850 glow-emerald'
                                  : 'bg-white hover:bg-gray-50 border-[#EEDBCD]/40 text-gray-650'
                              }`}
                            >
                              <span className="font-semibold text-xs text-brand-charcoal block">{item.label}</span>
                              <span className="text-[10px] text-brand-charcoal/50 font-light mt-0.5 block">{item.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1">
                        <label className="font-display text-sm font-medium text-brand-charcoal block mb-2">
                          Período do Dia: ☀️🌙
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'dia', label: 'Dia ☀️', style: 'hover:border-amber-200' },
                            { key: 'noite', label: 'Noite 🌙', style: 'hover:border-indigo-200' }
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              id={`period-opt-${item.key}`}
                              onClick={() => setAnswers(prev => ({ ...prev, period: item.key as PeriodOfDay }))}
                              className={`p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer text-xs font-semibold shadow-3xs hover:shadow-2xs ${
                                answers.period === item.key
                                  ? 'bg-gradient-to-tr from-[#FFF9F2] to-amber-100/30 border-amber-300 text-amber-800 glow-amber'
                                  : `bg-white border-[#EEDBCD]/45 text-gray-600 ${item.style}`
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
                        <label className="font-display text-md sm:text-lg font-medium text-brand-charcoal block mb-1">
                          Como o ambiente está agora? 🌡️
                        </label>
                        <p className="text-xs text-gray-500 font-light mb-4">
                          Substitua a lida puramente numérica pela percepção do clima atual.
                        </p>

                        {/* Feeling options list/grid */}
                        <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
                          {[
                            { key: 'muito-quente', label: 'Muito quente', emoji: '🥵', desc: 'Calor acima de 30°C' },
                            { key: 'quente', label: 'Quente', emoji: '☀️', desc: 'Sol entre 27°C e 30°C' },
                            { key: 'agradavel', label: 'Agradável', emoji: '😊', desc: 'Varanda fresca (22°C - 26°C)' },
                            { key: 'fresquinho', label: 'Fresquinho', emoji: '🌥️', desc: 'Outono ameno (18°C - 21°C)' },
                            { key: 'frio', label: 'Frio', emoji: '🥶', desc: 'Estação fria (12°C - 17°C)' },
                            { key: 'muito-frio', label: 'Muito frio', emoji: '❄️', desc: 'Geada abaixo de 12°C' }
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              id={`feel-opt-${item.key}`}
                              onClick={() => setAnswers(prev => {
                                const updated = { ...prev, feeling: item.key as AmbientFeeling };
                                // If they have temperature enabled, update it to align nicely
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
                              className={`p-3 rounded-2xl border text-left transition-all duration-300 cursor-pointer shadow-3xs flex flex-col justify-between h-[75px] ${
                                answers.feeling === item.key
                                  ? 'bg-gradient-to-tr from-[#FFF9F2] to-amber-50/20 border-amber-300 glow-amber text-[#b47716]'
                                  : 'bg-white hover:bg-gray-50 border-[#EEDBCD]/40 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full h-full">
                                <div>
                                  <span className="font-semibold text-xs text-brand-charcoal block leading-tight">{item.label}</span>
                                  <span className="text-[10px] text-gray-500 font-light block mt-1 leading-snug">{item.desc}</span>
                                </div>
                                <span className="text-2xl ml-1 leading-none">{item.emoji}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Optional: Input de temperatura aproximada em graus */}
                      <div className="pt-4 border-t border-[#FAEDE2]">
                        <button
                          type="button"
                          id="btn-toggle-temp"
                          onClick={() => {
                            if (answers.temperature === null) {
                              // Enable temperature based on feeling
                              let defaultT = 23;
                              if (answers.feeling === 'muito-quente') defaultT = 33;
                              else if (answers.feeling === 'quente') defaultT = 28;
                              else if (answers.feeling === 'agradavel') defaultT = 23;
                              else if (answers.feeling === 'fresquinho') defaultT = 19;
                              else if (answers.feeling === 'frio') defaultT = 14;
                              else defaultT = 9;
                              setAnswers(prev => ({ ...prev, temperature: defaultT }));
                            } else {
                              // Disable temperature
                              setAnswers(prev => ({ ...prev, temperature: null }));
                            }
                          }}
                          className="flex items-center gap-2.5 text-xs text-brand-charcoal/85 hover:text-brand-rose font-semibold bg-white border border-[#EEDBCD]/45 p-3 rounded-xl transition-all shadow-3xs cursor-pointer w-full justify-center"
                        >
                          <Thermometer className={`w-3.5 h-3.5 ${answers.temperature !== null ? 'text-brand-rose animate-pulse' : 'text-gray-400'}`} />
                          {answers.temperature !== null 
                            ? 'Omitir temperatura aproximada em graus (°C)' 
                            : 'Opcional: Informar temperatura aproximada em graus (°C)'}
                        </button>

                        {answers.temperature !== null && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4 text-center overflow-hidden"
                          >
                            <p className="text-[11px] text-gray-500 font-light mb-1">
                              Ajuste os graus de forma fina utilizando os botões de - e + ou arraste o controle deslizante abaixo:
                            </p>

                            {/* Interactive Thermometer Status Widget */}
                            <div className={`mx-auto rounded-3xl p-4 border text-center transition-all max-w-sm ${getTempColorStyle(answers.temperature, answers.feeling).bg}`}>
                              <span className="text-3xl font-display font-medium tracking-tight">
                                {answers.temperature}<span className="text-xl font-light">°C</span>
                              </span>
                              
                              <div className="flex items-center justify-center gap-3 mt-3">
                                <motion.button
                                  id="btn-temp-dec-wiz"
                                  type="button"
                                  onClick={() => setAnswers(prev => ({ ...prev, temperature: Math.max(5, (prev.temperature || 22) - 1) }))}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-brand-charcoal shadow-xs hover:shadow-md cursor-pointer border border-[#EEDBCD]/45"
                                  title="Diminuir 1 grau"
                                >
                                  <Minus className="w-4 h-4 stroke-[2.5]" />
                                </motion.button>

                                <div className="flex-1 max-w-[150px]">
                                  <input
                                    id="input-temp-slider-wiz"
                                    type="range"
                                    min="5"
                                    max="40"
                                    value={answers.temperature}
                                    onChange={(e) => setAnswers(prev => ({ ...prev, temperature: parseInt(e.target.value) }))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-rose focus:outline-none"
                                  />
                                </div>

                                <motion.button
                                  id="btn-temp-inc-wiz"
                                  type="button"
                                  onClick={() => setAnswers(prev => ({ ...prev, temperature: Math.min(40, (prev.temperature || 22) + 1) }))}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-brand-charcoal shadow-xs hover:shadow-md cursor-pointer border border-[#EEDBCD]/45"
                                  title="Aumentar 1 grau"
                                >
                                  <Plus className="w-4 h-4 stroke-[2.5]" />
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

              {/* Step Navigation Button Row */}
              <div className="flex gap-3 pt-6 border-t border-[#FAEDE2] mt-4">
                <button
                  type="button"
                  id="btn-back"
                  onClick={handlePrevStep}
                  className="px-5 py-3.5 bg-[#FAF6F0]/80 hover:bg-gray-200 text-brand-charcoal border border-[#EEDBCD]/60 text-sm font-semibold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-3xs"
                >
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </button>

                <button
                  type="button"
                  id="btn-next"
                  onClick={handleNextStep}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#E58793] to-[#D4717E] hover:from-[#EC9CA7] hover:to-[#E58793] text-white text-sm font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-rose/25 relative overflow-hidden group"
                >
                  {step === 3 ? 'Calcular Roupa Perfeita ⚡' : 'Continuar'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* LOADING SCREEN WITH PULSING COMPILING METRICS */}
          {screen === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-center items-center p-8 text-center"
              id="screen-loading"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-brand-pink/20 rounded-full scale-150 animate-ping"></div>
                <div className="relative w-20 h-20 bg-[#FFF9F2] border border-[#FAEDE2] rounded-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                  >
                    <RefreshCw className="w-8 h-8 text-brand-rose" />
                  </motion.div>
                </div>
              </div>

              {/* Animated Text Sequence */}
              <AnimatePresence mode="wait">
                <motion.h3
                  key={loadingText}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="font-display text-lg font-medium text-brand-charcoal max-w-xs mt-2"
                >
                  {loadingText}
                </motion.h3>
              </AnimatePresence>

              <p className="text-xs text-gray-500 font-light mt-3 max-w-xs">
                Nossos especialistas revisam camadas térmicas seguras para evitar riscos de superaquecimento ou choque térmico.
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
              className="flex-1 flex flex-col justify-between p-5 sm:p-7 space-y-4"
              id="screen-result"
            >
              {/* Header result badge info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-[#FAEDE2] gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-full ${getTempColorStyle(answers.temperature, answers.feeling).pill}`}>
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-brand-charcoal leading-tight">
                      {result.temperatureCategory}
                    </h3>
                    <p className="text-xs text-gray-500 font-light">
                      Sensibilidade: {getAgeFriendlyName(answers.age)}
                    </p>
                  </div>
                </div>

                {/* Instant thermal adjuster panel (extremely practical for parents on the fly) */}
                <div className="flex items-center gap-1.5 self-start bg-brand-beige border border-[#EEDBCD]/40 rounded-xl p-1 shadow-2xs">
                  <button
                    id="btn-res-dec"
                    type="button"
                    onClick={() => adjustResultTemperature(-1)}
                    className="p-1.5 hover:bg-white text-brand-charcoal/80 rounded-md transition-all cursor-pointer"
                    title="Testar com 1°C a menos"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <span className="text-xs font-mono font-medium text-brand-charcoal px-2 bg-white rounded-md shadow-3xs py-1 min-w-[45px] text-center">
                    {answers.temperature !== null ? `${answers.temperature}°C` : getFeelingFriendlyName(answers.feeling)}
                  </span>
                  <button
                    id="btn-res-inc"
                    type="button"
                    onClick={() => adjustResultTemperature(1)}
                    className="p-1.5 hover:bg-white text-brand-charcoal/80 rounded-md transition-all cursor-pointer"
                    title="Testar com 1°C a mais"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  
                  {/* Wind toggle button right inside results */}
                  <button
                    id="btn-res-wind"
                    type="button"
                    onClick={toggleResultWind}
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${answers.condition === 'vento-frio' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-400 hover:text-gray-650'}`}
                    title={answers.condition === 'vento-frio' ? "Remover efeito de vento" : "Simular vento/sensação fria"}
                  >
                    <Wind className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* COGNITIVE VISUAL THERMOMETER */}
              <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 border border-[#FAEDE2] flex flex-col items-center shadow-3xs">
                <span className="text-[10px] font-semibold text-gray-450 uppercase tracking-widest mb-3 flex items-center gap-1.5 leading-none">
                  <Thermometer className="w-3.5 h-3.5 text-brand-rose" /> Termômetro de Conforto Térmico
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
                      <div className={`py-2.5 px-3 rounded-2xl text-center flex flex-col items-center justify-center transition-all duration-300 w-full ${
                        effectiveTemp < 19 
                          ? 'bg-gradient-to-tr from-sky-100 to-sky-50 border border-sky-300 text-sky-850 shadow-2xs font-semibold glow-sky' 
                          : 'bg-[#FAF6F0]/50 border border-transparent text-gray-400 opacity-60 font-light'
                      }`}>
                        <span className="text-xl">🥶</span>
                        <span className="text-[11px] mt-1 font-medium">Frio</span>
                      </div>
                      <div className={`py-2.5 px-3 rounded-2xl text-center flex flex-col items-center justify-center transition-all duration-300 w-full ${
                        effectiveTemp >= 19 && effectiveTemp < 27
                          ? 'bg-gradient-to-tr from-emerald-100 to-emerald-50 border border-emerald-300 text-emerald-850 shadow-2xs font-semibold glow-emerald' 
                          : 'bg-[#FAF6F0]/50 border border-transparent text-gray-400 opacity-60 font-light'
                      }`}>
                        <span className="text-xl">😊</span>
                        <span className="text-[11px] mt-1 font-medium">Normal</span>
                      </div>
                      <div className={`py-2.5 px-3 rounded-2xl text-center flex flex-col items-center justify-center transition-all duration-300 w-full ${
                        effectiveTemp >= 27
                          ? 'bg-gradient-to-tr from-rose-100 to-rose-50 border border-rose-300 text-rose-850 shadow-2xs font-semibold glow-rose' 
                          : 'bg-[#FAF6F0]/50 border border-transparent text-gray-400 opacity-60 font-light'
                      }`}>
                        <span className="text-xl">🥵</span>
                        <span className="text-[11px] mt-1 font-medium">Muito Quente</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* CORE METRIC CARD: LAYER COUNT */}
              <div className="bg-[#FAF3FF]/80 backdrop-blur-xs border border-purple-200/55 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4 glow-purple shadow-3xs">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 text-xs text-brand-charcoal/70 uppercase font-semibold">
                    <Layers className="w-4 h-4 text-purple-650" /> RECOMENDAÇÃO DE CAMADAS
                  </div>
                  <h4 className="font-display font-bold text-2xl text-purple-950 mb-1">
                    {result.layerCount} {result.layerCount === 1 ? 'Camada única' : result.layerCount === 2 ? 'Camadas leves' : 'Camadas aconchegantes'}
                  </h4>
                  <p className="text-xs text-purple-900/80 font-light leading-relaxed">
                    {result.layersDescription}
                  </p>
                </div>

                {/* Layer visual stack pills */}
                <div className="flex flex-col gap-1 w-full md:w-32">
                  {Array.from({ length: result.layerCount }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`h-6 rounded-lg flex items-center justify-between px-3 text-[10px] font-bold tracking-tight text-white shadow-2xs ${
                        i === 0 ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 border border-indigo-400/20' : i === 1 ? 'bg-gradient-to-r from-purple-500 to-purple-600 border border-purple-400/20' : 'bg-gradient-to-r from-pink-400 to-pink-500 border border-pink-300/20'
                      }`}
                    >
                      <span>💡 Camada {i + 1}</span>
                      <span className="font-light opacity-90">
                        {i === 0 && 'Base / Toque'}
                        {i === 1 && 'Intermediária'}
                        {i === 2 && 'Isolamento'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 🍼 LOOK RECOMENDADO PARA ESTA TEMPERATURA */}
              <div className="bg-white rounded-2xl p-4.5 border border-[#FAEDE2] shadow-3xs space-y-3.5">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[#FAF6F0]">
                  <div className="p-1.5 bg-brand-pink text-brand-rose rounded-lg shadow-4xs">
                    <Shirt className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-sm sm:text-base text-brand-charcoal">
                      🍼 Look Recomendado para esta Temperatura
                    </h4>
                    <p className="text-[11px] text-gray-500 font-light">
                      O enxoval perfeito combinado para se livrar das dúvidas de imediato.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {result.visualItems.map((itemId) => {
                    const itemInfo = CLOTHING_DATABASE[itemId];
                    if (!itemInfo) return null;
                    
                    // Specific helper for color-coded heating badges
                    let badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
                    if (itemInfo.heatingLevel === 'Médio') {
                      badgeStyles = 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
                    } else if (itemInfo.heatingLevel === 'Alto') {
                      badgeStyles = 'bg-amber-50 text-amber-700 border-amber-250/60';
                    } else if (itemInfo.heatingLevel === 'Muito Alto') {
                      badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200/60';
                    }

                    return (
                      <motion.div
                        key={itemId}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -3, scale: 1.015 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="bg-brand-beige border border-[#FAEDE2] rounded-2xl overflow-hidden flex flex-col group shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        {/* Cloth picture wrapper */}
                        <div className="relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center border-b border-[#FAF0E6]">
                          <img
                            src={itemInfo.url}
                            alt={itemInfo.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLDivElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          {/* Sparing Fallback SVG/Icon */}
                          <div className="fallback-icon absolute inset-0 bg-[#FFFDFB] flex flex-col items-center justify-center p-3 text-center pointer-events-none" style={{ display: 'none' }}>
                            <Shirt className="w-10 h-10 text-[#E2C7B3] mb-1.5 animate-pulse" />
                            <span className="text-[10px] text-[#A69799] italic uppercase font-semibold">Sem Foto</span>
                          </div>
                          
                          {/* Little visual verification status */}
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-[9px] font-bold text-emerald-700 px-1.5 py-0.5 rounded-full select-none shadow-3xs border border-emerald-100 flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-55 bg-emerald-400 animate-pulse"></span>
                            Look ✓
                          </div>
                        </div>

                        <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <h5 className="font-display text-[11px] sm:text-xs md:text-sm font-bold text-brand-charcoal leading-snug group-hover:text-amber-850 transition-colors break-words hyphens-auto">
                              {itemInfo.name}
                            </h5>
                            <p className="text-[10px] sm:text-[10.5px] text-gray-500 font-light leading-snug sm:leading-relaxed mt-1 break-words line-clamp-3 sm:line-clamp-none">
                              {itemInfo.desc}
                            </p>
                          </div>
                          
                          {/* Heating level */}
                          <div className="pt-1.5 border-t border-[#FAF6F0] flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                            <span className="text-[8.5px] sm:text-[9px] text-gray-400 uppercase tracking-wide">Calor</span>
                            <span className={`text-[9.5px] sm:text-[10px] font-semibold uppercase px-1.5 sm:px-2 py-0.5 rounded-md border text-center self-start xs:self-auto ${badgeStyles}`}>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* OUTFIT RECOMMENDATION */}
                <div className="bg-white rounded-2xl p-4 border-t-4 border-t-brand-rose border-[#FAEDE2] shadow-3xs hover:shadow-2xs transition-shadow">
                  <span className="text-xs font-semibold text-brand-rose flex items-center gap-1.5 mb-2.5">
                    <Shirt className="w-3.5 h-3.5" /> Peças Sugeridas:
                  </span>
                  <ul className="space-y-1.5">
                    {result.outfitSuggestions.map((item, idx) => (
                      <li key={idx} className="text-xs text-brand-charcoal/80 flex items-start gap-1 leading-snug font-light">
                        <span className="text-brand-rose shrink-0 select-none">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* RECOMMENDED FABRICS */}
                <div className="bg-white rounded-2xl p-4 border-t-4 border-t-emerald-300 border-[#FAEDE2] shadow-3xs hover:shadow-2xs transition-shadow">
                  <span className="text-xs font-semibold text-teal-700 flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5" /> Tecidos Recomendados:
                  </span>
                  <ul className="space-y-1.5">
                    {result.recommendedFabrics.map((item, idx) => (
                      <li key={idx} className="text-xs text-brand-charcoal/80 flex items-start gap-1 leading-snug font-light">
                        <span className="text-teal-600 shrink-0 select-none">✓</span>
                        <span className="font-semibold text-teal-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-gray-500 font-light mt-2 leading-tight">
                    *Prefira sempre fibras naturais para deixar a pele respirar livremente.
                  </p>
                </div>

                {/* ACCESSORIES */}
                <div className="bg-white rounded-2xl p-4 border-t-4 border-t-amber-300 border-[#FAEDE2] shadow-3xs hover:shadow-2xs transition-shadow">
                  <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 mb-2.5">
                    <Footprints className="w-3.5 h-3.5" /> Acessórios Indicados:
                  </span>
                  {result.accessories.length > 0 ? (
                    <ul className="space-y-1.5">
                      {result.accessories.map((item, idx) => (
                        <li key={idx} className="text-xs text-brand-charcoal/80 flex items-start gap-1 leading-snug font-light">
                          <span className="text-amber-600 shrink-0 select-none">✦</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-gray-400 italic">
                      Nenhum acessório extravagante necessário neste clima. Pés soltos!
                    </div>
                  )}
                </div>

              </div>

              {/* COZY VOICE COUNSEL BUBBLE + EXTRA TIPS (Conselhos) */}
              <div className="space-y-3">
                {/* COZY VOICE COUNSEL BUBBLE */}
                <div className="bg-[#FFF9F2] rounded-2xl p-4 border border-[#FAEDE2]/60 relative shadow-2xs">
                  <div className="absolute -top-2 left-5 px-3 py-0.5 bg-brand-rose text-white text-[10px] font-semibold tracking-wider rounded-full uppercase flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 fill-white" /> Conselho do Coração
                  </div>
                  <div className="space-y-2 mt-1.5">
                    {result.cozyParagraphs.map((para, i) => (
                      <p key={i} className="text-brand-charcoal/90 text-sm font-light leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>

                {/* EXTRA ADVICES (optional output block) */}
                {result.extraTips && (
                  <div className="bg-brand-sage/40 rounded-2xl p-4 border border-brand-sage">
                    <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 mb-2">
                      <Info className="w-4 h-4 text-emerald-700" /> Dicas de Cuidados com o Bebê e Conselhos Extras:
                    </span>
                    <ul className="space-y-2">
                      {result.extraTips.map((tip, idx) => (
                        <li key={idx} className="text-xs text-emerald-950/90 leading-relaxed flex items-start gap-1.5 font-light">
                          <span className="text-[#10B981] shrink-0 mt-0.5">💡</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* SECURITY ALERTS BLOCK */}
              <div className="bg-[#FFF5F5] rounded-2xl p-4 border border-[#FFE3E3]">
                <span className="text-xs font-bold text-red-700 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-red-650" /> Alertas Importantes de Segurança:
                </span>
                <ul className="space-y-2">
                  {result.importantAlerts.map((alert, idx) => (
                    <li key={idx} className="text-xs text-red-900/90 leading-relaxed flex items-start gap-1.5 font-light">
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">⚠️</span>
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* VERIFIED COMFORT CHECKBOX BOX */}
              <div className="text-center text-xs text-brand-charcoal/60 italic bg-brand-beige border border-[#EEDBCD]/30 py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-brand-rose fill-white shrink-0" />
                <span>Sempre observe a nuca e o peito para avaliar de fato o conforto térmico de seu bebê.</span>
              </div>

              {/* BOTTOM CONTROL ACTIONS */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  id="btn-recalculate"
                  onClick={() => {
                    setStep(1);
                    setScreen('wizard');
                  }}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#E58793] to-[#D4717E] hover:from-[#EC9CA7] hover:to-[#E58793] text-white text-sm font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-rose/25"
                >
                  <RefreshCw className="w-4 h-4" /> Alterar Dados de Entrada
                </button>
                
                <button
                  type="button"
                  id="btn-reset"
                  onClick={() => {
                    setAnswers({
                      age: '0-3-meses',
                      state: 'acordado-casa',
                      period: 'dia',
                      temperature: 22,
                      hasWind: false,
                      sensitivity: 'normal',
                      location: 'interno',
                      wantsExtras: true,
                    });
                    setStep(1);
                    setScreen('welcome');
                  }}
                  className="px-5 py-3.5 bg-[#FAF6F0]/80 hover:bg-gray-150 text-brand-charcoal border border-[#EEDBCD]/60 text-sm font-semibold rounded-xl cursor-pointer transition-all shadow-3xs"
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
        <p>© 2026 Como Vestir o Bebê</p>
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
              className="fixed inset-0 bg-brand-charcoal z-40 cursor-pointer"
            />

            {/* Pastel Drawer Panel Custom Slide */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[340px] bg-[#FAF6F0] z-50 shadow-2xl flex flex-col justify-between rounded-r-3xl border-r border-[#FAEDE2]"
            >
              {/* Drawer Content */}
              <div className="p-6 flex-1 flex flex-col overflow-y-auto">
                {/* Header of Drawer */}
                <div className="flex justify-between items-center pb-5 border-b border-[#FAEDE2] mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-brand-rose/20 shrink-0">
                      <img 
                        src={menuClothesLogo} 
                        alt="Logo Como Vestir o Bebê" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-sm text-brand-charcoal">BebêClima 💛</h4>
                      <span className="text-[10px] text-gray-400 font-light block">Como Vestir o Bebê PWA</span>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 hover:bg-brand-pink/20 text-brand-rose rounded-full transition-all cursor-pointer"
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
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl text-left font-display font-medium text-sm text-[#5C4D4D] hover:bg-brand-pink/25 hover:text-brand-rose transition-all group cursor-pointer"
                  >
                    <div className="p-1.5 bg-white border border-[#EEDBCD]/40 rounded-xl group-hover:bg-brand-rose group-hover:text-white transition-all text-[#8C7A7A]">
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
                      className="w-full flex items-center gap-3.5 p-3 rounded-2xl text-left font-display font-medium text-sm text-[#5C4D4D] hover:bg-brand-pink/25 hover:text-brand-rose transition-all group cursor-pointer"
                    >
                      <div className="p-1.5 bg-white border border-[#EEDBCD]/40 rounded-xl group-hover:bg-brand-rose group-hover:text-white transition-all text-[#8C7A7A]">
                        <Download className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="block">Adicionar à Tela Inicial</span>
                        <span className="text-[10px] font-light text-brand-rose/80 block">Instalação aplicativo rápida</span>
                      </div>
                    </button>
                  )}

                  {/* WhatsApp Support */}
                  <a
                    href="https://wa.me/message/R2T4NMNY46OEL1"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl text-left font-display font-medium text-sm text-[#5C4D4D] hover:bg-emerald-50 hover:text-emerald-800 transition-all group cursor-pointer"
                  >
                    <div className="p-1.5 bg-white border border-[#EEDBCD]/40 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all text-[#8C7A7A]">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span>Suporte ou sugestões</span>
                      <span className="text-[10px] font-light text-emerald-600 block">Fale Conosco pelo WhatsApp</span>
                    </div>
                  </a>

                  {/* WhatsApp Offers Channel */}
                  <a
                    href="https://chat.whatsapp.com/IvwQos4ntsGEfgLZzZdayx?mode=gi_t"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl text-left font-display font-medium text-sm text-[#5C4D4D] hover:bg-amber-50 hover:text-amber-850 transition-all group cursor-pointer"
                  >
                    <div className="p-1.5 bg-white border border-[#EEDBCD]/40 rounded-xl group-hover:bg-amber-400 group-hover:text-white transition-all text-[#8C7A7A]">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <span>Grupo de Ofertas</span>
                      <span className="text-[10px] font-light text-amber-700 block">Dicas e promoções especiais</span>
                    </div>
                  </a>

                  {/* About the Application Item */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAboutOpen(true);
                    }}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl text-left font-display font-medium text-sm text-[#5C4D4D] hover:bg-blue-50 hover:text-blue-800 transition-all group cursor-pointer"
                  >
                    <div className="p-1.5 bg-white border border-[#EEDBCD]/40 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all text-[#8C7A7A]">
                      <Info className="w-4 h-4" />
                    </div>
                    <span>Sobre o App</span>
                  </button>
                </div>

                {/* Lovely Pastel App Installer Mini Banner inside Drawer */}
                {isInstallable && (
                  <div className="mt-auto bg-brand-pink/30 p-4 rounded-2xl border border-brand-rose/25 text-center shadow-3xs">
                    <p className="text-[11.5px] text-[#8C5555] font-light leading-relaxed mb-3">
                      Instale o app na sua tela inicial para acessar mais rápido no dia a dia 💛
                    </p>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleInstallApp();
                      }}
                      className="w-full py-2.5 bg-brand-rose text-white text-xs font-semibold rounded-xl hover:bg-[#D4717E] transition-colors cursor-pointer"
                    >
                      Instalar Agora
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer Details */}
              <div className="p-5 border-t border-[#FAEDE2] bg-[#FAF3EA] text-center rounded-br-3xl">
                <span className="text-[10px] text-gray-400 block uppercase tracking-widest font-mono">BebêClima v3.2</span>
                <span className="text-[9.5px] text-gray-400 font-light block leading-relaxed mt-1">Carrega atualizações em tempo real</span>
              </div>
            </motion.div>
          </React.Fragment>
        )}

        {isAboutOpen && (
          <React.Fragment key="about-modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAboutOpen(false)}
              className="fixed inset-0 bg-brand-charcoal z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-3xl p-6 shadow-2xl z-55 border border-[#FAEDE2] flex flex-col gap-4 text-center"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg text-brand-charcoal">Sobre o BebêClima</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                O <strong>BebêClima / Como Vestir o Bebê</strong> é um aplicativo progressivo (PWA) de utilidade prática criado para de forma descomplicada apoiar cuidadores a escolherem as camadas perfeitas de vestimenta para os pequenos.
              </p>
              <p className="text-[11.5px] text-gray-500 font-light leading-relaxed bg-[#FAF6F0] p-3 rounded-2xl border border-[#FAEDE2]">
                Utilizamos algoritmos térmicos baseados em consensos de pediatria e neonatologia para guiar o sono seguro, a transpiração livre e minimizar riscos de superaquecimento.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setIsAboutOpen(false)}
                  className="w-full py-2.5 bg-brand-rose hover:bg-[#D4717E] text-white text-sm font-medium rounded-xl cursor-pointer transition-colors"
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
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPwaInstructionOpen(false)}
              className="fixed inset-0 bg-brand-charcoal z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-3xl p-6 shadow-2xl z-55 border border-[#FAEDE2] flex flex-col gap-4 focus:outline-none"
            >
              <div className="w-12 h-12 bg-brand-pink text-brand-rose rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-center text-lg text-brand-charcoal">Instalar na Tela Inicial</h3>
              
              <div className="space-y-4 py-1 text-xs text-gray-600 font-light">
                <p className="text-center text-xs text-gray-500 leading-relaxed">
                  Acesse com apenas um toque no seu celular! Funciona em tela cheia e offline de modo prático.
                </p>

                {/* iPhone / Safari specific manual */}
                <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#FAEDE2] space-y-2">
                  <span className="font-display font-semibold text-brand-rose text-xs block uppercase tracking-wide">No iPhone (iOS - Safari)</span>
                  <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed">
                    <li>Toque no botão de <strong>Compartilhar</strong> <Share2 className="w-3.5 h-3.5 inline inline-block text-brand-rose" /> no Safari (setinha no rodapé).</li>
                    <li>Role o menu de opções para baixo.</li>
                    <li>Clique em <strong>Adicionar à Tela de Início</strong>.</li>
                  </ol>
                </div>

                {/* Android / Chrome specific manual */}
                <div className="bg-[#EAF5EC] p-4 rounded-2xl border border-emerald-100 space-y-2">
                  <span className="font-display font-semibold text-emerald-800 text-xs block uppercase tracking-wide">No Android (Chrome)</span>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-emerald-950 leading-relaxed">
                    <li>Toque no botão de <strong>3 pontinhos</strong> do navegador.</li>
                    <li>Selecione <strong>Adicionar à Tela Inicial</strong> ou <strong>Instalar Aplicativo</strong>.</li>
                  </ol>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setIsPwaInstructionOpen(false)}
                  className="w-full py-2.5 bg-brand-rose hover:bg-[#D4717E] text-white text-sm font-medium rounded-xl cursor-pointer transition-colors text-center"
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
