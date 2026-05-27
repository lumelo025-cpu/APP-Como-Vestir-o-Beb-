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
  Footprints
} from 'lucide-react';
import { QuestionnaireAnswers, RecommendationResult, BabyAge, BabyState, PeriodOfDay, ThermalSensitivity, EnvironmentLocation } from './types.ts';
import { calculateClothing } from './babyLogic.ts';

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
  'segunda-pele-termica': {
    name: 'Segunda pele térmica respirável',
    desc: 'Base térmica respirável para reter calor em rajadas geladas.',
    url: 'https://site.maecompleta.com/wp-content/uploads/2026/05/Captura-de-tela-2026-05-27-120548.png',
    heatingLevel: 'Alto'
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
    state: 'acordado-casa',
    period: 'dia',
    temperature: 22,
    hasWind: false,
    sensitivity: 'normal',
    location: 'interno',
    wantsExtras: true,
  });

  // Compiled result state
  const [result, setResult] = useState<RecommendationResult | null>(null);

  // Quick Check states
  const [quickTemp, setQuickTemp] = useState<number>(22);
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
    setAnswers({
      age: '0-3-meses',
      state: 'acordado-casa',
      period: pOfDay,
      temperature: temp,
      hasWind: false,
      sensitivity: 'normal',
      location: 'interno',
      wantsExtras: false,
    });
    setScreen('loading');
  };

  const handleNextStep = () => {
    if (step < 4) {
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
      const newTemp = Math.max(5, Math.min(41, prev.temperature + delta));
      const updatedAnswers = { ...prev, temperature: newTemp };
      // Recalculate result instantly
      const calculation = calculateClothing(updatedAnswers);
      setResult(calculation);
      return updatedAnswers;
    });
  };

  const toggleResultWind = () => {
    setAnswers(prev => {
      const updatedAnswers = { ...prev, hasWind: !prev.hasWind };
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
      case 'acordado-casa': return 'Acordado brincando em casa';
      case 'passeando': return 'Passeando lá fora';
      case 'sling-colo': return 'No sling ou colo quentinho';
      case 'ar-condicionado': return 'No ar-condicionado fresquinho';
    }
  };

  // Dynamic Thermometer colors based on Celsius degree
  const getTempColorStyle = (temp: number) => {
    if (temp < 16) return { bg: 'bg-blue-50 text-blue-700 border-blue-200', fill: 'bg-blue-500', pill: 'bg-blue-600 text-white' };
    if (temp >= 16 && temp < 20) return { bg: 'bg-teal-50 text-teal-700 border-teal-200', fill: 'bg-teal-400', pill: 'bg-teal-600 text-white' };
    if (temp >= 20 && temp < 24) return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', fill: 'bg-emerald-500', pill: 'bg-emerald-600 text-white' };
    if (temp >= 24 && temp < 28) return { bg: 'bg-amber-50 text-amber-800 border-amber-200', fill: 'bg-amber-500', pill: 'bg-amber-600 text-white' };
    if (temp >= 28 && temp < 32) return { bg: 'bg-orange-50 text-orange-800 border-orange-200', fill: 'bg-orange-500', pill: 'bg-orange-600 text-white' };
    return { bg: 'bg-rose-50 text-rose-800 border-rose-200', fill: 'bg-rose-500', pill: 'bg-rose-600 text-white' };
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] selection:bg-brand-pink/60 selection:text-brand-charcoal text-scale-subtle flex flex-col items-center justify-between pb-8 pt-4 px-4 sm:px-6">
      
      {/* Absolute Backdrop Circles for modern atmospheric touch */}
      <div className="absolute top-0 left-0 right-0 h-[400px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FCE8E6] opacity-60 blur-3xl"></div>
        <div className="absolute top-20 right-[-100px] w-80 h-80 rounded-full bg-[#F2EEFC] opacity-70 blur-3xl"></div>
        <div className="absolute -top-10 left-[35%] w-72 h-72 rounded-full bg-[#EAF0EC] opacity-50 blur-3xl"></div>
      </div>

      {/* Header Area */}
      <header className="w-full max-w-xl text-center mb-4 z-10 flex flex-col items-center">
        <motion.div 
          onClick={() => { setScreen('welcome'); setStep(1); }}
          className="cursor-pointer flex items-center justify-center gap-2 mb-1 group"
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-2 bg-gradient-to-tr from-brand-rose/20 to-brand-rose/30 text-brand-rose rounded-full shadow-xs">
            <Baby className="w-6 h-6 transition-transform group-hover:rotate-12" />
          </div>
          <span className="font-display font-medium text-lg text-brand-charcoal/80 tracking-tight">
            Como Vestir o Bebê
          </span>
        </motion.div>
        <div className="h-[1px] w-12 bg-brand-rose/30 mt-1"></div>
      </header>

      {/* Primary Card Viewport */}
      <main className="w-full max-w-xl bg-white rounded-3xl border border-[#FAEDE2] shadow-xl shadow-brand-charcoal/[0.02] z-10 overflow-hidden min-h-[500px] flex flex-col">
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
                {/* Visual Avatar Cover */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-[#FFF9F2] rounded-full scale-125 blur-sm"></div>
                  <div className="relative w-28 h-28 mx-auto bg-gradient-to-tr from-brand-pink to-[#F2EEFC] rounded-full flex items-center justify-center shadow-inner">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    >
                      <Shirt className="w-14 h-14 text-brand-rose" />
                    </motion.div>
                  </div>
                  <div className="absolute right-0 bottom-0 bg-white p-1.5 rounded-full shadow-md text-yellow-500">
                    <Sparkles className="w-4 h-4 fill-yellow-500" />
                  </div>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-brand-charcoal tracking-tight leading-tight mb-3">
                  Vestir seu bebê com carinho e sem dúvidas!
                </h2>

                <p className="text-gray-600 font-light text-sm sm:text-base max-w-sm leading-relaxed mb-6">
                  Esqueça a insegurança. Responda a algumas perguntas simples sobre o dia de hoje e receba recomendações inteligentes, seguras e personalizadas de tecidos e camadas.
                </p>

                {/* Aesthetic Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-6 pointer-events-none">
                  <span className="text-xs font-medium px-3 py-1 bg-brand-sage text-emerald-800 rounded-full">👶 Sem excesso de camadas</span>
                  <span className="text-xs font-medium px-3 py-1 bg-[#F2EEFC] text-purple-800 rounded-full">🌙 Sono seguro recomendado</span>
                  <span className="text-xs font-medium px-3 py-1 bg-brand-pink text-brand-rose rounded-full">🌡️ Inteligência térmica</span>
                </div>
              </div>

              <div className="w-full mt-4 space-y-6">
                <motion.button
                  id="btn-start"
                  onClick={startWizard}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-4 bg-brand-rose hover:bg-[#D4717E] text-white font-medium rounded-2xl shadow-lg shadow-brand-rose/25 transition-all outline-none cursor-pointer flex items-center justify-center gap-2 text-md sm:text-lg"
                >
                  Começar Calculadora <ChevronRight className="w-5 h-5" />
                </motion.button>

                {/* CHECAGEM RÁPIDA (QUICK CHECK) CONTAINER */}
                <div className="pt-5 border-t border-[#FAEDE2] text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-brand-rose animate-pulse" />
                    <h3 className="font-display font-semibold text-sm text-brand-charcoal uppercase tracking-wider">
                      Checagem Rápida: Quantos graus está agora? ⏱️
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 font-light mb-3">
                    Com pressa? Informe apenas a temperatura e período para ter uma recomendação instantânea direta.
                  </p>

                  <div className="bg-[#FFF9F2] rounded-2xl p-4 border border-[#FAEDE2] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Temperature Controls */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-brand-charcoal flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-brand-rose" /> Qual a temperatura?
                      </label>
                      <div className="flex items-center justify-between bg-white border border-[#EEDBCD]/50 rounded-xl p-1.5 max-w-[170px] shadow-2xs">
                        <motion.button
                          type="button"
                          id="btn-quick-dec"
                          onClick={() => setQuickTemp(prev => Math.max(5, prev - 1))}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-brand-charcoal cursor-pointer font-bold transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </motion.button>
                        <span className="font-display font-semibold text-sm text-brand-charcoal min-w-[32px] text-center">
                          {quickTemp}°C
                        </span>
                        <motion.button
                          type="button"
                          id="btn-quick-inc"
                          onClick={() => setQuickTemp(prev => Math.min(41, prev + 1))}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-brand-charcoal cursor-pointer font-bold transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Period Controls */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-brand-charcoal flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-600" /> Período do Dia:
                      </label>
                      <div className="grid grid-cols-2 gap-1 bg-white border border-[#EEDBCD]/50 rounded-xl p-1 shadow-2xs">
                        <button
                          type="button"
                          id="btn-quick-day"
                          onClick={() => setQuickPeriod('dia')}
                          className={`py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            quickPeriod === 'dia'
                              ? 'bg-[#FFF9F2] text-amber-700 shadow-3xs font-semibold border border-amber-200/50'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Dia ☀️
                        </button>
                        <button
                          type="button"
                          id="btn-quick-night"
                          onClick={() => setQuickPeriod('noite')}
                          className={`py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            quickPeriod === 'noite'
                              ? 'bg-[#F2EEFC] text-purple-800 shadow-3xs font-semibold border border-purple-200/50'
                              : 'text-gray-550 hover:text-gray-700'
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
                    className="w-full mt-3 py-3 bg-[#EAF0EC] border border-emerald-200 hover:bg-[#DCE7E1] text-emerald-800 font-medium text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Calcular Recomendação Rápida ⚡
                  </motion.button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-3 font-light">
                  Aviso: Nenhuma resposta é salva no servidor. Privacidade 100% garantida.
                </p>
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
                  <span className="font-display font-medium text-brand-rose">Passo {step} de 4</span>
                  <span className="font-light">
                    {step === 1 && 'Sobre o bebê'}
                    {step === 2 && 'Momento & Lugar'}
                    {step === 3 && 'O Clima atual'}
                    {step === 4 && 'Prevenção & Cuidado'}
                  </span>
                </div>
                {/* Custom animated progress bar */}
                <div className="w-full h-1.5 bg-[#FAF6F0] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-brand-rose" 
                    initial={{ width: '25%' }}
                    animate={{ width: `${step * 25}%` }}
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
                          Bebês muito novos regulam pior a temperatura corporal e requerem mais aconchego.
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
                              className={`w-full p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                                answers.age === item.key
                                  ? 'bg-brand-pink/30 border-brand-rose/60 ring-2 ring-brand-rose/10'
                                  : 'bg-white hover:bg-gray-50 border-[#EEDBCD]/50'
                              }`}
                            >
                              <div>
                                <span className="font-medium text-sm sm:text-base text-brand-charcoal block">{item.label}</span>
                                <span className="text-xs text-brand-charcoal/50 font-light mt-0.5 block">{item.desc}</span>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                answers.age === item.key 
                                  ? 'bg-brand-rose border-brand-rose text-white' 
                                  : 'border-[#CBD5E1]'
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
                              className={`p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 ${
                                answers.sensitivity === item.key
                                  ? 'bg-brand-pink/30 border-brand-rose/50 text-brand-rose font-medium'
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
                          O que o bebê está fazendo agora? 🛌
                        </label>
                        <p className="text-xs text-gray-500 font-light mb-3">
                          Dormir exige cuidado com cobertas soltas. Sling e colo dão calor de pele fantástico!
                        </p>
                        <div className="space-y-2.5">
                          {[
                            { key: 'dormindo', label: 'Dormindo', desc: 'Segurança absoluta do sono de bochecha' },
                            { key: 'acordado-casa', label: 'Acordado em casa', desc: 'Tempo livre para brincar e rolar' },
                            { key: 'passeando', label: 'Passeando', desc: 'Em carrinho de bebê ou caminhando livre' },
                            { key: 'sling-colo', label: 'No colo / Sling', desc: 'Colo humano aquece imensamente o corpíneo' },
                            { key: 'ar-condicionado', label: 'Em ambiente climatizado', desc: 'Ar-condicionado geladinho com vento contínuo' }
                          ].map((item) => (
                            <button
                              key={item.key}
                              id={`state-opt-${item.key}`}
                              onClick={() => setAnswers(prev => ({ ...prev, state: item.key as BabyState }))}
                              className={`w-full p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                                answers.state === item.key
                                  ? 'bg-[#F2EEFC]/45 border-purple-300 ring-2 ring-purple-100'
                                  : 'bg-white hover:bg-gray-50 border-[#EEDBCD]/50'
                              }`}
                            >
                              <div>
                                <span className="font-medium text-sm sm:text-base text-brand-charcoal block">{item.label}</span>
                                <span className="text-xs text-brand-charcoal/50 font-light mt-0.5 block">{item.desc}</span>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                answers.state === item.key 
                                  ? 'bg-purple-600 border-purple-600 text-white' 
                                  : 'border-[#CBD5E1]'
                              }`}>
                                {answers.state === item.key && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="font-display text-sm font-medium text-brand-charcoal block mb-2">
                            Período do Dia:
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
                                className={`p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer text-xs font-medium ${
                                  answers.period === item.key
                                    ? 'bg-[#FFF9F2] border-amber-300 text-amber-700 font-semibold shadow-xs'
                                    : `bg-white border-[#EEDBCD]/50 text-gray-600 ${item.style}`
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="font-display text-sm font-medium text-brand-charcoal block mb-2">
                            Onde o bebê ficará:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { key: 'interno', label: 'Interno 🏡' },
                              { key: 'externo', label: 'Externo 🌳' }
                            ].map((item) => (
                              <button
                                key={item.key}
                                type="button"
                                id={`loc-opt-${item.key}`}
                                onClick={() => setAnswers(prev => ({ ...prev, location: item.key as EnvironmentLocation }))}
                                className={`p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer text-xs font-medium ${
                                  answers.location === item.key
                                    ? 'bg-brand-sage border-emerald-300 text-emerald-800 font-semibold shadow-xs'
                                    : 'bg-white border-[#EEDBCD]/50 text-gray-600 hover:border-emerald-200'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: WEATHER CONDITION */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <label className="font-display text-md sm:text-lg font-medium text-brand-charcoal block mb-1">
                          Qual é a temperatura do ambiente? 🌡️
                        </label>
                        <p className="text-xs text-gray-500 font-light mb-4">
                          Arraste o controle ou ajuste de forma fina no - e + até bater com o clima real.
                        </p>

                        {/* Interactive Thermometer Status Widget */}
                        <div className={`mx-auto rounded-3xl p-5 border text-center transition-all max-w-sm ${getTempColorStyle(answers.temperature).bg}`}>
                          <div className="text-xs font-semibold tracking-wider uppercase opacity-85">Temperatura selecionada</div>
                          <div className="flex items-center justify-center gap-4 mt-2 mb-1">
                            <motion.button
                              id="btn-temp-dec"
                              type="button"
                              onClick={() => setAnswers(prev => ({ ...prev, temperature: Math.max(5, prev.temperature - 1) }))}
                              whileTap={{ scale: 0.9 }}
                              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-charcoal shadow-xs hover:shadow-md cursor-pointer border border-[#EEDBCD]/40"
                              title="Diminuir 1 grau"
                            >
                              <Minus className="w-5 h-5 stroke-[2.5]" />
                            </motion.button>
                            
                            <span className="text-4xl sm:text-5xl font-display font-medium tracking-tight">
                              {answers.temperature}<span className="text-2xl font-light">°C</span>
                            </span>

                            <motion.button
                              id="btn-temp-inc"
                              type="button"
                              onClick={() => setAnswers(prev => ({ ...prev, temperature: Math.min(40, prev.temperature + 1) }))}
                              whileTap={{ scale: 0.9 }}
                              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-charcoal shadow-xs hover:shadow-md cursor-pointer border border-[#EEDBCD]/40"
                              title="Aumentar 1 grau"
                            >
                              <Plus className="w-5 h-5 stroke-[2.5]" />
                            </motion.button>
                          </div>
                          
                          <p className="text-xs font-medium italic mt-2 opacity-90 block">
                            {answers.temperature < 15 && '🥶 Ar congelante! Muitas camadas e proteção especial.'}
                            {answers.temperature >= 15 && answers.temperature < 19 && '🍃 Clima fresquinho de outono ou ar-condicionado moderado.'}
                            {answers.temperature >= 19 && answers.temperature < 23 && '😊 Temperatura deliciosa de brisa agradável.'}
                            {answers.temperature >= 23 && answers.temperature < 27 && '⛅ Temperatura morna de primavera aconchegante.'}
                            {answers.temperature >= 27 && answers.temperature < 32 && '🌞 Dia quente de verão! Cuidado com sobreposições.'}
                            {answers.temperature >= 32 && '🔥 Calor intenso! Tecido único e super arejado.'}
                          </p>
                        </div>
                      </div>

                      {/* Cool Slide lever */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500 font-light px-1">
                          <span>5°C (Frio Extremo)</span>
                          <span>22°C (Agradável)</span>
                          <span>40°C (Calor Extremo)</span>
                        </div>
                        <div className="relative mt-2">
                          <input
                            id="input-temp-slider"
                            type="range"
                            min="5"
                            max="40"
                            value={answers.temperature}
                            onChange={(e) => setAnswers(prev => ({ ...prev, temperature: parseInt(e.target.value) }))}
                            className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-rose focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Wind chill question */}
                      <div className="pt-2">
                        <label className="font-display text-sm font-medium text-brand-charcoal block mb-2">
                          Tem vento ou sensação mais fria do que marca o termômetro? 🍃
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { value: true, label: 'Sim, venta ou tem correntes', desc: 'Indica maior proteção externa', icon: Wind },
                            { value: false, label: 'Não, ar está calmo', desc: 'Temperatura pura e constante', icon: Sun }
                          ].map((item) => {
                            const IconCmp = item.icon;
                            return (
                              <button
                                key={item.value.toString()}
                                type="button"
                                id={`wind-opt-${item.value}`}
                                onClick={() => setAnswers(prev => ({ ...prev, hasWind: item.value }))}
                                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                                  answers.hasWind === item.value
                                    ? 'bg-brand-sage/40 border-emerald-300 ring-2 ring-emerald-50'
                                    : 'bg-white hover:bg-gray-50 border-[#EEDBCD]/50'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <IconCmp className={`w-4 h-4 ${answers.hasWind === item.value ? 'text-emerald-700' : 'text-gray-400'}`} />
                                  <span className={`text-sm font-medium ${answers.hasWind === item.value ? 'text-emerald-800' : 'text-gray-700'}`}>{item.label}</span>
                                </div>
                                <span className="text-xs text-brand-charcoal/50 font-light leading-snug">{item.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: EXTRAS & VERIFY */}
                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="text-center py-2">
                        <div className="w-16 h-16 bg-brand-pink text-brand-rose rounded-full flex items-center justify-center mx-auto mb-3">
                          <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="font-display text-lg font-medium text-brand-charcoal">Prevenção e Dicas Úteis 🧼</h3>
                        <p className="text-xs text-gray-500 font-light mt-1 max-w-sm mx-auto">
                          Deseja que incluamos conselhos adicionais sobre lavagem de roupas de bebê, prevenção de dermatite de etiqueta e choque térmico em banhos frios ou quentes?
                        </p>
                      </div>

                      <div className="space-y-3 max-w-md mx-auto">
                        <button
                          id="extras-opt-yes"
                          onClick={() => setAnswers(prev => ({ ...prev, wantsExtras: true }))}
                          className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-4 ${
                            answers.wantsExtras === true
                              ? 'bg-brand-pink/30 border-brand-rose/60 ring-2 ring-brand-rose/10 shadow-xs'
                              : 'bg-white hover:bg-gray-50 border-[#EEDBCD]/50'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center p-0.5 text-xs ${answers.wantsExtras === true ? 'bg-brand-rose border-brand-rose text-white' : 'border-[#CBD5E1]'}`}>
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                          <div>
                            <span className="font-medium text-sm sm:text-base text-brand-charcoal block">Quero recomendações extras</span>
                            <span className="text-xs text-brand-charcoal/50 font-light block">Bônus: Lavagem de tecidos sensíveis, precauções no banho e etiquetas.</span>
                          </div>
                        </button>

                        <button
                          id="extras-opt-no"
                          onClick={() => setAnswers(prev => ({ ...prev, wantsExtras: false }))}
                          className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-4 ${
                            answers.wantsExtras === false
                              ? 'bg-brand-sage text-emerald-800 border-emerald-300 ring-2 ring-emerald-50'
                              : 'bg-white hover:bg-gray-50 border-[#EEDBCD]/50'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center p-0.5 text-xs ${answers.wantsExtras === false ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-[#CBD5E1]'}`}>
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                          <div>
                            <span className="font-medium text-sm sm:text-base text-brand-charcoal block">Não precisa, apenas as roupas</span>
                            <span className="text-xs text-brand-charcoal/50 font-light block">Resultado focado puramente nas camadas, acessórios e tipos de malha.</span>
                          </div>
                        </button>
                      </div>

                      {/* Recapitulation Details Table */}
                      <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#EEDBCD]/40">
                        <span className="text-xs font-semibold text-brand-charcoal/60 uppercase block mb-2 tracking-wide text-center">Resumo de Seleções</span>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                          <div className="text-gray-500">Idade do bebê:</div>
                          <div className="font-medium text-right text-brand-charcoal">{getAgeFriendlyName(answers.age)}</div>

                          <div className="text-gray-500">O que ele está fazendo:</div>
                          <div className="font-medium text-right text-brand-charcoal">{getStateFriendlyName(answers.state)}</div>

                          <div className="text-gray-500">Sensibilidade térmica:</div>
                          <div className="font-medium text-right text-brand-charcoal">Sente {answers.sensitivity === 'calor' ? 'mais calor 🥵' : answers.sensitivity === 'frio' ? 'mais frio 🥶' : 'temperatura normal 😊'}</div>

                          <div className="text-gray-500">Clima selecionado:</div>
                          <div className="font-medium text-right text-brand-charcoal">{answers.temperature}°C ({answers.hasWind ? 'Com Vento' : 'Ar calmo'})</div>
                        </div>
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
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-brand-charcoal border border-gray-200 text-sm font-medium rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </button>

                <button
                  type="button"
                  id="btn-next"
                  onClick={handleNextStep}
                  className="flex-1 py-3 bg-brand-rose hover:bg-[#D4717E] text-white text-sm font-medium rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-rose/10"
                >
                  {step === 4 ? 'Calcular Roupa Perfeita ⚡' : 'Continuar'} <ChevronRight className="w-4 h-4" />
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
                  <div className={`p-2.5 rounded-full ${getTempColorStyle(answers.temperature).pill}`}>
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
                    {answers.temperature}°C
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
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${answers.hasWind ? 'bg-[#EAF0EC] text-emerald-800' : 'text-gray-400 hover:text-gray-600'}`}
                    title={answers.hasWind ? "Remover efeito de vento" : "Simular vento/sensação fria"}
                  >
                    <Wind className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* COGNITIVE VISUAL THERMOMETER */}
              <div className="bg-white rounded-2xl p-4 border border-[#FAEDE2] flex flex-col items-center shadow-3xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-brand-rose" /> Termômetro Visual: Conforto do bebê
                </span>
                <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
                  <div className={`py-2 px-3 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                    answers.temperature < 19 
                      ? 'bg-blue-550 bg-sky-100 border border-sky-300 text-sky-800 shadow-xs font-semibold' 
                      : 'bg-[#FAF6F0]/60 border border-transparent text-gray-450 opacity-60 font-light'
                  }`}>
                    <span className="text-xl">🥶</span>
                    <span className="text-[11px] mt-0.5">Frio</span>
                  </div>
                  <div className={`py-2 px-3 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                    answers.temperature >= 19 && answers.temperature < 27
                      ? 'bg-emerald-50 border border-emerald-250 text-emerald-850 shadow-xs font-semibold' 
                      : 'bg-[#FAF6F0]/60 border border-transparent text-gray-455 opacity-60 font-light'
                  }`}>
                    <span className="text-xl">😊</span>
                    <span className="text-[11px] mt-0.5">Confortável</span>
                  </div>
                  <div className={`py-2 px-3 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                    answers.temperature >= 27
                      ? 'bg-rose-50 border border-rose-250 text-rose-850 shadow-xs font-semibold' 
                      : 'bg-[#FAF6F0]/60 border border-transparent text-gray-455 opacity-60 font-light'
                  }`}>
                    <span className="text-xl">🥵</span>
                    <span className="text-[11px] mt-0.5">Muito Quente</span>
                  </div>
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
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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

              {/* CORE METRIC CARD: LAYER COUNT */}
              <div className="bg-brand-lavender/40 border border-[#DED4FA]/40 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 text-xs text-brand-charcoal/70 uppercase font-semibold">
                    <Layers className="w-4 h-4 text-purple-600" /> RECOMENDAÇÃO DE CAMADAS
                  </div>
                  <h4 className="font-display font-bold text-2xl text-purple-950 mb-1">
                    {result.layerCount} {result.layerCount === 1 ? 'Camada única' : result.layerCount === 2 ? 'Camadas leves' : 'Camadas aconchegantes'}
                  </h4>
                  <p className="text-xs text-purple-900/80 font-light">
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
                      className={`h-5.5 rounded-md flex items-center justify-between px-2.5 text-[10px] font-bold tracking-tight text-white ${
                        i === 0 ? 'bg-indigo-600' : i === 1 ? 'bg-purple-500' : 'bg-pink-400'
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

              {/* THREE COLUMNS GRID: OUTFITS, FABRICS, ACCESSORIES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* OUTFIT RECOMMENDATION */}
                <div className="bg-white rounded-2xl p-3.5 border border-[#FAEDE2] hover:shadow-2xs transition-shadow">
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
                <div className="bg-white rounded-2xl p-3.5 border border-[#FAEDE2] hover:shadow-2xs transition-shadow">
                  <span className="text-xs font-semibold text-teal-700 flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5" /> Tecidos Recomendados:
                  </span>
                  <ul className="space-y-1.5">
                    {result.recommendedFabrics.map((item, idx) => (
                      <li key={idx} className="text-xs text-brand-charcoal/80 flex items-start gap-1 leading-snug font-light">
                        <span className="text-teal-600 shrink-0 select-none">✓</span>
                        <span className="font-medium text-teal-900">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-gray-500 font-light mt-2 leading-tight">
                    *Prefira sempre fibras naturais para deixar a pele do bebê respirar.
                  </p>
                </div>

                {/* ACCESSORIES */}
                <div className="bg-white rounded-2xl p-3.5 border border-[#FAEDE2] hover:shadow-2xs transition-shadow">
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

              {/* EXTRA ADVICES (optional output block) */}
              {result.extraTips && (
                <div className="bg-brand-sage/40 rounded-2xl p-4 border border-brand-sage">
                  <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 mb-2">
                    <Info className="w-4 h-4 text-emerald-700" /> Dicas de Cuidados com o Bebê e Conselhos Extras:
                  </span>
                  <ul className="space-y-2">
                    {result.extraTips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-emerald-950/90 leading-relaxed flex items-start gap-1.5 font-light">
                        <span className="text-emerald-600 shrink-0 mt-0.5">💡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                  className="flex-1 py-3.5 bg-brand-rose hover:bg-[#D4717E] text-white text-sm font-medium rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-rose/15"
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
                  className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-brand-charcoal text-sm font-medium rounded-xl cursor-pointer transition-colors"
                >
                  Reiniciar Tudo
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer Details */}
      <footer className="w-full max-w-xl text-center mt-5 text-[11px] text-[#A69799] font-light space-y-1 select-none z-10">
        <p>Criado com amor para simplificar o cuidado com seu bebê. 🧸</p>
        <p>© 2026 Como Vestir o Bebê • Prático, higiênico e offline • Lógica inteligente baseada em guias de neonatologia.</p>
      </footer>

    </div>
  );
}
