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
      interpretationText = 'Até 11°C (8°C a 11°C) - Dia ou noite de inverno com frio rigoroso!';
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
  const outfitSuggestions: string[] = [];
  const recommendedFabrics: string[] = [];
  const accessories: string[] = [];
  const visualItems: string[] = [];
  let layerCount = 1;
  let layersDescription = '';
  const layerDetails: LayerDetail[] = [];

  // CORE CONSULTANCY GRID OF LAYERS & COMPOSITION
  if (isSleeping) {
    let sleepTemp = temperature;
    if (sleepTemp === null) {
      if (adjustedFeeling === 'muito-quente') sleepTemp = 27;
      else if (adjustedFeeling === 'quente') sleepTemp = 24.5;
      else if (adjustedFeeling === 'agradavel') sleepTemp = 21.5;
      else if (adjustedFeeling === 'fresquinho') sleepTemp = 18.5;
      else if (adjustedFeeling === 'frio') sleepTemp = 15.5;
      else sleepTemp = 9; // muito-frio
    }

    if (sleepTemp > 26) {
      layersDescription = 'Roupas extremamente leves para noites de calor intenso acima de 26°C, mantendo um frescor excelente para um sono seguro.';
      outfitSuggestions.push('Body manga curta', 'Saco de dormir leve (com ou sem mangas)');
      visualItems.push('body-manga-curta');
      recommendedFabrics.push('Algodão leve e respirável', 'Tecido macio e confortável');
      
      layerDetails.push({
        id: 'base',
        name: '🟦 Camada Base',
        items: 'Body manga curta',
        funcao: 'Contato direto e suave com o corpinho, proporcionando frescor máximo para uma noite tranquila.',
        color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
      });
    } else if (sleepTemp >= 23) {
      layersDescription = 'Sugerido com foco em proteção térmica equilibrada em noites de calor entre 23°C e 25°C.';
      outfitSuggestions.push('Body manga curta', 'Calça', 'Saco de dormir leve (com ou sem mangas)');
      visualItems.push('body-manga-curta', 'calca', 'saco-dormir-leve');
      recommendedFabrics.push('Algodão leve e respirável', 'Tecido macio e confortável');

      layerDetails.push({
        id: 'base',
        name: '🟦 Camada Base',
        items: 'Body manga curta + Calça',
        funcao: 'Toque inicial de algodão, ideal para conforto sem excesso térmico.',
        color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
      });

      layerDetails.push({
        id: 'sono',
        name: '🟪 Camada de Sono Seguro',
        items: 'Saco de dormir leve (com ou sem mangas)',
        funcao: 'Garante que o bebê fique coberto e protegido a noite inteira, podendo ser com ou sem mangas.',
        color: 'bg-[#F3EEF9]/70 text-[#6B21A8] border-[#E9D5FF]'
      });
    } else if (sleepTemp >= 20) {
      layersDescription = 'Recomendação ideal focada em proteção térmica segura para noites amenas na faixa de 20°C a 22°C.';
      outfitSuggestions.push('Body manga longa', 'Calça', 'Saco de dormir leve (com ou sem mangas)');
      visualItems.push('body-manga-longa', 'calca', 'saco-dormir-leve');
      recommendedFabrics.push('Algodão leve e respirável', 'Tecido macio e confortável');

      layerDetails.push({
        id: 'base',
        name: '🟦 Camada Base',
        items: 'Body manga longa + Calça',
        funcao: 'Toque protetor que recobre as pernas e bracinhos de forma suave.',
        color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
      });

      layerDetails.push({
        id: 'sono',
        name: '🟪 Camada de Sono Seguro',
        items: 'Saco de dormir leve (com ou sem mangas)',
        funcao: 'Auxilia na segurança mantendo o corpinho em temperatura estável, podendo ser com ou sem mangas.',
        color: 'bg-[#F3EEF9]/70 text-[#6B21A8] border-[#E9D5FF]'
      });
    } else if (sleepTemp >= 17) {
      layersDescription = 'Aconchego excelente para noites frescas de meia-estação entre 17°C e 19°C.';
      outfitSuggestions.push('Body manga longa', 'Calça', 'Saco de dormir quentinho com mangas');
      visualItems.push('body-manga-longa', 'calca', 'saco-dormir-soft');
      recommendedFabrics.push('Algodão leve e respirável', 'Tecido macio e confortável');

      layerDetails.push({
        id: 'base',
        name: '🟦 Camada Base',
        items: 'Body manga longa + Calça',
        funcao: 'Cria o contato inicial macio e repara o corpinho sob o saco.',
        color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
      });

      layerDetails.push({
        id: 'sono',
        name: '🟪 Camada de Sono Seguro',
        items: 'Saco de dormir quentinho com mangas',
        funcao: 'Garante o conforto ideal mantendo a cobertura constante a noite toda.',
        color: 'bg-[#F3EEF9]/70 text-[#6B21A8] border-[#E9D5FF]'
      });
    } else if (sleepTemp >= 15) {
      layersDescription = 'Combinação extra acolhedora com três camadas planejadas para noites frias de inverno entre 15°C e 16°C.';
      outfitSuggestions.push('Body manga longa', 'Calça', 'Macacão soft', 'Saco de dormir quentinho com mangas');
      visualItems.push('body-manga-longa', 'calca', 'macacao-soft', 'saco-dormir-soft');
      recommendedFabrics.push('Algodão leve e respirável', 'Tecido macio e confortável');

      layerDetails.push({
        id: 'base',
        name: '🟦 Camada Base',
        items: 'Body manga longa + Calça',
        funcao: 'Primeira pele que retém o calor corporal em contato com a pele.',
        color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
      });

      layerDetails.push({
        id: 'aquecimento',
        name: '🟧 Camada de Aquecimento',
        items: 'Macacão soft',
        funcao: 'Adiciona excelente barreira fofinha contra correntes frias.',
        color: 'bg-[#FAF2EC]/70 text-[#C2410C] border-[#FED7AA]'
      });

      layerDetails.push({
        id: 'sono',
        name: '🟪 Camada de Sono Seguro',
        items: 'Saco de dormir quentinho com mangas',
        funcao: 'Proteção extra mantendo o aconchego no berço.',
        color: 'bg-[#F3EEF9]/70 text-[#6B21A8] border-[#E9D5FF]'
      });
    } else if (sleepTemp >= 12) {
      layersDescription = 'Camadas muito acolhedoras recomendadas para noites frias de inverno na faixa de 12°C a 14°C.';
      outfitSuggestions.push('Body manga longa', 'Calça', 'Macacão plush', 'Saco de dormir quentinho com mangas');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush', 'saco-dormir-plush');
      recommendedFabrics.push('Algodão leve e respirável', 'Tecido macio e confortável');

      layerDetails.push({
        id: 'base',
        name: '🟦 Camada Base',
        items: 'Body manga longa + Calça',
        funcao: 'Combinação inicial suave em contato direto com a pele do bebê.',
        color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
      });

      layerDetails.push({
        id: 'aquecimento',
        name: '🟧 Camada de Aquecimento',
        items: 'Macacão plush',
        funcao: 'Camada intermediária macia e aveludada excelente para reter o quentinho.',
        color: 'bg-[#FAF2EC]/70 text-[#C2410C] border-[#FED7AA]'
      });

      layerDetails.push({
        id: 'sono',
        name: '🟪 Camada de Sono Seguro',
        items: 'Saco de dormir quentinho com mangas',
        funcao: 'Segurança absoluta e isolamento acolhedor sem risco do bebê se descobrir.',
        color: 'bg-[#F3EEF9]/70 text-[#6B21A8] border-[#E9D5FF]'
      });
    } else {
      layersDescription = 'Máxima proteção térmica em camadas de feto para noites rigorosas de frio intenso em temperaturas Até 11°C (8°C a 11°C).';
      outfitSuggestions.push('Body manga longa', 'Calça', 'Macacão plush', 'Saco de dormir quentinho com mangas');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush', 'saco-dormir-plush');
      recommendedFabrics.push('Algodão leve e respirável', 'Tecido macio e confortável');

      layerDetails.push({
        id: 'base',
        name: '🟦 Camada Base',
        items: 'Body manga longa + Calça',
        funcao: 'Primeira pele super macia e de toque encorpado.',
        color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
      });

      layerDetails.push({
        id: 'aquecimento',
        name: '🟧 Camada de Aquecimento',
        items: 'Macacão plush',
        funcao: 'Barreira cozy aveludada que dá o suporte térmico perfeito.',
        color: 'bg-[#FAF2EC]/70 text-[#C2410C] border-[#FED7AA]'
      });

      layerDetails.push({
        id: 'sono',
        name: '🟪 Camada de Sono Seguro',
        items: 'Saco de dormir quentinho com mangas',
        funcao: 'Proteção sob máxima segurança e conforto livre de cobertas.',
        color: 'bg-[#F3EEF9]/70 text-[#6B21A8] border-[#E9D5FF]'
      });
    }
  } else {
    // Non-sleeping logic (Bebê Acordado / Atividade)
    if (adjustedFeeling === 'muito-quente') {
      layersDescription = 'Uma combinação fresquinha para manter o bebê super confortável no dia a dia em dias de calor.';
      outfitSuggestions.push('Body manga curta');
      visualItems.push('body-manga-curta');
      recommendedFabrics.push('Algodão leve e respirável', 'Tecido macio e confortável');

      layerDetails.push({
        id: 'base',
        name: '🟦 Camada Base',
        items: 'Body manga curta',
        funcao: 'Proporciona leveza máxima tocando suavemente as costas e o peitinho do bebê.',
        color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
      });
    } else if (adjustedFeeling === 'quente') {
      layersDescription = 'Proteção térmica equilibrada para manter o conforto do bebê sem excesso de roupas.';
      recommendedFabrics.push('Algodão leve e respirável', 'Tecido macio e confortável');

      if (isNewborn) {
        outfitSuggestions.push('Body manga longa');
        visualItems.push('body-manga-longa');
        layerDetails.push({
          id: 'base',
          name: '🟦 Camada Base',
          items: 'Body manga longa',
          funcao: 'Conforto e proteção perfeita para a pelezinha sensível do recém-nascido.',
          color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
        });
      } else {
        outfitSuggestions.push('Body manga curta');
        visualItems.push('body-manga-curta');
        layerDetails.push({
          id: 'base',
          name: '🟦 Camada Base',
          items: 'Body manga curta',
          funcao: 'Toque fresco de algodão ideal para dar liberdade e bem-estar.',
          color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
        });
      }
    } else if (adjustedFeeling === 'agradavel') {
      layersDescription = 'Proteção leve e equilibrada para o bebê se divertir e se movimentar com total liberdade de forma aconchegante.';
      recommendedFabrics.push('Algodão leve e respirável', 'Tecido macio e confortável');

      if (isNewborn) {
        outfitSuggestions.push('Body manga longa', 'Calça');
        visualItems.push('body-manga-longa', 'calca');
        layerDetails.push({
          id: 'base',
          name: '🟦 Camada Base',
          items: 'Body manga longa + Calça',
          funcao: 'Toque carinhoso mantendo perninhas e bracinhos aconchegados com segurança.',
          color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
        });
      } else {
        outfitSuggestions.push('Body manga curta', 'Calça');
        visualItems.push('body-manga-curta', 'calca');
        layerDetails.push({
          id: 'base',
          name: '🟦 Camada Base',
          items: 'Body manga curta + Calça',
          funcao: 'Garante o conforto e mobilidade completa do bebê para brincar e se mover.',
          color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
        });
      }
    } else if (adjustedFeeling === 'fresquinho') {
      layersDescription = 'Combinação confortável e aconchegante, ideal para proteger o bebê com total suavidade em momentos fresquinhos.';
      recommendedFabrics.push('Algodão leve e respirável', 'Tecido macio e confortável');

      outfitSuggestions.push('Body manga longa', 'Calça', 'Macacão de algodão');
      visualItems.push('body-manga-longa', 'calca', 'macacao-algodao');

      layerDetails.push({
        id: 'base',
        name: '🟦 Camada Base',
        items: 'Body manga longa + Calça',
        funcao: 'Proteção carinhosa de primeiro contato no corpinho para reter a temperatura com delicadeza.',
        color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
      });

      layerDetails.push({
        id: 'aquecimento',
        name: '🟧 Camada de Aquecimento',
        items: 'Macacão de algodão',
        funcao: 'Adiciona um toque extra confortável sobre a roupa de baixo.',
        color: 'bg-[#FAF2EC]/70 text-[#C2410C] border-[#FED7AA]'
      });
    } else if (adjustedFeeling === 'frio') {
      layersDescription = 'Aconchego extra para que o bebê permaneça bem protegido e confortável ao longo das horas frias.';
      recommendedFabrics.push('Algodão leve e respirável', 'Tecido macio e confortável');
      
      if (isPasseando || (isNewborn && isWind)) {
        accessories.push('Touca macia protetora');
        visualItems.push('touca');
      }

      outfitSuggestions.push('Body manga longa', 'Calça', 'Macacão soft');
      visualItems.push('body-manga-longa', 'calca', 'macacao-soft');

      layerDetails.push({
        id: 'base',
        name: '🟦 Camada Base',
        items: 'Body manga longa + Calça',
        funcao: 'Primeira pele macia e aconchegante que mantém o bebê agasalhado.',
        color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
      });

      layerDetails.push({
        id: 'aquecimento',
        name: '🟧 Camada de Aquecimento',
        items: 'Macacão soft',
        funcao: 'Proteção muito fofinha perfeita para o dia a dia nos momentos mais frios.',
        color: 'bg-[#FAF2EC]/70 text-[#C2410C] border-[#FED7AA]'
      });
    } else {
      layersDescription = 'Máximo aconchego e proteção térmica para dias frios e gelados, garantindo que ele permaneça bem quentinho e feliz.';
      recommendedFabrics.push('Algodão leve e respirável', 'Tecido macio e confortável');
      
      if (isPasseando || isNewborn || isWind) {
        accessories.push('Touca cobrindo as orelhinhas', 'Luvas macias infantis');
        visualItems.push('touca', 'luvas');
      }

      outfitSuggestions.push('Body manga longa', 'Calça', 'Macacão plush');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush');

      layerDetails.push({
        id: 'base',
        name: '🟦 Camada Base',
        items: 'Body manga longa + Calça',
        funcao: 'Retém o quentinho com toque macio inicial direto na pele.',
        color: 'bg-[#EDF4F9]/70 text-blue-800 border-blue-200'
      });

      layerDetails.push({
        id: 'aquecimento',
        name: '🟧 Camada de Aquecimento',
        items: 'Macacão plush',
        funcao: 'Barreira aveludada extra de total conforto contra o frio rigoroso.',
        color: 'bg-[#FAF2EC]/70 text-[#C2410C] border-[#FED7AA]'
      });
    }
  }

  // SPECIAL COOLO AND SLING RULE: REDUCE LAYER OR ADJUST CAPABILITY
  if (isColoSling) {
    const aquecimentoIndex = layerDetails.findIndex(layer => layer.id === 'aquecimento');
    if (aquecimentoIndex !== -1) {
      layerDetails.splice(aquecimentoIndex, 1);
    }
    // Re-calculate layersDescription & layers based on parents' proximity!
    layersDescription = 'Ajustada para o aconchego do colo ou sling, onde a proximidade e o calor dos pais servem como uma camada extra natural.';
  }

  // Active layerCount is exactly the number of distinct structural layers!
  layerCount = layerDetails.length;

  // ALERTS & RECOMMENDATIONS WRITTEN IN WARM MOM-TO-MOM TONE
  const importantAlerts = [
    'Segurança Prática do Sono: Nunca coloque toucas ou gorros enquanto seu bebê dorme sem supervisão. A cabeça é o local por onde eles regulam o próprio calor e há risco de asfixia mecânica.',
    'Nunca utilize cobertores ou lençóis soltos no berço para bebês sem supervisão direta. Há risco de cobrir acidentalmente o rostinho.',
    'Excelente Alternativa Segura: Para os momentos de soninho, use sempre um saco de dormir de acordo com o frio atual, eliminando a necessidade de cobertor.'
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
    consultSummary = `Para a hora do soninho seguro de ${ageGroupText}, preparamos um look focado no conforto e na segurança. Como o bebê não deve dormir de touca nem usar cobertor solto sem supervisão, a melhor alternativa é adotar um bom saco de dormir! Ele envolve o bebê como um abraço seguro a noite inteira 💛`;
  } else if (isColoSling) {
    consultSummary = `Você escolheu colo ou sling para ${ageGroupText}! Como o contato direto com o seu corpo gera muito aconchego natural e aquece bastante o bebê, reduzimos uma camada da recomendação oficial. Fique atenta para aproveitar bem esse chamego aconchegante!`;
  } else if (isPasseando) {
    consultSummary = `Para o passeio ao ar livre de ${ageGroupText}, o mais importante é proteger extremidades caso surjam brisas frias indesejadas pelo caminho. Leve sempre uma touca prática na bolsa!`;
  } else {
    consultSummary = `Para o dia a dia de ${ageGroupText} in ambiente doméstico, focamos em conforto puro. O segredo é dar liberdade para brincar e se mover livremente com tecidos saudáveis.`;
  }

  if (isAC) {
    consultSummary += ' Como o ar-condicionado costuma resfriar o ambiente e produzir vento contínuo, a roupinha foi recomendada para proteger o peito e evitar friagens diretas.';
  } else if (isWind) {
    consultSummary += ' Com esse vento frio de hoje, manter os membros protegidos de forma adorável ajudará a reter o quentinho.';
  }

  if (temperature !== null) {
    consultSummary += ` A temperatura aproximada de ${temperature}°C foi considerada para refinar a sugestão.`;
  }

  cozyParagraphs.push(consultSummary);

  if (isSleeping) {
    cozyParagraphs.push(
      'Entenda de forma simples as categorias de sacos de dormir:\n' +
      '• 😴 Saco de dormir leve (com ou sem mangas): Uma camada leve de proteção para o sono, feita com tecidos leves e respiráveis (pode ser tanto com mangas quanto sem mangas, adaptando-se ao que você já tem em casa). Pode ser utilizado em noites de temperatura agradável ou ambientes com ar-condicionado.\n' +
      '• ❄️ Saco de dormir quentinho com mangas: Indicado para noites frias, com tecidos mais aconchegantes, oferecendo maior proteção térmica durante o sono e evitando o uso de cobertores soltos.'
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
    adjustedFeeling,
    visualItems,
    layerDetails
  };
}
