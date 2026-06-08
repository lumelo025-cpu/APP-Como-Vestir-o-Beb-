/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuestionnaireAnswers, RecommendationResult } from './types.ts';

/**
 * Intelligent Consultancy Engine for ClimaBaby.
 * Avoids raw mathematical temperature additions/subtractions.
 * Reasons based on smart context conditional rules.
 */
export function calculateClothing(answers: QuestionnaireAnswers): RecommendationResult {
  const {
    age,
    state,
    period,
    condition,
    feeling,
    temperature
  } = answers;

  // Context-Based Perceived Feeling
  // We align with the specified order of decision hierarchy:
  // 1. Is the baby sleeping?
  // 2. How is the environment feeling?
  // 3. What is the age?
  // 4. Is there air-conditioning or cold wind?
  // 5. Is it day or night?
  // 6. Optional temperature.

  const isSleeping = state === 'dormindo';
  const isColoSling = state === 'colo-sling';
  const isPasseando = state === 'passeando';
  
  const isNewborn = age === 'recem-nascido';
  const isAC = condition === 'ar-condicionado';
  const isWind = condition === 'vento-frio';
  const isNight = period === 'noite';

  // Translate Feeling to Category and Tone
  let categoryLabel = '';
  let interpretationText = '';
  let severity: RecommendationResult['severity'] = 'mild';

  // Base environmental feeling (Refined to prioritize numerical exact value input)
  let effectiveFeeling = feeling;
  if (temperature !== null) {
    if (temperature > 26) {
      effectiveFeeling = 'muito-quente';
    } else if (temperature >= 24) {
      effectiveFeeling = 'quente';
    } else if (temperature >= 20) {
      effectiveFeeling = 'agradavel';
    } else if (temperature >= 17) {
      effectiveFeeling = 'fresquinho';
    } else if (temperature >= 14) {
      effectiveFeeling = 'frio';
    } else {
      effectiveFeeling = 'muito-frio';
    }
  }

  switch (effectiveFeeling) {
    case 'muito-quente':
      categoryLabel = '🥵 Ambiente Muito Quente';
      interpretationText = 'O calor está bem forte hoje por aí!';
      severity = 'hot';
      break;
    case 'quente':
      categoryLabel = '☀️ Ambiente Quente';
      interpretationText = 'Está um dia quente e ensolarado.';
      severity = 'warm';
      break;
    case 'agradavel':
      categoryLabel = '😊 Clima Agradável';
      interpretationText = 'O clima está ótimo, muito gostoso e equilibrado.';
      severity = 'mild';
      break;
    case 'fresquinho':
      categoryLabel = '🌥️ Ambiente Fresquinho';
      interpretationText = 'Está fresquinho, com aquele ventinho gostoso.';
      severity = 'cold';
      break;
    case 'frio':
      categoryLabel = '🥶 Ambiente Frio';
      interpretationText = 'A temperatura caiu e o ambiente está bem gelado.';
      severity = 'cold';
      break;
    case 'muito-frio':
      categoryLabel = '❄️ Clima Bem Frio';
      interpretationText = 'Dia ou noite de inverno com frio rigoroso!';
      severity = 'extreme-cold';
      break;
  }

  // Adjust if there is AC or Wind (they make the environment feel cooler)
  let adjustedFeeling = effectiveFeeling;
  if (isAC) {
    if (effectiveFeeling === 'muito-quente' || effectiveFeeling === 'quente') {
      adjustedFeeling = 'agradavel';
    } else if (effectiveFeeling === 'agradavel') {
      adjustedFeeling = 'fresquinho';
    } else {
      adjustedFeeling = 'frio';
    }
  } else if (isWind) {
    if (effectiveFeeling === 'muito-quente') {
      adjustedFeeling = 'quente';
    } else if (effectiveFeeling === 'quente') {
      adjustedFeeling = 'agradavel';
    } else if (effectiveFeeling === 'agradavel') {
      adjustedFeeling = 'fresquinho';
    } else if (effectiveFeeling === 'fresquinho') {
      adjustedFeeling = 'frio';
    } else {
      adjustedFeeling = 'muito-frio';
    }
  }

  // Let's model outfits cleanly
  const outfitSuggestions: string[] = [];
  const recommendedFabrics: string[] = [];
  const accessories: string[] = [];
  const visualItems: string[] = [];
  let layerCount = 2;
  let layersDescription = '';

  // CORE CONSULTANCY GRID OF LAYERS & COMPOSITION
  if (isSleeping) {
    if (adjustedFeeling === 'muito-quente') {
      layerCount = 1;
      layersDescription = 'Apenas uma única camada extremamente leve e respirável para o sono seguro no calor.';
      outfitSuggestions.push('Body de Manga Curta em tecido bem leve');
      visualItems.push('body-manga-curta');
      recommendedFabrics.push('Algodão 100% leve, gaze ou cambraia');
      accessories.push('Pés totalmente descalços. Evite meias ou luvas no calor extremo.');
    } else if (adjustedFeeling === 'quente') {
      layerCount = 1;
      layersDescription = 'Camada única e confortável, ideal para transpiração eficiente.';
      if (isNewborn) {
        outfitSuggestions.push('Body de Manga Longa fininho (por ser recém-nascido)');
        visualItems.push('body-manga-longa');
      } else {
        outfitSuggestions.push('Body de Manga Curta bem fluido');
        visualItems.push('body-manga-curta');
      }
      recommendedFabrics.push('Algodão Pima ou Suedine respirável');
      accessories.push('Não necessita meias para evitar reter calor corporal.');
    } else if (adjustedFeeling === 'agradavel') {
      layerCount = 3;
      layersDescription = 'Três camadas suaves que unem toque macio na pele à proteção do saco de dormir leve.';
      if (isNewborn) {
        outfitSuggestions.push('Body de Manga Longa de base');
        outfitSuggestions.push('Calça confortável de algodão');
        visualItems.push('body-manga-longa', 'calca');
      } else {
        outfitSuggestions.push('Body de Manga Curta leve');
        outfitSuggestions.push('Calça (mijão) de algodão');
        visualItems.push('body-manga-curta', 'calca');
      }
      outfitSuggestions.push('Saco de dormir leve (cobertura fina e respirável, 0.5 a 1.0 TOG)');
      visualItems.push('saco-dormir-leve');
      recommendedFabrics.push('Algodão Suedine clássico, Malha canelada e tecidos respiráveis de 1.0 TOG máximo');
      accessories.push('Meias leves se sentir os pezinhos frios.');
    } else if (adjustedFeeling === 'fresquinho') {
      layerCount = 3;
      layersDescription = 'Três camadas aconchegantes com isolamento intermediário para noites de meia-estação.';
      outfitSuggestions.push('Body de Manga Longa de base');
      outfitSuggestions.push('Calça culote confortável');
      outfitSuggestions.push('Saco de dormir soft quentinho (isolamento moderado, ~1.5 TOG)');
      visualItems.push('body-manga-longa', 'calca', 'saco-dormir-soft');
      recommendedFabrics.push('Algodão Interlock ou suedine encorpado para as bases e Soft escovado médio para o saco');
      accessories.push('Meias quentinhas de algodão');
    } else if (adjustedFeeling === 'frio') {
      // Categoria Especial: Frio Confortável (14°C - 16°C)
      layerCount = 4;
      layersDescription = 'Quatro camadas coordenadas: base protetora, barreira macia de soft e saco de dormir plush de inverno.';
      outfitSuggestions.push('Body de Manga Longa de toque macio');
      outfitSuggestions.push('Calça confortável (mijão) como calça base');
      outfitSuggestions.push('Macacão Soft ou Peluciado aconchegante');
      outfitSuggestions.push('Saco de dormir plush com mangas de inverno (isolamento pesado, 2.5 TOG)');
      visualItems.push('body-manga-longa', 'calca', 'macacao-soft', 'saco-dormir-plush');
      recommendedFabrics.push('Soft escovado, plush macio e algodão de alta retenção térmica');
      accessories.push('Meias aconchegantes de plush');
    } else {
      // Categoria Especial: Frio Rigoroso / Muito Frio (<= 13°C)
      layerCount = 4;
      layersDescription = 'Quatro camadas térmicas: máxima proteção sob inverno intenso com macacão plush e saco com mangas.';
      outfitSuggestions.push('Body de Manga Longa reforçado');
      outfitSuggestions.push('Calça confortável (mijão) por baixo');
      outfitSuggestions.push('Macacão Plush denso super aconchegante');
      outfitSuggestions.push('Saco de dormir plush de inverno com mangas acolchoado (alta retenção térmica, 2.5 a 3.5 TOG)');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush', 'saco-dormir-plush');
      recommendedFabrics.push('Plush denso aveludado, soft térmico espesso e algodão escovado na pele');
      accessories.push('Meias quentinhas e grossas');
    }
  } else {
    // Current non-sleeping logic
    if (adjustedFeeling === 'muito-quente') {
      layerCount = 1;
      layersDescription = 'Apenas uma única camada extremamente leve e fresca para evitar brotoejas e superaquecimento.';
      outfitSuggestions.push('Body de Manga Curta bem fininho');
      visualItems.push('body-manga-curta');
      recommendedFabrics.push('Algodão 100% leve, gaze ou cambraia');
      accessories.push('Nenhum acessório hoje. Deixe os pezinhos descalços!');
    } else if (adjustedFeeling === 'quente') {
      layerCount = 1;
      layersDescription = 'Uma camada simples, focando na transpiração natural e conforto.';
      if (isNewborn) {
        outfitSuggestions.push('Body de Manga Longa fininho (por ser recém-nascido)');
        visualItems.push('body-manga-longa');
      } else {
        outfitSuggestions.push('Body de Manga Curta confortável');
        visualItems.push('body-manga-curta');
      }
      recommendedFabrics.push('Algodão Suedine bem macio');
      accessories.push('Pezinhos livres de meias para regular o calor naturalmente.');
    } else if (adjustedFeeling === 'agradavel') {
      layerCount = 2;
      layersDescription = 'Duas camadas básicas e leves para manter o corpinho seguro e em temperatura ideal.';
      if (isNewborn) {
        outfitSuggestions.push('Body de Manga Longa + Calça confortável');
        visualItems.push('body-manga-longa', 'calca');
      } else {
        outfitSuggestions.push('Body de Manga Curta + Calça (culote/mijão)');
        visualItems.push('body-manga-curta', 'calca');
      }
      recommendedFabrics.push('Algodão Suedine tradicional ou Malha canelada');
      accessories.push('Meias leves se sentir as extremidades geladinhas.');
    } else if (adjustedFeeling === 'fresquinho') {
      layerCount = 2;
      layersDescription = 'Duas camadas aconchegantes com proteção integral para braços e pernas.';
      outfitSuggestions.push('Body de Manga Longa de base');
      outfitSuggestions.push('Calça confortável de algodão');
      outfitSuggestions.push('Macacão de algodão leve por cima');
      visualItems.push('body-manga-longa', 'calca', 'macacao-algodao');
      recommendedFabrics.push('Algodão Interlock ou suedine encorpado');
      accessories.push('Meias confortáveis de algodão');
    } else if (adjustedFeeling === 'frio') {
      layerCount = 3;
      layersDescription = 'Três camadas protetoras de frio para cobrir o peito e reter o calor de forma segura.';
      outfitSuggestions.push('Body de Manga Longa');
      outfitSuggestions.push('Calça (mijão) macia por baixo');
      outfitSuggestions.push('Macacão de algodão plush ou soft quentinho');
      visualItems.push('body-manga-longa', 'calca', 'macacao-soft');
      recommendedFabrics.push('Plush de toque sedoso e Soft escovado');
      accessories.push('Meias quentinhas');
      if (isPasseando || (isNewborn && isWind)) {
        accessories.push('Touca macia protetora');
        visualItems.push('touca');
      }
    } else {
      // muito-frio
      layerCount = 3;
      layersDescription = 'Três camadas térmicas cheias de aconchego para dias de inverno rigoroso.';
      outfitSuggestions.push('Body de Manga Longa quentinho');
      outfitSuggestions.push('Calça (mijão) confortável');
      outfitSuggestions.push('Macacão Plush reforçado');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush');
      recommendedFabrics.push('Plush denso, soft térmico e algodão escovado');
      accessories.push('Meias bem quentinhas grossas');
      if (isPasseando || isNewborn || isWind) {
        accessories.push('Touca de plush cobrindo as orelhinhas');
        accessories.push('Luvas macias como item de preferência');
        visualItems.push('touca', 'luvas');
      }
    }
  }

  // SPECIAL COOLO AND SLING RULE: REDUCE LAYER OR ADJUST CAPABILITY
  if (isColoSling) {
    if (layerCount > 1) {
      layerCount = layerCount - 1;
    }
  }

  // ALERTS & RECOMMENDATIONS WRITTEN IN WARM MOM-TO-MOM TONE
  const importantAlerts = [
    'Segurança Prática do Sono: Nunca coloque toucas ou gorros enquanto seu bebê dorme sem supervisão. A cabeça é o local por onde eles regulam o próprio calor e há risco de asfixia mecânica.',
    'Nunca utilize cobertores ou lençóis soltos no berço para bebês sem supervisão direta. Há risco de cobrir acidentalmente o rostinho.',
    'Excelente Alternativa Segura: Para os momentos de soninho, use sempre um saco de dormir quentinho com mangas de acordo com o frio atual, eliminando a necessidade de cobertor.'
  ];

  if (isSleeping) {
    importantAlerts.push('Atenção ao sono: Mantenha o berço livre de protetores de berço fofos, bichos de pelúcia ou travesseiros para garantir ventilação ideal.');
  }

  // Build Personalized, ultra friendly paragraphs for parents
  const cozyParagraphs: string[] = [];
  const ageGroupText = {
    'recem-nascido': 'seu recém-nascido, que ainda está se acostumando com o mundo cá fora',
    '1-6-meses': 'seu bebezinho de poucos meses',
    '6-12-meses': 'seu bebê que já está descobrindo novos movimentos',
    'mais-de-1-ano': 'seu pequeno que está cheio de energia'
  }[age];

  let consultSummary = '';
  if (isSleeping) {
    consultSummary = `Para a hora do soninho seguro de ${ageGroupText}, preparamos um look focado no conforto e na segurança. Como o bebê não deve dormir de touca nem usar cobertor solto sem supervisão, a melhor alternativa é adotar um bom saco de dormir quentinho com mangas! Ele envolve o bebê como um abraço seguro a noite inteira 💛`;
  } else if (isColoSling) {
    consultSummary = `Você escolheu colo ou sling para ${ageGroupText}! Como o contato direto com o seu corpo gera muito aconchego natural e aquece bastante o bebê, reduzimos uma camada da recomendação oficial. Fique atenta para aproveitar bem esse chamego aconchegante!`;
  } else if (isPasseando) {
    consultSummary = `Para o passeio ao ar livre de ${ageGroupText}, o mais importante é proteger extremidades caso surjam brisas frias indesejadas pelo caminho. Leve sempre uma touca prática na bolsa!`;
  } else {
    consultSummary = `Para o dia a dia de ${ageGroupText} em ambiente doméstico, focamos em conforto puro. O segredo é dar liberdade para brincar e se mover livremente com tecidos saudáveis.`;
  }

  if (isAC) {
    consultSummary += ' Como o ar-condicionado costuma resfriar o ambiente e produzir vento contínuo, a roupinha foi recomendada para proteger o peito e evitar friagens diretas.';
  } else if (isWind) {
    consultSummary += ' Com esse vento frio de hoje, manter os membros protegidos com meias e punhos firmes ajudará a reter o quentinho de forma adorável.';
  }

  if (temperature !== null) {
    consultSummary += ` A temperatura aproximada de ${temperature}°C foi considerada para refinar a sugestão.`;
  }

  cozyParagraphs.push(consultSummary);

  if (isSleeping) {
    cozyParagraphs.push(
      'Entenda a diferença das camadas para o sono:\n' +
      '• 🧸 Saco LEVE: Feito de algodão suave (0.5 a 1.0 TOG) - Ideal para clima ameno ou ar-condicionado suave.\n' +
      '• 🧸 Saco SOFT: Aquecimento intermediário (~1.5 TOG) - Excelente para noites frescas de meia-estação.\n' +
      '• 🧸 Saco PLUSH COM MANGAS: Proteção térmica completa forrada (2.5 a 3.5 TOG) - Essencial para noites frias e muito frias (temperaturas abaixo de 13°C) dispensando totalmente o uso de cobertores com ampla segurança.'
    );
  }

  return {
    temperatureCategory: categoryLabel,
    temperatureDescription: interpretationText,
    layerCount,
    layersDescription,
    outfitSuggestions,
    recommendedFabrics,
    accessories: accessories.length > 0 ? accessories : ['Nenhum acessório robusto necessário hoje.'],
    importantAlerts,
    cozyParagraphs,
    severity,
    visualItems
  };
}
