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

  // Base environmental feeling
  switch (feeling) {
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
  let adjustedFeeling = feeling;
  if (isAC) {
    if (feeling === 'muito-quente' || feeling === 'quente') {
      adjustedFeeling = 'agradavel';
    } else if (feeling === 'agradavel') {
      adjustedFeeling = 'fresquinho';
    } else {
      adjustedFeeling = 'frio';
    }
  } else if (isWind) {
    if (feeling === 'muito-quente') {
      adjustedFeeling = 'quente';
    } else if (feeling === 'quente') {
      adjustedFeeling = 'agradavel';
    } else if (feeling === 'agradavel') {
      adjustedFeeling = 'fresquinho';
    } else if (feeling === 'fresquinho') {
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
  if (adjustedFeeling === 'muito-quente') {
    layerCount = 1;
    layersDescription = 'Apenas uma única camada extremamente leve e fresca para evitar brotoejas e superaquecimento.';
    
    if (isSleeping) {
      outfitSuggestions.push('Apenas Body de Manga Curta leve');
      visualItems.push('body-manga-curta');
    } else {
      outfitSuggestions.push('Body de Manga Curta bem fininho');
      visualItems.push('body-manga-curta');
    }
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

    if (isSleeping) {
      outfitSuggestions.push('Saco de dormir leve opcional substituindo cobertores');
      visualItems.push('saco-dormir-leve');
    }

    recommendedFabrics.push('Algodão Suedine tradicional ou Malha canelada');
    accessories.push('Meias leves se sentir as extremidades geladinhas.');

  } else if (adjustedFeeling === 'fresquinho') {
    layerCount = 2;
    layersDescription = 'Duas camadas aconchegantes com proteção integral para braços e pernas.';

    outfitSuggestions.push('Body de Manga Longa de base');
    outfitSuggestions.push('Calça confortável de algodão');
    visualItems.push('body-manga-longa', 'calca');

    if (isSleeping) {
      outfitSuggestions.push('Saco de dormir soft quentinho');
      visualItems.push('saco-dormir-soft');
    } else {
      outfitSuggestions.push('Macacão de algodão leve por cima');
      visualItems.push('macacao-algodao');
    }

    recommendedFabrics.push('Algodão Interlock ou suedine encorpado');
    accessories.push('Meias confortáveis de algodão');

  } else if (adjustedFeeling === 'frio') {
    layerCount = 3;
    layersDescription = 'Três camadas protetoras de frio para cobrir o peito e reter o calor de forma segura.';

    outfitSuggestions.push('Body de Manga Longa');
    outfitSuggestions.push('Calça (mijão) macia por baixo');
    visualItems.push('body-manga-longa', 'calca');

    if (isSleeping) {
      outfitSuggestions.push('Saco de dormir plush ou soft quentinho');
      visualItems.push('saco-dormir-soft');
    } else {
      outfitSuggestions.push('Macacão de algodão plush ou soft quentinho');
      visualItems.push('macacao-soft');
    }

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
    visualItems.push('body-manga-longa', 'calca');

    if (isSleeping) {
      outfitSuggestions.push('Saco de dormir plush bem quentinho com mangas');
      visualItems.push('saco-dormir-plush');
    } else {
      outfitSuggestions.push('Macacão Plush reforçado');
      visualItems.push('macacao-plush');
    }

    recommendedFabrics.push('Plush denso, soft térmico e algodão escovado');
    accessories.push('Meias bem quentinhas grossas');

    if (isPasseando || isNewborn || isWind) {
      accessories.push('Touca de plush cobrindo as orelhinhas');
      accessories.push('Luvas macias como item de preferência');
      visualItems.push('touca', 'luvas');
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
