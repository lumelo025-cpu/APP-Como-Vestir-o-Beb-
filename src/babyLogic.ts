/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuestionnaireAnswers, RecommendationResult } from './types.ts';

/**
 * Interprets the questionnaire input and generates a cozy, highly personalized
 * recommendation for dressing the baby.
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

  // 1. Determine Perceived Temperature and Category
  // Wind chill adjustment
  let perceivedTemp = temperature;
  if (hasWind && location === 'externo') {
    perceivedTemp -= 2.5; // Wind chill factor feels colder
  }

  // Sensitivity adjustment
  if (sensitivity === 'frio') {
    perceivedTemp -= 1.5; // Feels colder for this baby
  } else if (sensitivity === 'calor') {
    perceivedTemp += 1.5; // Feels warmer
  }

  let tempCategory = '';
  let tempDescription = '';
  let severity: RecommendationResult['severity'] = 'mild';

  if (perceivedTemp < 15) {
    tempCategory = '❄️ Clima Muito Frio';
    tempDescription = 'O termômetro está baixo e o ar está bem gelado. Proteção total!';
    severity = 'extreme-cold';
  } else if (perceivedTemp >= 15 && perceivedTemp < 19) {
    tempCategory = '🍃 Clima Frio/Fresco';
    tempDescription = 'Aquele ventinho mais fresco que pede camadas bem aconchegantes.';
    severity = 'cold';
  } else if (perceivedTemp >= 19 && perceivedTemp < 23) {
    tempCategory = '☀️ Clima Agradável';
    tempDescription = 'Temperatura gostosa, nem muito fria nem muito quente. Ideal para passeios.';
    severity = 'mild';
  } else if (perceivedTemp >= 23 && perceivedTemp < 27) {
    tempCategory = '🌤️ Clima Morno';
    tempDescription = 'Ambiente aquecido. Roupas mais fluídas e leves são a melhor pedida.';
    severity = 'warm';
  } else if (perceivedTemp >= 27 && perceivedTemp < 31) {
    tempCategory = '🔥 Clima Quente';
    tempDescription = 'Calor perceptível. Priorize tecidos extremamente respiráveis para o bebê.';
    severity = 'hot';
  } else {
    tempCategory = '🌡️ Clima Extremamente Quente';
    tempDescription = 'Muito calor! Todo cuidado é pouco com a hidratação e excesso de tecidos.';
    severity = 'extreme-hot';
  }

  // 2. Determine Layer Strategy
  // Base layers calculated from perceived temperature
  let recommendedLayers = 2;
  if (perceivedTemp >= 31) {
    recommendedLayers = 1; // absolute minimum, light romper or just diaper at home
  } else if (perceivedTemp >= 25 && perceivedTemp < 31) {
    recommendedLayers = 1; // 1 light layer
  } else if (perceivedTemp >= 21 && perceivedTemp < 25) {
    recommendedLayers = 2; // e.g. thin bodysuit + light knit romper or pants
  } else if (perceivedTemp >= 16 && perceivedTemp < 21) {
    recommendedLayers = 2; // 2 cozy layers (long bodysuit + overalls/pants)
  } else {
    // perceivedTemp < 16
    recommendedLayers = 3; // 3 layers (thermal or body + middle romper + warm outer cover/jacket)
  }

  // Adjustments based on Age
  // Newborns (recém-nascidos) are less active and don't regulate temperature well.
  // Generally they need 1 extra layer than adults/older babies, unless it is already hot.
  let ageModifierText = '';
  if (age === 'recem-nascido') {
    if (perceivedTemp < 25) {
      recommendedLayers = Math.min(3, recommendedLayers + 1);
      ageModifierText = 'Como seu pacotinho é um recém-nascido, ele ainda está aprendendo a regular a própria temperatura corporal e precisa de atenção redobrada com as extremidades.';
    } else {
      ageModifierText = 'Mesmo sendo recém-nascido, o dia está bem quente! Mantenha a roupinha super leve para evitar brotoejas e superaquecimento.';
    }
  } else if (age === '0-3-meses') {
    if (perceivedTemp < 20) {
      recommendedLayers = Math.max(2, recommendedLayers);
    }
  }

  // Adjustments based on State / Context
  // Sling and Colo warm up the baby immensely due to skin-to-skin and parent's body temperature.
  let contextModifierText = '';
  if (state === 'sling-colo') {
    recommendedLayers = Math.max(1, recommendedLayers - 1);
    contextModifierText = 'O colo quente e o tecido do sling funcionam como uma camada bônus de aquecimento natural. Por isso, reduzimos uma camada da recomendação padrão para manter o bebê fresco e feliz.';
  } else if (state === 'dormindo') {
    contextModifierText = 'Para um sono seguro e tranquilo, lembre-se de que mantas soltas no berço são contraindicadas para evitar riscos de sufocamento. O melhor é usar roupas integradas e sacos de dormir higiênicos.';
  } else if (state === 'ar-condicionado') {
    contextModifierText = 'O ar-condicionado gera um ventinho gelado contínuo e resseca o ambiente. Mesmo se o termômetro não estiver tão baixo, proteja as articulações e o peito com mangas longas e evite o fluxo direto do ar.';
  }

  // Adjustments based on Period (day vs night)
  let periodText = '';
  if (period === 'noite') {
    periodText = 'Durante a noite, o metabolismo do bebê diminui e a temperatura do corpo tende a cair sutilmente. Além disso, as madrugadas costumam registrar quedas bruscas de temperatura.';
  }

  // Ensure logical ceilings so we don't overbundle.
  // Overbundling is a risk factor for SIDS and discomfort.
  if (recommendedLayers > 3) {
    recommendedLayers = 3;
  }
  if (recommendedLayers < 1) {
    recommendedLayers = 1;
  }

  // Create the precise layers description
  let layersDescription = '';
  if (recommendedLayers === 1) {
    layersDescription = 'Apenas 1 camada leve é totalmente suficiente. Nada de excessos!';
  } else if (recommendedLayers === 2) {
    layersDescription = '2 camadas confortáveis: 1 camada de base fina + 1 camada externa protetora.';
  } else {
    layersDescription = '3 camadas protetoras: 1 camada térmica de toque suave + 1 camada intermediária + 1 casaco ou macacão grosso quentinho.';
  }

  // 3. Clothes Suggestion logic based on temperature and age
  const outfitSuggestions: string[] = [];
  const recommendedFabrics: string[] = [];
  const accessories: string[] = [];
  const importantAlerts: string[] = [];
  const cozyParagraphs: string[] = [];
  const extraTips: string[] = [];

  // Outfit composition according to the exact temperature rules:
  if (perceivedTemp > 26) {
    // TEMPERATURAS QUENTES (acima de 26°C)
    outfitSuggestions.push('Body de manga curta fino e respirável');
    outfitSuggestions.push('Macaquinho leve (opcional para passeios)');
    recommendedFabrics.push('Algodão 100% hipoalergênico', 'Musseline de algodão', 'Fibra de bambu');
    
    if (state === 'dormindo') {
      outfitSuggestions.push('Saco de dormir leve (verão)');
    }
  } else if (perceivedTemp >= 22 && perceivedTemp <= 26) {
    // TEMPERATURAS AMENAS (22°C a 26°C)
    outfitSuggestions.push('Body manga curta ou body manga longa leve');
    outfitSuggestions.push('Calça leve (mijão) confortável');
    outfitSuggestions.push('Macacão de algodão (leve) com fecho prático');
    recommendedFabrics.push('Algodão Suedine', 'Algodão Pima ou Egípcio');
    
    if (state === 'dormindo') {
      outfitSuggestions.push('Saco de dormir leve (verão)');
    }
  } else if (perceivedTemp >= 18 && perceivedTemp < 22) {
    // TEMPERATURAS FRESCAS (18°C a 21°C)
    outfitSuggestions.push('Body manga longa macio');
    outfitSuggestions.push('Calça protetora confortável');
    outfitSuggestions.push('Macacão soft/peluciado (meia-estação)');
    recommendedFabrics.push('Algodão Interlock encorpado', 'Soft leve escovado');
    
    if (state === 'dormindo') {
      outfitSuggestions.push('Saco de dormir soft (meia-estação)');
    }
  } else if (perceivedTemp >= 14 && perceivedTemp < 18) {
    // TEMPERATURAS FRIAS (14°C a 17°C)
    outfitSuggestions.push('Body manga longa térmico ou de algodão grosso');
    outfitSuggestions.push('Calça culote com pé reversível');
    outfitSuggestions.push('Macacão soft/peluciado (meia-estação) aconchegante');
    recommendedFabrics.push('Microfleece térmico', 'Algodão escovado', 'Plush macio');
    
    if (state === 'dormindo') {
      outfitSuggestions.push('Saco de dormir soft (meia-estação) para aconchego contínuo');
    }
  } else {
    // TEMPERATURAS MUITO FRIAS (abaixo de 14°C)
    outfitSuggestions.push('Segunda pele térmica respirável (Camada extra essencial)');
    outfitSuggestions.push('Calça culote de algodão sob o macacão');
    outfitSuggestions.push('Macacão plush (inverno intenso) atoalhado e bem quentinho');
    recommendedFabrics.push('Plush de microfibra de alta densidade', 'Soft térmico grosso', 'Malhas com lã de algodão');
    
    if (state === 'dormindo') {
      outfitSuggestions.push('Saco de dormir plush com mangas (inverno) - proteção total e segura');
    }
  }

  // Accessories matching temperature and context
  if (perceivedTemp < 14) {
    accessories.push('Touca quentinha protetora');
    accessories.push('Meias térmicas ou plush');
    accessories.push('Luvas macias protetoras');
  } else if (perceivedTemp >= 14 && perceivedTemp < 18) {
    accessories.push('Meias aconchegantes');
    accessories.push('Touca de algodão macio (recomendado especialmente para recém-nascidos e saídas)');
  } else if (perceivedTemp >= 18 && perceivedTemp < 22) {
    accessories.push('Meias leves protetoras');
  } else if (perceivedTemp >= 22 && perceivedTemp <= 26) {
    accessories.push('Sapatinho de tecido ou meias bem fininhas para proteger as solas');
  } else {
    // Warm / Hot
    if (location === 'externo') {
      accessories.push('Chapéu de sol leve com proteção UV');
    } else {
      accessories.push('Deixe os pezinhos descalços em casa para ajudar o bebê a regular a temperatura naturalmente!');
    }
  }

  // Specific alerts based on state
  if (state === 'dormindo') {
    importantAlerts.push('Mantenha o berço livre de perigos! Retire cobertores, mantas soltas, pelúcias e protetores de berço almofadados. Eles aumentam muito o risco de sufocamento acidental.');
    if (perceivedTemp < 22) {
      importantAlerts.push('Substitua cobertores comuns por um Saco de Dormir (Wearable Blanket) adequado para a idade e com o índice TOG correspondente ao clima atual.');
    }
    importantAlerts.push('A temperatura ideal do quarto do bebê para o sono seguro fica entre 18°C e 22°C.');
  }

  if (perceivedTemp >= 27) {
    importantAlerts.push('Alerta de Brotoeja e Superaquecimento: O suor em excesso obstrui as glândulas sudoríparas do bebê. Mantenha as dobras limpas, use tecidos finos de algodão e evite sobreposição.');
    importantAlerts.push('Ofereça amamentação em livre demanda para manter seu bebê perfeitamente hidratado. Se ele tiver mais de 6 meses, água fresca é muito importante!');
  }

  if (perceivedTemp <= 14) {
    importantAlerts.push('Alerta de Hipotermia: As extremidades do bebê esfriam rápido. Verifique com frequência se a cabecinha e o peito estão mornos.');
    if (location === 'externo') {
      importantAlerts.push('O vento frio rouba o calor rapidamente. Se estiver ao ar livre, utilize o protetor de vento do carrinho de bebê.');
    }
  }

  // Adding the vital alert that must be in every outcome
  importantAlerts.push('Nunca se baseie pelas mãos ou pés do bebê para saber se ele tem frio. É perfeitamente normal que as extremidades sejam mais frias pela circulação periférica em desenvolvimento. Sinta com calma a nuca ou o peitinho do bebê.');

  // Create human, warm paragraphs (cozyParagraphs)
  // Paragraph 1: Intro tailored to context
  let introPara = '';
  const ageLabel = {
    'recem-nascido': 'seu recém-nascido querido',
    '0-3-meses': 'seu bebezinho de poucos meses',
    '3-6-meses': 'seu bebê que já está descobrindo o mundo',
    '6-12-meses': 'seu bebê ativo de quase 1 ano',
    'mais-de-1-ano': 'seu pequeno tagarela aventureiro'
  }[age];

  if (state === 'dormindo') {
    introPara = `Bebê dormindo é sinônimo de paz no coração, não é mesmo? Para que o soninho de ${ageLabel} transcorra com absoluta segurança e conforto térmico nesta temperatura de ${temperature}°C, preparamos uma vestimenta sob medida.`;
  } else if (state === 'sling-colo') {
    introPara = `Ah, o quentinho do colo! Carregar ${ageLabel} no sling ou juntinho de você é maravilhoso para o apego seguro. Como o seu corpo funciona como um aquecedor natural, regulamos a roupa para que fiquem confortáveis sem suar.`;
  } else if (state === 'passeando') {
    introPara = `Que gostoso sair para passear com ${ageLabel}! Para curtir o passeio externo com tranquilidade sob ${temperature}°C, organizamos peças fáceis de vestir ou remover se o vento mudar rapidamente.`;
  } else if (state === 'ar-condicionado') {
    introPara = `Em ambientes climatizados com ar-condicionado, precisamos blindar contra as rajadas de ar frio e desidratação. Preparamos uma combinação que protege ${ageLabel} da corrente direta fria.`;
  } else {
    // acordado-casa
    introPara = `Para um dia gostoso em casa, o melhor é focar na máxima mobilidade e conforto para seu bebê brincar, rolar e se esticar à vontade, sem passar frio nem acumular suor desnecessário.`;
  }
  cozyParagraphs.push(introPara);

  // Paragraph 2: Clothes prescription
  let prescriptionPara = '';
  if (perceivedTemp > 26) {
    prescriptionPara = `Para esta faixa de calor (${temperature}°C), ${ageModifierText || 'o corpo de seu bebê precisa transpirar livremente.'} Recomendamos deixar seu bebê com apenas 1 camada super leve. Um macaquinho regata fininho ou até mesmo apenas um body curto de algodão é a fórmula ideal para mantê-lo sorridente e fresco.`;
  } else if (perceivedTemp >= 18 && perceivedTemp <= 26) {
    prescriptionPara = `Para este clima (${temperature}°C), o ideal é montar um look inteligente com camisas macias de algodão respirável de 1 ou 2 camadas. ${periodText} ${ageModifierText} Comece com um body de algodão macio encostado na pele de seu bebê para segurar o suor e um macacão confortável por cima.`;
  } else {
    // cold
    prescriptionPara = `Está bem frio hoje (${temperature}°C) e todo agasalho é bem-vindo. ${periodText} ${ageModifierText} O segredo são as camadas protetoras: primeiro, use um body manga longa macio com mijão de algodão ou segunda pele térmica como uma excelente barreira protetora contra vento. Por cima, vista um lindo macacão soft ou plush super aconchegante em seu bebê.`;
  }
  if (contextModifierText) {
    prescriptionPara += ` ${contextModifierText}`;
  }
  cozyParagraphs.push(prescriptionPara);

  // Paragraph 3: Soothing close
  let maternalClose = `Cada bebê é único de verdade: alguns são mais calorentos e outros suspiram por mais aconchego. Por isso, de hora em hora, passe a pontinha dos seus dedos na nuca ou nas costinhas dele. Se notar que está úmido ou muito quente, remova uma camada. Se sentir a pele gelada, adicione um toque de calor. Você está indo super bem! Confie no seu instinto cuidando de seu bebê com todo esse amor.`;
  cozyParagraphs.push(maternalClose);

  // 4. Extra tips if user checked 'Sim'
  if (wantsExtras) {
    extraTips.push('Evite comprar roupas com excesso de botões nas costas ou golas muito apertadas, pois machucam ou irritam o bebê deitado.');
    extraTips.push('Dica de Lavagem: Use sabão neutro próprio para bebê (de coco ou glicerina) e evite amaciantes com perfumes fortes nos primeiros meses para prevenir dermatites.');
    extraTips.push('Sempre corte as etiquetas internas das roupinhas novas que entram em contato direto com a pele do bebê para evitar coceiras chatas.');
    if (perceivedTemp < 20) {
      extraTips.push('Ao dar banho em dias mais frios, deixe o quarto pré-aquecido e tenha a toalha-fralda com capuz imediatamente à mão para evitar choque térmico.');
    } else if (perceivedTemp >= 27) {
      extraTips.push('Banhos mornos rápidos e sem sabonete em excesso ajudam a refrescar o bebê no topo do calor sem ressecar a pele sensível.');
    }
  }

  // 5. Build dynamic visualItems array to form the customized look
  const visualItems: string[] = [];
  
  if (perceivedTemp > 26) {
    // TEMPERATURAS QUENTES (acima de 26°C)
    visualItems.push('body-manga-curta');
    if (state === 'dormindo') {
      visualItems.push('saco-dormir-leve');
    }
  } else if (perceivedTemp >= 22 && perceivedTemp <= 26) {
    // TEMPERATURAS AMENAS (22°C a 26°C)
    if (perceivedTemp < 24) {
      visualItems.push('body-manga-longa');
    } else {
      visualItems.push('body-manga-curta');
    }
    visualItems.push('calca');
    visualItems.push('macacao-algodao');
    if (state === 'dormindo') {
      visualItems.push('saco-dormir-leve');
    }
  } else if (perceivedTemp >= 18 && perceivedTemp < 22) {
    // TEMPERATURAS FRESCAS (18°C a 21°C)
    visualItems.push('body-manga-longa');
    visualItems.push('calca');
    visualItems.push('macacao-soft');
    visualItems.push('meias');
    if (state === 'dormindo') {
      visualItems.push('saco-dormir-soft');
    }
  } else if (perceivedTemp >= 14 && perceivedTemp < 18) {
    // TEMPERATURAS FRIAS (14°C a 17°C)
    visualItems.push('body-manga-longa');
    visualItems.push('calca');
    visualItems.push('macacao-soft');
    visualItems.push('meias');
    visualItems.push('touca');
    if (state === 'dormindo') {
      visualItems.push('saco-dormir-soft');
    }
  } else {
    // TEMPERATURAS MUITO FRIAS (abaixo de 14°C)
    visualItems.push('segunda-pele-termica');
    visualItems.push('calca');
    visualItems.push('macacao-plush');
    visualItems.push('meias');
    visualItems.push('touca');
    visualItems.push('luvas');
    if (state === 'dormindo') {
      visualItems.push('saco-dormir-plush');
    }
  }

  return {
    temperatureCategory: tempCategory,
    temperatureDescription: tempDescription,
    layerCount: recommendedLayers,
    layersDescription,
    outfitSuggestions,
    recommendedFabrics,
    accessories,
    importantAlerts,
    cozyParagraphs,
    extraTips: extraTips.length > 0 ? extraTips : undefined,
    severity,
    visualItems
  };
}
