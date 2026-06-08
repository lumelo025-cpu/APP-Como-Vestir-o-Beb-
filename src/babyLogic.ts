/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuestionnaireAnswers, RecommendationResult, LayerDetail } from './types.ts';

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
  let layerCount = 1;
  let layersDescription = '';
  const layerDetails: LayerDetail[] = [];

  // CORE CONSULTANCY GRID OF LAYERS & COMPOSITION
  if (isSleeping) {
    if (adjustedFeeling === 'muito-quente') {
      layerCount = 1;
      layersDescription = 'Apenas uma única peça leve e respirável para o sono seguro no calor extremo.';
      outfitSuggestions.push('Body de Manga Curta em tecido bem leve');
      visualItems.push('body-manga-curta');
      recommendedFabrics.push('Algodão 100% leve, gaze ou cambraia');
      accessories.push('Pés totalmente descalços. Evite meias ou luvas no calor extremo.');

      layerDetails.push({
        id: 'base',
        name: '🧸 CAMADA BASE',
        items: 'Body de manga curta',
        funcao: 'Contato direto com a pele, proporcionando frescor máximo e segurança no sono sob forte calor.',
        color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
      });
    } else if (adjustedFeeling === 'quente') {
      layerCount = 1;
      layersDescription = 'Proteção térmica equilibrada para manter o conforto do bebê sem excesso de roupas.';
      recommendedFabrics.push('Algodão Pima ou Suedine respirável');
      accessories.push('Não necessita meias para evitar reter calor corporal.');

      if (isNewborn) {
        outfitSuggestions.push('Body de Manga Longa fininho (por ser recém-nascido)');
        visualItems.push('body-manga-longa');
        layerDetails.push({
          id: 'base',
          name: '🧸 CAMADA BASE',
          items: 'Body manga longa fininho',
          funcao: 'Delicada proteção ideal para a pele fina de recém-nascidos em noites mais quentes.',
          color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
        });
      } else {
        outfitSuggestions.push('Body de Manga Curta bem fluido');
        visualItems.push('body-manga-curta');
        layerDetails.push({
          id: 'base',
          name: '🧸 CAMADA BASE',
          items: 'Body manga curta fluido',
          funcao: 'Contato suave com a pele, ideal para transpiração regular nos dias mais quentes.',
          color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
        });
      }
    } else if (adjustedFeeling === 'agradavel') {
      layerCount = 2; // (Body+Calca = 1) + Saco = 2 layers
      layersDescription = 'Proteção térmica equilibrada para manter o conforto do bebê sem excesso de roupas.';
      recommendedFabrics.push('Algodão Suedine clássico, Malha canelada e tecidos respiráveis de 1.0 TOG máximo');
      accessories.push('Meias leves se sentir os pezinhos frios.');

      if (isNewborn) {
        outfitSuggestions.push('Body de Manga Longa de base', 'Calça confortável de algodão');
        visualItems.push('body-manga-longa', 'calca');
        layerDetails.push({
          id: 'base',
          name: '🧸 CAMADA BASE',
          items: 'Body manga longa + calça culote',
          funcao: 'Contato direto com a pele, oferecendo conforto e ajudando a manter a temperatura corporal.',
          color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
        });
      } else {
        outfitSuggestions.push('Body de Manga Curta leve', 'Calça (mijão) de algodão');
        visualItems.push('body-manga-curta', 'calca');
        layerDetails.push({
          id: 'base',
          name: '🧸 CAMADA BASE',
          items: 'Body manga curta + calça de algodão',
          funcao: 'Contato direto com a pele, oferecendo conforto e ajudando a manter a temperatura corporal.',
          color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
        });
      }

      outfitSuggestions.push('Saco de dormir leve (cobertura fina e respirável, 0.5 a 1.0 TOG)');
      visualItems.push('saco-dormir-leve');
      layerDetails.push({
        id: 'sono',
        name: '😴 CAMADA DE SONO',
        items: 'Saco de dormir leve',
        funcao: 'Manter o bebê aquecido de forma segura durante o sono, substituindo cobertores soltos.',
        color: 'bg-[#F3EEF9] text-[#5B437C] border-[#DCCFE8]'
      });
    } else if (adjustedFeeling === 'fresquinho') {
      layerCount = 2; // (Body+Calca = 1) + Saco = 2 layers
      layersDescription = 'Proteção térmica equilibrada para manter o conforto do bebê sem excesso de roupas.';
      recommendedFabrics.push('Algodão Interlock ou suedine encorpado para as bases e Soft escovado médio para o saco');
      accessories.push('Meias quentinhas de algodão');

      outfitSuggestions.push('Body de Manga Longa de base', 'Calça culote confortável', 'Saco de dormir soft quentinho (isolamento moderado, ~1.5 TOG)');
      visualItems.push('body-manga-longa', 'calca', 'saco-dormir-soft');

      layerDetails.push({
        id: 'base',
        name: '🧸 CAMADA BASE',
        items: 'Body manga longa + calça culote',
        funcao: 'Contato direto com a pele, oferecendo conforto e ajudando a manter a temperatura corporal.',
        color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
      });

      layerDetails.push({
        id: 'sono',
        name: '😴 CAMADA DE SONO',
        items: 'Saco de dormir soft quentinho',
        funcao: 'Manter o bebê aquecido de forma segura durante o sono, substituindo cobertores soltos.',
        color: 'bg-[#F3EEF9] text-[#5B437C] border-[#DCCFE8]'
      });
    } else if (adjustedFeeling === 'frio') {
      layerCount = 3; // (Body+Calca = 1) + Macacao = 2 + Saco = 3 layers
      layersDescription = 'Uma combinação aconchegante para noites frias, ajudando seu bebê a permanecer confortável e protegido durante o sono.';
      recommendedFabrics.push('Soft escovado, plush macio e algodão de alta retenção térmica');
      accessories.push('Meias aconchegantes de plush');

      outfitSuggestions.push('Body de Manga Longa de toque macio', 'Calça confortável (mijão) como calça base', 'Macacão Soft ou Peluciado aconchegante', 'Saco de dormir plush com mangas de inverno (2.5 TOG)');
      visualItems.push('body-manga-longa', 'calca', 'macacao-soft', 'saco-dormir-plush');

      layerDetails.push({
        id: 'base',
        name: '🧸 CAMADA BASE',
        items: 'Body manga longa + calça confortável',
        funcao: 'Contato direto com a pele, oferecendo conforto e ajudando a manter a temperatura corporal do pequeno.',
        color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
      });

      layerDetails.push({
        id: 'aquecimento',
        name: '🔥 CAMADA DE AQUECIMENTO',
        items: 'Macacão soft aconchegante',
        funcao: 'Criar uma barreira térmica macia para reter com excelência o calor natural do corpo.',
        color: 'bg-[#FAF2EC] text-[#B96552] border-[#F2DCD0]'
      });

      layerDetails.push({
        id: 'sono',
        name: '😴 CAMADA DE SONO',
        items: 'Saco de dormir plush com mangas',
        funcao: 'Garante o aquecimento seguro a noite inteira, prevenindo resfriamentos sem embolar lençóis.',
        color: 'bg-[#F3EEF9] text-[#5B437C] border-[#DCCFE8]'
      });
    } else {
      layerCount = 3; // (Body+Calca = 1) + Macacao = 2 + Saco = 3 layers
      layersDescription = 'Uma combinação aconchegante para noites frias, ajudando seu bebê a permanecer confortável e protegido durante o sono.';
      recommendedFabrics.push('Plush denso aveludado, soft térmico espesso e algodão escovado na pele');
      accessories.push('Meias quentinhas e grossas');

      outfitSuggestions.push('Body de Manga Longa reforçado', 'Calça confortável (mijão) por baixo', 'Macacão Plush denso super aconchegante', 'Saco de dormir plush de inverno com mangas acolchoado (2.5 a 3.5 TOG)');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush', 'saco-dormir-plush');

      layerDetails.push({
        id: 'base',
        name: '🧸 CAMADA BASE',
        items: 'Body manga longa reforçado + calça confortável',
        funcao: 'Primeira camada de contato que retém a temperatura do corpo de modo seguro e macio.',
        color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
      });

      layerDetails.push({
        id: 'aquecimento',
        name: '🔥 CAMADA DE AQUECIMENTO',
        items: 'Macacão plush super aconchegante',
        funcao: 'Cria uma espessa barreira térmica ultra aveludada ideal contra as temperaturas mais baixas.',
        color: 'bg-[#FAF2EC] text-[#B96552] border-[#F2DCD0]'
      });

      layerDetails.push({
        id: 'sono',
        name: '😴 CAMADA DE SONO',
        items: 'Saco de dormir plush com mangas de inverno',
        funcao: 'Completa a segurança térmica, proporcionando isolamento profundo dispensando qualquer cobertor.',
        color: 'bg-[#F3EEF9] text-[#5B437C] border-[#DCCFE8]'
      });
    }
  } else {
    // Non-sleeping logic
    if (adjustedFeeling === 'muito-quente') {
      layerCount = 1;
      layersDescription = 'Proteção térmica equilibrada para manter o conforto do bebê sem excesso de roupas.';
      outfitSuggestions.push('Body de Manga Curta bem fininho');
      visualItems.push('body-manga-curta');
      recommendedFabrics.push('Algodão 100% leve, gaze ou cambraia');
      accessories.push('Nenhum acessório hoje. Deixe os pezinhos descalços!');

      layerDetails.push({
        id: 'base',
        name: '🧸 CAMADA BASE',
        items: 'Body de manga curta fininho',
        funcao: 'Garante o frescor direto na pele sob calor intenso do verão ou dia quente.',
        color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
      });
    } else if (adjustedFeeling === 'quente') {
      layerCount = 1;
      layersDescription = 'Proteção térmica equilibrada para manter o conforto do bebê sem excesso de roupas.';
      recommendedFabrics.push('Algodão Suedine bem macio');
      accessories.push('Pezinhos livres de meias para regular o calor naturalmente.');

      if (isNewborn) {
        outfitSuggestions.push('Body de Manga Longa fininho (por ser recém-nascido)');
        visualItems.push('body-manga-longa');
        layerDetails.push({
          id: 'base',
          name: '🧸 CAMADA BASE',
          items: 'Body manga longa fininho',
          funcao: 'Proteção delicada e confortável ideal para a pele fina de recém-nascido.',
          color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
        });
      } else {
        outfitSuggestions.push('Body de Manga Curta confortável');
        visualItems.push('body-manga-curta');
        layerDetails.push({
          id: 'base',
          name: '🧸 CAMADA BASE',
          items: 'Body manga curta confortável',
          funcao: 'Contato fresco e respirável de algodão.',
          color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
        });
      }
    } else if (adjustedFeeling === 'agradavel') {
      layerCount = 1; // (Body+Calca = 1 layer)
      layersDescription = 'Proteção térmica equilibrada para manter o conforto do bebê sem excesso de roupas.';
      recommendedFabrics.push('Algodão Suedine tradicional ou Malha canelada');
      accessories.push('Meias leves se sentir as extremidades geladinhas.');

      if (isNewborn) {
        outfitSuggestions.push('Body de Manga Longa + Calça confortável');
        visualItems.push('body-manga-longa', 'calca');
        layerDetails.push({
          id: 'base',
          name: '🧸 CAMADA BASE',
          items: 'Body manga longa + calça de algodão',
          funcao: 'Contato direto com a pele, oferecendo conforto e ajudando a manter a temperatura corporal.',
          color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
        });
      } else {
        outfitSuggestions.push('Body de Manga Curta + Calça (culote/mijão)');
        visualItems.push('body-manga-curta', 'calca');
        layerDetails.push({
          id: 'base',
          name: '🧸 CAMADA BASE',
          items: 'Body manga curta + calça culote',
          funcao: 'Contato direto com a pele, oferecendo conforto e ajudando a manter a temperatura corporal.',
          color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
        });
      }
    } else if (adjustedFeeling === 'fresquinho') {
      layerCount = 2; // (Body+Calca = 1) + Macacao = 2 layers
      layersDescription = 'Proteção térmica equilibrada para manter o conforto do bebê sem excesso de roupas.';
      recommendedFabrics.push('Algodão Interlock ou suedine encorpado');
      accessories.push('Meias confortáveis de algodão');

      outfitSuggestions.push('Body de Manga Longa de base', 'Calça confortável de algodão', 'Macacão de algodão leve por cima');
      visualItems.push('body-manga-longa', 'calca', 'macacao-algodao');

      layerDetails.push({
        id: 'base',
        name: '🧸 CAMADA BASE',
        items: 'Body manga longa + calça de algodão',
        funcao: 'Contato direto com a pele, oferecendo conforto e ajudando a manter a temperatura corporal.',
        color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
      });

      layerDetails.push({
        id: 'aquecimento',
        name: '🔥 CAMADA DE AQUECIMENTO',
        items: 'Macacão de algodão leve',
        funcao: 'Criar uma barreira térmica que ajuda a conservar o calor do corpo.',
        color: 'bg-[#FAF2EC] text-[#B96552] border-[#F2DCD0]'
      });
    } else if (adjustedFeeling === 'frio') {
      layerCount = 2; // (Body+Calca = 1) + Macacao = 2 layers
      layersDescription = 'Proteção térmica equilibrada para manter o conforto do bebê sem excesso de roupas.';
      recommendedFabrics.push('Plush de toque sedoso e Soft escovado');
      accessories.push('Meias quentinhas');
      if (isPasseando || (isNewborn && isWind)) {
        accessories.push('Touca macia protetora');
        visualItems.push('touca');
      }

      outfitSuggestions.push('Body de Manga Longa de base', 'Calça (mijão) macia por baixo', 'Macacão de algodão plush ou soft quentinho');
      visualItems.push('body-manga-longa', 'calca', 'macacao-soft');

      layerDetails.push({
        id: 'base',
        name: '🧸 CAMADA BASE',
        items: 'Body manga longa + calça culote',
        funcao: 'Contato direto com a pele, oferecendo conforto e ajudando a manter a temperatura corporal.',
        color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
      });

      layerDetails.push({
        id: 'aquecimento',
        name: '🔥 CAMADA DE AQUECIMENTO',
        items: 'Macacão soft ou plush quentinho',
        funcao: 'Criar uma barreira térmica macia para conservar o quentinho nos dias mais frios.',
        color: 'bg-[#FAF2EC] text-[#B96552] border-[#F2DCD0]'
      });
    } else {
      layerCount = 2; // (Body+Calca = 1) + Macacao = 2 layers
      layersDescription = 'Proteção térmica equilibrada para manter o conforto do bebê sem excesso de roupas.';
      recommendedFabrics.push('Plush denso, soft térmico e algodão escovado');
      accessories.push('Meias bem quentinhas grossas');
      if (isPasseando || isNewborn || isWind) {
        accessories.push('Touca de plush cobrindo as orelhinhas', 'Luvas macias como item de preferência');
        visualItems.push('touca', 'luvas');
      }

      outfitSuggestions.push('Body de Manga Longa quentinho', 'Calça (mijão) confortável', 'Macacão Plush reforçado');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush');

      layerDetails.push({
        id: 'base',
        name: '🧸 CAMADA BASE',
        items: 'Body manga longa + calça mijão',
        funcao: 'Contato direto com a pele, oferecendo conforto e ajudando a manter a temperatura corporal.',
        color: 'bg-[#EDF4F9] text-blue-750 border-blue-200'
      });

      layerDetails.push({
        id: 'aquecimento',
        name: '🔥 CAMADA DE AQUECIMENTO',
        items: 'Macacão plush reforçado',
        funcao: 'Criar uma barreira térmica espessa com toque aveludado resistente ao inverno rigoroso.',
        color: 'bg-[#FAF2EC] text-[#B96552] border-[#F2DCD0]'
      });
    }
  }

  // SPECIAL COOLO AND SLING RULE: REDUCE LAYER OR ADJUST CAPABILITY
  if (isColoSling) {
    const aquecimentoIndex = layerDetails.findIndex(layer => layer.id === 'aquecimento');
    if (aquecimentoIndex !== -1) {
      layerDetails.splice(aquecimentoIndex, 1);
    }
    // Re-calculate layerCount based on active details!
    layerCount = layerDetails.length;
    layersDescription = 'Ajustado para o aconchego do colo ou sling, onde o toque com o corpo dos pais atua substituindo as roupas.';
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
    visualItems,
    layerDetails
  };
}
