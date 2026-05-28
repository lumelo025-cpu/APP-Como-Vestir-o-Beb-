/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuestionnaireAnswers, RecommendationResult } from './types.ts';

/**
 * Interprets the questionnaire input and generates a cozy, highly personalized
 * recommendation based on the Intelligent Layers System.
 */
export function calculateClothing(answers: QuestionnaireAnswers): RecommendationResult {
  const {
    age,
    state,
    period,
    temperature,
    hasWind,
    sensitivity,
    location,
    wantsExtras
  } = answers;

  // 1. Determine Perceived Temperature and Category based on special criteria
  let perceivedTemp = temperature;

  // Ar-condicionado: Considera ambiente 3°C mais frio
  if (state === 'ar-condicionado') {
    perceivedTemp -= 3.0;
  }

  // Vento em ambiente externo: Aumenta sensação de frio
  if (hasWind && location === 'externo') {
    perceivedTemp -= 2.5;
  }

  // Tipo de pele / Sensibilidade
  if (sensitivity === 'frio') {
    perceivedTemp -= 1.5;
  } else if (sensitivity === 'calor') {
    perceivedTemp += 1.5;
  }

  // Colo ou Sling: Diminui a necessidade de roupa devido ao calor humano (atua como se estivesse mais quente)
  if (state === 'sling-colo') {
    perceivedTemp += 3.5;
  }

  // Recém-nascidos regulam mal o calor: necessitam de roupas um pouco mais quentes (-1.5°C na percepção)
  if (age === 'recem-nascido') {
    perceivedTemp -= 1.5;
  }

  // Determine Severity and Categories based on Perceived Temperature
  let tempCategory = '';
  let tempDescription = '';
  let severity: RecommendationResult['severity'] = 'mild';

  if (perceivedTemp < 15) {
    tempCategory = perceivedTemp < 12 ? '❄️ Frio Intenso' : '🥶 Clima Frio';
    tempDescription = 'O ambiente está bem gelado! Proteção reforçada e o aconchego de tecidos quentinho são necessários.';
    severity = perceivedTemp < 12 ? 'extreme-cold' : 'cold';
  } else if (perceivedTemp >= 15 && perceivedTemp < 18) {
    tempCategory = '🍃 Frio Moderado';
    tempDescription = 'Um clima mais fresco que pede camadas macias para proteger seu bebê.';
    severity = 'cold';
  } else if (perceivedTemp >= 18 && perceivedTemp < 21) {
    tempCategory = '🌤️ Clima Fresco';
    tempDescription = 'Temperatura gostosa com aquela leve brisa que pede agasalho leve.';
    severity = 'mild';
  } else if (perceivedTemp >= 21 && perceivedTemp < 24) {
    tempCategory = '😊 Levemente Fresco';
    tempDescription = 'Clima agradável e convidativo, ideal para roupas confortáveis de algodão.';
    severity = 'mild';
  } else if (perceivedTemp >= 24 && perceivedTemp < 27) {
    tempCategory = '☀️ Clima Agradável';
    tempDescription = 'Temperatura deliciosa de primavera. Use roupas fluídas e de toque macio.';
    severity = 'mild';
  } else if (perceivedTemp >= 27 && perceivedTemp < 30) {
    tempCategory = '🔥 Clima Quente';
    tempDescription = 'Calor evidente. Priorize poucas camadas e tecidos extremamente respiráveis.';
    severity = 'warm';
  } else {
    tempCategory = '🌡️ Clima Muito Quente';
    tempDescription = 'Calor intenso! Hidrate bastante o bebê e evite roupas desnecessárias.';
    severity = 'hot';
  }

  // 2. Outfit Suggestions, Fabrics, Accessories based on Daytime or Night/Sleep
  const isSleepOrNight = state === 'dormindo' || period === 'noite';

  const outfitSuggestions: string[] = [];
  const recommendedFabrics: string[] = [];
  const accessories: string[] = [];
  const visualItems: string[] = [];
  let layerCount = 2;
  let layersDescription = '';

  if (isSleepOrNight) {
    // ====================================
    // 🌙 CENÁRIOS DE NOITE / SONO
    // ====================================
    if (perceivedTemp >= 27) {
      // ACIMA DE 27°C — NOITE QUENTE
      outfitSuggestions.push('Body manga curta leve');
      if (perceivedTemp >= 30) {
        outfitSuggestions.push('Apenas fralda (em noites extremamente abafadas)');
      }
      recommendedFabrics.push('Algodão fino', 'Malha de algodão 100%');
      visualItems.push('body-manga-curta');
      layerCount = 1;
      layersDescription = 'Camada única ultraleve para noites quentes.';
    } else if (perceivedTemp >= 24 && perceivedTemp < 27) {
      // 24°C A 26°C — NOITE AGRADÁVEL
      outfitSuggestions.push('Body manga curta OU Macacão de algodão leve');
      outfitSuggestions.push('Saco de dormir leve (como opção para manter coberto)');
      recommendedFabrics.push('Algodão Pima', 'Suedine macio');
      visualItems.push('body-manga-curta', 'saco-dormir-leve');
      layerCount = 2;
      layersDescription = '1 camada leve + Saco de dormir protetor para o sono.';
    } else if (perceivedTemp >= 21 && perceivedTemp < 24) {
      // 21°C A 23°C — NOITE LEVEMENTE FRESCA
      outfitSuggestions.push('Body manga longa + Macacão de algodão leve');
      outfitSuggestions.push('Saco de dormir leve');
      recommendedFabrics.push('Algodão encorpado', 'Algodão Suedine');
      visualItems.push('body-manga-longa', 'macacao-algodao', 'saco-dormir-leve');
      layerCount = 25; // represented visually/cognitively
      layerCount = 2;
      layersDescription = 'Camadas macias de algodão respirável acompanhadas de um saco de dormir leve.';
    } else if (perceivedTemp >= 18 && perceivedTemp < 21) {
      // 18°C A 20°C — NOITE FRESCA
      outfitSuggestions.push('Body manga longa + Calça de algodão + Macacão de algodão');
      outfitSuggestions.push('Saco de dormir soft (opção aconchegante)');
      accessories.push('Meias leves (caso não queira usar o saco de dormir ou pés fiquem fresquinhos)');
      recommendedFabrics.push('Algodão Interlock', 'Flanelado leve');
      visualItems.push('body-manga-longa', 'calca', 'macacao-algodao', 'saco-dormir-soft', 'meias');
      layerCount = 3;
      layersDescription = '3 camadas protetoras combinadas para manter o calor ideal sem sufocar.';
    } else if (perceivedTemp >= 15 && perceivedTemp < 18) {
      // 15°C A 17°C — NOITE FRIA
      outfitSuggestions.push('Opção 1: Body manga longa + Calça + Meias + Macacão soft');
      outfitSuggestions.push('Opção 2: Body manga longa + Calça + Saco de dormir de inverno');
      if (age === 'recem-nascido') {
        outfitSuggestions.push('Dica extra: adicione macacão plush para recém-nascidos friorentos');
      }
      recommendedFabrics.push('Algodão térmico natural', 'Soft macio escovado');
      visualItems.push('body-manga-longa', 'calca', 'macacao-soft', 'meias', 'saco-dormir-soft');
      layerCount = 3;
      layersDescription = 'Composições quentinhas de soft ou plush acopladas ao saco de dormir invernal.';
    } else if (perceivedTemp >= 12 && perceivedTemp < 15) {
      // 12°C A 14°C — NOITE MUITO FRIA
      outfitSuggestions.push('Body manga longa + Calça + Macacão plush + Meias');
      outfitSuggestions.push('Saco de dormir plush com mangas longas');
      accessories.push('Touca de algodão (utilizar apenas fora do berço; remova ao deitar)');
      recommendedFabrics.push('Plush de microfibra de alta densidade', 'Soft térmico');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush', 'meias', 'saco-dormir-plush');
      layerCount = 4;
      layersDescription = 'Proteção máxima contra o frio da madrugada com fechamento em plush quentinho.';
    } else {
      // ABAIXO DE 12°C — FRIO INTENSO
      outfitSuggestions.push('Body manga longa encorpado + Calça quente');
      outfitSuggestions.push('Macacão plush + Saco de dormir plush com mangas + Meias grossas');
      recommendedFabrics.push('Plush denso', 'Soft ultra-aquecido');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush', 'meias', 'saco-dormir-plush');
      layerCount = 4;
      layersDescription = 'Frio extremo noturno! Exige isolamento inteligente e meias acolhedoras integradas.';
    }
  } else {
    // ====================================
    // ☀️ CENÁRIOS DE DIA
    // ====================================
    if (perceivedTemp >= 30) {
      // ACIMA DE 30°C — MUITO QUENTE
      outfitSuggestions.push('Body manga curta bem fino e respirável');
      accessories.push('Pezinhos descalços para regulação térmica natural');
      recommendedFabrics.push('Algodão leve', 'Malha respirável');
      visualItems.push('body-manga-curta');
      layerCount = 1;
      layersDescription = 'Apenas 1 camada fina e refrescante de algodão.';
    } else if (perceivedTemp >= 27 && perceivedTemp < 30) {
      // 27°C A 30°C — QUENTE
      outfitSuggestions.push('Body manga curta leve');
      if (hasWind || state === 'ar-condicionado') {
        outfitSuggestions.push('Calça leve opcional (mijão) devido ao ventinho');
      }
      if (age === 'recem-nascido') {
        outfitSuggestions.push('Alternativa: Body manga longa bem leve devido à pele sensível');
      }
      recommendedFabrics.push('Algodão puro', 'Fibra de bambu respirável');
      visualItems.push('body-manga-curta');
      if (hasWind || state === 'ar-condicionado') {
        visualItems.push('calca');
      }
      layerCount = 1;
      layersDescription = 'Conforto minimalista, focado em alta permeabilidade do ar.';
    } else if (perceivedTemp >= 24 && perceivedTemp < 27) {
      // 24°C A 26°C — AGRADÁVEL
      outfitSuggestions.push('Body manga curta OU Body manga longa bem leve');
      outfitSuggestions.push('Calça culote leve (mijão) para conforto das pernas');
      recommendedFabrics.push('Meia-malha de algodão', 'Suedine respirável');
      visualItems.push('body-manga-curta', 'calca');
      layerCount = 2;
      layersDescription = 'Combinação perfeita de base respirável com proteção às perninhas.';
    } else if (perceivedTemp >= 21 && perceivedTemp < 24) {
      // 21°C A 23°C — LEVEMENTE FRESCO
      outfitSuggestions.push('Body manga longa macio + Calça de algodão');
      outfitSuggestions.push('Como alternativa prática: Macacão de algodão leve');
      accessories.push('Meias leves');
      recommendedFabrics.push('Algodão Suedine clássico', 'Fibras entrelaçadas suaves');
      visualItems.push('body-manga-longa', 'calca', 'meias');
      layerCount = 2;
      layersDescription = '2 camadas leves de algodão mantendo os membros perfeitamente aquecidos.';
    } else if (perceivedTemp >= 18 && perceivedTemp < 21) {
      // 18°C A 20°C — FRESCO
      outfitSuggestions.push('Body manga longa + Calça de algodão + Macacão de algodão encorpado');
      if (sensitivity === 'frio') {
        outfitSuggestions.push('Alternativa: Macacão soft ou de tecido peluciado leve');
      }
      accessories.push('Meias de algodão');
      recommendedFabrics.push('Algodão Interlock grosso', 'Malha canelada aconchegante');
      visualItems.push('body-manga-longa', 'calca', 'macacao-algodao', 'meias');
      layerCount = 3;
      layersDescription = 'Visual completo com body base, perninhas protegidas e macacão quentinho.';
    } else if (perceivedTemp >= 15 && perceivedTemp < 18) {
      // 15°C A 17°C — FRIO MODERADO
      outfitSuggestions.push('Body manga longa + Calça protetora + Macacão soft/peluciado');
      accessories.push('Meias aconchegantes');
      if (age === 'recem-nascido') {
        outfitSuggestions.push('Para recém-nascidos friorentos: Macacão plush aveludado');
      }
      if (location === 'externo') {
        accessories.push('Touca protetora de algodão bem macia');
      }
      recommendedFabrics.push('Fleece leve escovado', 'Plush macio de microfibra');
      visualItems.push('body-manga-longa', 'calca', 'macacao-soft', 'meias');
      if (location === 'externo') {
        visualItems.push('touca');
      }
      layerCount = 3;
      layersDescription = 'Camada base encorpada sob macacão soft térmico para isolamento aconchegante.';
    } else if (perceivedTemp >= 12 && perceivedTemp < 15) {
      // 12°C A 14°C — FRIO
      outfitSuggestions.push('Body manga longa confortável + Calça culote + Macacão plush aveludado');
      accessories.push('Meias quentinhas');
      if (location === 'externo') {
        accessories.push('Touca quentinha');
        accessories.push('Luvas macias para passeios ao ar livre');
      }
      recommendedFabrics.push('Plush atoalhado de alta densidade', 'Algodão escovado espesso');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush', 'meias');
      if (location === 'externo') {
        visualItems.push('touca', 'luvas');
      }
      layerCount = 3;
      layersDescription = 'Materiais de plush denso e aconchegante garantindo proteção segura contra rajadas.';
    } else {
      // ABAIXO DE 12°C — MUITO FRIO
      outfitSuggestions.push('Body manga longa grosso + Calça de algodão reforçada + Macacão plush ultra-aquecido');
      accessories.push('Meias de algodão grossas');
      accessories.push('Touca quentinha protetora');
      if (location === 'externo') {
        accessories.push('Luvas protetoras');
      }
      if (wantsExtras) {
        outfitSuggestions.push('Opcional de passeio: manta aconchegante (apenas sob supervisão visual direta)');
      }
      recommendedFabrics.push('Plush térmico', 'Soft aveludado de altíssima proteção');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush', 'meias', 'touca');
      if (location === 'externo') {
        visualItems.push('luvas');
      }
      layerCount = 4;
      layersDescription = 'Superposição robusta de tecidos fofinhos e acessórios para vedar qualquer entrada fria.';
    }
  }

  // Ensure age modifier texts exist to keep it cozy and highly specialized
  let ageModifierText = '';
  if (age === 'recem-nascido') {
    if (perceivedTemp < 25) {
      ageModifierText = 'Como seu pacotinho é um recém-nascido, ele ainda está aprendendo a regular a própria temperatura corporal e precisa de atenção redobrada com as extremidades.';
    } else {
      ageModifierText = 'Mesmo sendo recém-nascido, o termômetro está em alta! Mantenha a roupinha super leve para evitar brotoejas e superaquecimento.';
    }
  }

  // Define importantAlerts (including specific smart alerts requested by the user)
  const importantAlerts: string[] = [
    'A nuca do bebê é o melhor indicador de conforto térmico: sinta ali para saber se ele realmente está suando ou com frio.',
    'Mãos frias nem sempre significam frio! A circulação das extremidades nos pequenos ainda está amadurecendo.',
    'Evite excesso de camadas! Superaquecimento é desconfortável e aumenta os riscos térmicos associados ao sono.',
    'Observe sinais importantes como suor excessivo, bochechas avermelhadas, irritabilidade inexplicável ou pele muito quente.',
    'Prefira saco de dormir adequado ao invés de cobertores soltos para garantir noites tranquilas de sono 100% seguro.'
  ];

  if (state === 'dormindo') {
    importantAlerts.push('Segurança do Sono: Nunca coloque toucas ou luvas enquanto o bebê dorme no berço, pois impede a troca de calor natural da cabeça e pode soltar causando asfixia.');
    importantAlerts.push('Mantenha o berço livre de objetos soltos, como travesseiros, brinquedos de pelúcia ou protetores acolchoados.');
  }

  if (perceivedTemp >= 27) {
    importantAlerts.push('A brotoeja é causada pela obstrução dos canais de suor. Evite sobreposições em dias abafados.');
    importantAlerts.push('Ofereça amamentação em livre demanda para manter seu bebê hidratado no calor.');
  }

  // Create human, warm paragraphs (cozyParagraphs)
  const cozyParagraphs: string[] = [];
  const ageLabel = {
    'recem-nascido': 'seu recém-nascido querido',
    '0-3-meses': 'seu bebezinho de poucos meses',
    '3-6-meses': 'seu bebê que já está descobrindo o mundo',
    '6-12-meses': 'seu bebê ativo de quase 1 ano',
    'mais-de-1-ano': 'seu pequeno tagarela aventureiro'
  }[age];

  let introPara = '';
  if (state === 'dormindo') {
    introPara = `Bebê dormindo de forma aconchegante enche nosso peito de paz! Para garantir que o soninho de ${ageLabel} transcorra com absoluta segurança técnica e térmica nesta temperatura de ${temperature}°C, desenhamos uma vestimenta ideal baseada em camadas simples, livres de qualquer complicação.`;
  } else if (state === 'sling-colo') {
    introPara = `O aconchego do colo humano é imbatível! Ao carregar ${ageLabel} juntinho de você ou no sling, lembre-se de que o calor do seu corpo funciona como um isolamento ativo. Por isso, adaptamos o visual para evitar suores desnecessários.`;
  } else if (state === 'ar-condicionado') {
    introPara = `Em ambientes climatizados artificialmente, o vento gelado constante exige proteção direcionada a resguardar o tórax e peito de ${ageLabel}, sem exagerar no peso das calças e casacos.`;
  } else {
    introPara = `Preparamos um visual super prático para ${ageLabel} brincar e interagir livremente na temperatura de ${temperature}°C. Focamos no equilíbrio térmico para que haja total liberdade de movimentos.`;
  }
  cozyParagraphs.push(introPara);

  let prescriptionPara = '';
  if (perceivedTemp >= 25) {
    prescriptionPara = `Para esta temperatura quente de ${temperature}°C, a recomendação de ouro é a mínima barreira de tecido. ${ageModifierText || 'O corpinho precisa respirar de forma fluida.'} Use peças finas, de preferência 100% algodão para que a umidificação da pele seja eliminada confortavelmente.`;
  } else {
    prescriptionPara = `Nesta faixa climática de ${temperature}°C, o segredo é alinhar o body protetor com o macacão ideal. ${ageModifierText} A primeira camada base retém o calor e as perninhas ficam seguras sob a calça leve, enquanto a camada superior protege o peito das variações de brisa.`;
  }
  cozyParagraphs.push(prescriptionPara);

  cozyParagraphs.push(
    `Lembre-se: confie sempre no seu instinto de mãe! Cada bebê tem seu próprio ritmo biológico e metabólico. De hora em hora, passe as mãos calorosamente na nuca dele para calibrar com perfeição o visual sugerido.`
  );

  // 4. Extra tips if user checked 'Sim'
  const extraTips: string[] = [];
  if (wantsExtras) {
    extraTips.push('Dobre as mangas do body se o ar aquecer ao longo do dia e prefira modelos com gola americana (fácil de vestir de cima para baixo).');
    extraTips.push('Use sabão neutro hipoalergênico livre de perfumes fortes para a lavagem das pecinhas e corte qualquer etiqueta que resvale na pele sensível.');
    extraTips.push('A nuca é sempre mais confiável que os pezinhos e mãozinhas para aferir calor ou frio real.');
    if (perceivedTemp <= 18) {
      extraTips.push('Deixe o enxoval e a toalha de banho pré-aquecidos em dias frios para evitar choques térmicos desconfortáveis.');
    }
  }

  return {
    temperatureCategory: tempCategory,
    temperatureDescription: tempDescription,
    layerCount,
    layersDescription,
    outfitSuggestions,
    recommendedFabrics,
    accessories: accessories.length > 0 ? accessories : ['Nenhum acessório extravagante necessário hoje.'],
    importantAlerts,
    cozyParagraphs,
    extraTips: extraTips.length > 0 ? extraTips : undefined,
    severity,
    visualItems
  };
}
