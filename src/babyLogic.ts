/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuestionnaireAnswers, RecommendationResult } from './types.ts';

/**
 * Interprets the questionnaire input and generates a cozy, highly personalized
 * recommendation based on the Intelligent Layers System and perceived ambient feeling.
 */
export function calculateClothing(answers: QuestionnaireAnswers): RecommendationResult {
  const {
    age,
    state,
    period,
    sensitivity,
    condition,
    feeling,
    temperature,
    wantsExtras
  } = answers;

  // 1. Establish Base Temperature from Ambient Feeling
  let baseTemp = 23; // default 'agradavel'
  
  if (feeling === 'muito-quente') {
    baseTemp = 33;
  } else if (feeling === 'quente') {
    baseTemp = 28;
  } else if (feeling === 'agradavel') {
    baseTemp = 23;
  } else if (feeling === 'fresquinho') {
    baseTemp = 19;
  } else if (feeling === 'frio') {
    baseTemp = 14;
  } else if (feeling === 'muito-frio') {
    baseTemp = 9;
  }

  // If a temperature in Celsius is explicitly complementarily provided,
  // we can anchor slightly to it or merge to create a highly realistic perception.
  if (temperature !== null && !isNaN(temperature)) {
    // If the difference is big, respect the numerical value but lean towards feeling
    baseTemp = (baseTemp * 0.6) + (temperature * 0.4);
  }

  // 2. Apply Logical Context Modifiers to get "Perceived Temperature"
  let perceivedTemp = baseTemp;

  // Modifiers based on: "O ambiente está" (condition)
  // fechar can warm up. draft can cool down.
  if (condition === 'fechado') {
    perceivedTemp += 1.5; // closed rooms feel warmer
  } else if (condition === 'ventilador') {
    perceivedTemp -= 1.5; // fan cools down
  } else if (condition === 'ar-condicionado') {
    perceivedTemp -= 3.0; // air-conditioned is significantly cooler
  } else if (condition === 'externo') {
    perceivedTemp -= 1.0; // outdoors generally feels a bit more drafty
  } else if (condition === 'vento-frio') {
    perceivedTemp -= 4.0; // cold wind has a strong cooling effect!
  } else if (condition === 'ventilado') {
    perceivedTemp -= 0.5; // lightly ventilated
  }

  // Modifiers based on: "O bebê estará" (state)
  if (state === 'dormindo') {
    perceivedTemp -= 1.0; // body slows down and feels cooler, or needs sleep protection
  } else if (state === 'acordado') {
    perceivedTemp += 0.5; // active play heats up slightly
  } else if (state === 'colo-sling') {
    perceivedTemp += 4.0; // body heat from parent warm up immensely! Reduces layers.
  } else if (state === 'passeando') {
    perceivedTemp -= 1.0; // strolling outside exposure
  } else if (state === 'carrinho') {
    perceivedTemp += 1.0; // canopy/blankets barrier inside stroller creates micro-climate
  }

  // Modifiers based on: "Bebê costuma sentir" (sensitivity)
  if (sensitivity === 'frio') {
    perceivedTemp -= 1.5;
  } else if (sensitivity === 'calor') {
    perceivedTemp += 1.5;
  }

  // Modifiers based on: "Qual a idade do bebê" (age)
  if (age === 'recem-nascido') {
    perceivedTemp -= 1.5; // newborns regulate thermal poorly, require extra cozy layer
  }

  // 3. Determine Severity, Category labels based on Perceived Temperature
  let tempCategory = '';
  let tempDescription = '';
  let severity: RecommendationResult['severity'] = 'mild';

  if (perceivedTemp < 12) {
    tempCategory = '❄️ Frio Intenso';
    tempDescription = 'Sensação térmica muito fria! Proteja o bebê com camadas de aconchego e isole extremidades.';
    severity = 'extreme-cold';
  } else if (perceivedTemp >= 12 && perceivedTemp < 16) {
    tempCategory = '🥶 Clima Frio';
    tempDescription = 'O ambiente está gelado! Tecidos protetores nas camadas intermediária e externa farão toda a diferença.';
    severity = 'cold';
  } else if (perceivedTemp >= 16 && perceivedTemp < 19) {
    tempCategory = '🍃 Frio Moderado';
    tempDescription = 'A brisa está mais fresca, pedindo camadas suaves e confortáveis.';
    severity = 'cold';
  } else if (perceivedTemp >= 19 && perceivedTemp < 22) {
    tempCategory = '🌤️ Clima Fresco';
    tempDescription = 'Temperatura gostosa mas que pede casaco protetor para passeios.';
    severity = 'mild';
  } else if (perceivedTemp >= 22 && perceivedTemp < 25) {
    tempCategory = '😊 Levemente Fresco';
    tempDescription = 'Clima ideal, muito confortável. Opte por peças macias de algodão duplo.';
    severity = 'mild';
  } else if (perceivedTemp >= 25 && perceivedTemp < 28) {
    tempCategory = '☀️ Clima Agradável';
    tempDescription = 'Dia delicioso e ameno. Vista com peças finas e respiráveis de uma a duas camadas.';
    severity = 'mild';
  } else if (perceivedTemp >= 28 && perceivedTemp < 31) {
    tempCategory = '🔥 Clima Quente';
    tempDescription = 'Calor no ambiente! Use pouquíssimas peças e foque em tecidos de toque refrescante.';
    severity = 'warm';
  } else {
    tempCategory = '🌡️ Clima Muito Quente';
    tempDescription = 'Calor forte. Priorize apenas um body leve de algodão bem vazado.';
    severity = 'hot';
  }

  // Outfit formulation variables
  const outfitSuggestions: string[] = [];
  const recommendedFabrics: string[] = [];
  const accessories: string[] = [];
  const visualItems: string[] = [];
  let layerCount = 2;
  let layersDescription = '';

  const isNight = period === 'noite';
  const isSleeping = state === 'dormindo';

  // ==========================================
  // CLOTHING COMPOSITION BASED ON PERCEIVED ZONE
  // ==========================================
  
  if (perceivedTemp >= 31) {
    // 🌡️ MUCH WARM / HOT
    layerCount = 1;
    layersDescription = 'Camada única respirável e leve de algodão fino.';
    
    if (isSleeping) {
      outfitSuggestions.push('Look ideal: apenas body de manga curta leve.');
      outfitSuggestions.push('Dica: em sonecas muito abafadas, o bebê pode dormir com segurança apenas de fralda.');
    } else {
      outfitSuggestions.push('Body de manga curta fino e respirável');
    }
    
    recommendedFabrics.push('Algodão leve', 'Malha de algodão respirável');
    accessories.push('Pezinhos descalços para regulação térmica natural');
    visualItems.push('body-manga-curta');

  } else if (perceivedTemp >= 28 && perceivedTemp < 31) {
    // ☀️ WARMY / SUNNY
    layerCount = 1;
    layersDescription = 'Camada única de algodão super leve e respirável.';
    
    outfitSuggestions.push('Body de manga curta leve e confortável');
    if (condition === 'ar-condicionado' || condition === 'vento-frio') {
      outfitSuggestions.push('Adicione uma calça leve de algodão para proteger de brisas diretas');
      visualItems.push('calca');
    }
    if (age === 'recem-nascido') {
      outfitSuggestions.push('Para recém-nascidos, prefira body de manga longa para proteger os bracinhos.');
    }

    recommendedFabrics.push('Algodão 100% puro', 'Fibra de bambu fresca');
    accessories.push('Pezinhos livres ou apenas fralda nas sonecas mais quentes do dia');
    visualItems.push('body-manga-curta');

  } else if (perceivedTemp >= 25 && perceivedTemp < 28) {
    // 😊 AGREEABLE / NICE
    layerCount = 2;
    layersDescription = 'Camadas básicas: body e calça leve para mantê-lo confortável.';
    
    if (isSleeping) {
      outfitSuggestions.push('Opção principal: body de manga curta + calça de algodão macio');
      outfitSuggestions.push('Dica de sono seguro: saco de dormir leve para substituir cobertores soltos');
      visualItems.push('body-manga-curta', 'saco-dormir-leve');
    } else {
      outfitSuggestions.push('Body de manga curta ou body de manga longa bem fino');
      outfitSuggestions.push('Calça leve (mijão) para liberdade de movimento');
      visualItems.push('body-manga-curta', 'calca');
    }

    recommendedFabrics.push('Algodão suedine leve', 'Malha canelada de toque macio');
    accessories.push('Meias leves opcionais caso sinta os pezinhos gelados');

  } else if (perceivedTemp >= 22 && perceivedTemp < 25) {
    // 🌤️ LIGHTLY FRESH
    layerCount = 2;
    layersDescription = 'Duas camadas leves de algodão para manter o corpinho e os membros protegidos.';
    
    if (isSleeping) {
      outfitSuggestions.push('Look principal: body de manga longa + calça de algodão respirável');
      outfitSuggestions.push('Opção para a noite: saco de dormir leve por cima do body de manga longa');
      visualItems.push('body-manga-longa', 'saco-dormir-soft');
    } else {
      outfitSuggestions.push('Body de manga longa bem macio');
      outfitSuggestions.push('Calça (mijão) de algodão bem flexível');
      outfitSuggestions.push('Macacão de algodão leve por cima se a temperatura começar a cair');
      visualItems.push('body-manga-longa', 'calca', 'meias');
    }

    recommendedFabrics.push('Algodão suedine clássico', 'Soft de espessura bem fina');
    accessories.push('Meias de algodão macias');

  } else if (perceivedTemp >= 19 && perceivedTemp < 22) {
    // 🌥️ FRESH
    layerCount = 2;
    layersDescription = 'Proteção leve e aconchegante com body sob macacão de algodão mais encorpado.';
    
    if (isSleeping) {
      outfitSuggestions.push('Look à noite: body de manga longa + calça + saco de dormir soft');
      visualItems.push('body-manga-longa', 'calca', 'saco-dormir-soft');
    } else {
      outfitSuggestions.push('Body de manga longa + calça de algodão de base');
      outfitSuggestions.push('Macacão de algodão mais encorpado por cima');
      visualItems.push('body-manga-longa', 'calca', 'macacao-algodao', 'meias');
    }

    recommendedFabrics.push('Algodão interlock macio', 'Fleece leve de toque aveludado');
    accessories.push('Meias confortáveis');

  } else if (perceivedTemp >= 16 && perceivedTemp < 19) {
    // 🍃 MODERATE COLD
    layerCount = 3;
    layersDescription = 'Camada base protegida sob um macacão de soft ou plush aconchegante.';
    
    if (isSleeping) {
      outfitSuggestions.push('Opção confortável: body de manga longa + calça canelada + saco de dormir de soft por cima');
      visualItems.push('body-manga-longa', 'calca', 'macacao-soft', 'meias');
    } else {
      outfitSuggestions.push('Body de manga longa confortável');
      outfitSuggestions.push('Calça de algodão (mijão) por baixo');
      outfitSuggestions.push('Macacão de soft peluciado para reter o calor no corpinho');
      visualItems.push('body-manga-longa', 'calca', 'macacao-soft', 'meias');
    }

    recommendedFabrics.push('Algodão interlock denso', 'Soft escovado térmico');
    accessories.push('Meias de algodão bem macias');

  } else if (perceivedTemp >= 12 && perceivedTemp < 16) {
    // 🥶 COLD
    layerCount = 3;
    layersDescription = 'Camada quentinha com body e calça por baixo de um macacão de plush aconchegante.';
    
    if (isSleeping) {
      outfitSuggestions.push('Visual de sono seguro: body de manga longa + calça + saco de dormir de plush quentinho');
      visualItems.push('body-manga-longa', 'calca', 'saco-dormir-plush');
    } else {
      outfitSuggestions.push('Body de manga longa quentinho e macio');
      outfitSuggestions.push('Calça confortável de algodão por baixo');
      outfitSuggestions.push('Macacão de plush ou soft que protege bem o peito e as perninhas');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush', 'meias');
    }

    if (condition === 'externo' || condition === 'vento-frio' || state === 'passeando') {
      accessories.push('Touca protetora de algodão cobrindo as orelhinhas');
      accessories.push('Luvas macias para passeios ao ar livre');
      visualItems.push('touca');
    } else {
      accessories.push('Meias bem quentinhas');
    }

    recommendedFabrics.push('Plush denso aveludado', 'Algodão escovado espesso');

  } else {
    // ❄️ EXTREME COLD
    layerCount = 4;
    layersDescription = 'Proteção completa contra o frio com camadas bem quentinhas e acessórios.';
    
    if (isSleeping) {
      outfitSuggestions.push('Visual recomendado: body de manga longa + calça + meias e saco de dormir de plush bem quentinho');
      visualItems.push('body-manga-longa', 'calca', 'saco-dormir-plush', 'meias');
    } else {
      outfitSuggestions.push('Body de manga longa quentinho e confortável');
      outfitSuggestions.push('Calça quentinha de algodão por baixo');
      outfitSuggestions.push('Macacão de plush ou soft bem quentinho por cima');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush', 'meias', 'touca');
    }

    accessories.push('Meias bem grossas de algodão ou sapatilhas de pelúcia');
    accessories.push('Touca de plush ou soft para proteger as orelhinhas');
    
    if (condition === 'externo' || condition === 'vento-frio' || state === 'passeando') {
      accessories.push('Luvas macias infantis');
      visualItems.push('luvas');
    }

    recommendedFabrics.push('Plush de alta densidade', 'Soft térmico aveludado de isolamento reforçado');
  }

  // Add specific custom suggestions based on items
  let itemOptionalText = 'Se o seu bebê costuma transpirar ou sentir calor facilmente, você pode retirar as meias ou dispensar acessórios no ambiente interno.';
  if (sensitivity === 'frio') {
    itemOptionalText = 'Para bebês mais sensíveis ao frio, vale adicionar uma meia a mais ou escolher macacões com pezinho reversível para proteger mais.';
  } else if (sensitivity === 'calor') {
    itemOptionalText = 'Como o seu bebê sente calor fácil, evite o plush ou soft e dê preferência ao algodão tradicional, deixando as meias de lado se estiver em casa.';
  }

  // 4. Create human, warm paragraphs (cozyParagraphs) conforming to style examples
  const cozyParagraphs: string[] = [];
  const ageLabel = {
    'recem-nascido': 'seu recém-nascido',
    '0-3-meses': 'seu bebezinho',
    '3-6-meses': 'seu bebê',
    '6-12-meses': 'seu bebê',
    'mais-de-1-ano': 'seu filho(a)'
  }[age];

  // A single, beautifully shortened, direct and warm advice from the heart
  let heartAdvice = '';
  if (state === 'dormindo') {
    heartAdvice = `Para a soneca ou noite de ${ageLabel}, use saco de dormir seguro para evitar cobertores soltos e manter uma temperatura agradável sem superaquecer 💛`;
  } else if (state === 'colo-sling') {
    heartAdvice = `O colo ou sling já aquece o bebê de forma maravilhosa. Vista ${ageLabel} com uma camada a menos, aproveitando bem o calor do seu corpo.`;
  } else if (condition === 'fechado') {
    heartAdvice = `Em ambientes fechados a temperatura é estável. Um body leve com calça de algodão costuma ser perfeito para ${ageLabel}.`;
  } else if (condition === 'ar-condicionado') {
    heartAdvice = `No ar-condicionado, proteja o peito de ${ageLabel} do vento direto, priorizando tecidos macios e confortáveis.`;
  } else if (condition === 'vento-frio') {
    heartAdvice = `O vento frio exige cuidado rápido: garanta uma barreira cobrindo os bracinhos e orelhas de ${ageLabel}.`;
  } else {
    heartAdvice = `Priorize peças práticas e maleáveis para ${ageLabel} se movimentar com total liberdade e conforto térmico.`;
  }

  // Add a small cozy reminder about checking warmth
  if (age === 'recem-nascido') {
    heartAdvice += ' Lembre-se de manter os pezinhos sempre protegidos com meias suaves.';
  } else {
    heartAdvice += ' Sinta a nuca ou o peitinho do bebê para conferir se ele está quentinho e confortável!';
  }

  cozyParagraphs.push(heartAdvice);

  // 5. Build Smart Alerts and Extra Tips
  const importantAlerts = [
    'Segurança do Sono Crítica: O bebê NUNCA deve dormir de touca ou com cobertores soltos sem supervisão direta para evitar qualquer risco de asfixia e superaquecimento.',
    'Recomendação Especial: Uma excelente opção é o uso de um saco de dormir quentinho com mangas ao invés de cobertores soltos. Ele mantém o pequeno seguro, aquecido e sem o risco de cobrir o rostinho!',
    'A nuca do bebê é o melhor indicador de conforto térmico: sinta ali para saber se ele realmente está suando ou com frio.',
    'Mãos frias nem sempre significam frio! A circulação das extremidades nos pequenos ainda está amadurecendo.',
    'Evite excesso de camadas! Superaquecimento é desconfortável e aumenta os riscos térmicos associados ao sono.',
    'Observe sempre sinais importantes como suor excessivo, bochechas avermelhadas, irritabilidade inexplicável ou pele muito quente.'
  ];

  if (state === 'dormindo') {
    importantAlerts.push('Segurança do Sono: Nunca coloque toucas ou luvas enquanto o bebê dorme no berço, pois impede a troca de calor natural e pode soltar causando asfixia.');
  }

  // Extra tips if checked
  const extraTips: string[] = [];
  if (wantsExtras) {
    extraTips.push('Dobre as mangas do body se o ar aquecer ao longo do dia e escolha golas americanas (as asas nos ombros facilitam puxar a peça para baixo se houver vazamento).');
    extraTips.push('Use e abuse de sabão de coco ou hipoalergênico neutro livre de corantes fortes na lavagem das fraldas e roupinhas.');
    extraTips.push('Deixe as pecinhas próximas a você antes de vestir para que não entrem em contato direto estando geladas.');
    if (perceivedTemp <= 18) {
      extraTips.push('Evite banhos muito demorados ou correntes de vento no banheiro mantendo as portas totalmente fechadas.');
    }
  }

  return {
    temperatureCategory: tempCategory,
    temperatureDescription: tempDescription,
    layerCount,
    layersDescription,
    outfitSuggestions,
    recommendedFabrics,
    accessories: accessories.length > 0 ? accessories : ['Nenhum acessório robusto necessário hoje.'],
    importantAlerts,
    cozyParagraphs,
    extraTips: extraTips.length > 0 ? extraTips : undefined,
    severity,
    visualItems
  };
}
