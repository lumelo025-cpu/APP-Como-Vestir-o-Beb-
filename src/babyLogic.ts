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
    layersDescription = 'Camada única respirável e ultraleve de algodão fino.';
    
    if (isSleeping) {
      outfitSuggestions.push('Look ideal: Body manga curta leve e nada mais.');
      outfitSuggestions.push('Dica: Em noites/sonecas extremamente abafadas, o bebê pode dormir apenas de fralda com toda a segurança.');
    } else {
      outfitSuggestions.push('Body manga curta fino e respirável');
    }
    
    recommendedFabrics.push('Algodão leve', 'Malha de algodão respirável');
    accessories.push('Pezinhos descalços para regulação térmica natural');
    visualItems.push('body-manga-curta');

  } else if (perceivedTemp >= 28 && perceivedTemp < 31) {
    // ☀️ WARMY / SUNNY
    layerCount = 1;
    layersDescription = 'Camada base única ultra permeável de algodão.';
    
    outfitSuggestions.push('Body manga curta leve e confortável');
    if (condition === 'ar-condicionado' || condition === 'vento-frio') {
      outfitSuggestions.push('Adicione uma Calça culote leve para barrar brisas diretas');
      visualItems.push('calca');
    }
    if (age === 'recem-nascido') {
      outfitSuggestions.push('Como sugestão para recém-nascido: usar Body manga longa para proteger os bracinhos sensíveis do sol ou vento.');
    }

    recommendedFabrics.push('Algodão 100% puro', 'Fibra de bambu fresca');
    accessories.push('Pezinhos livres ou apenas fralda nas sonecas mais quentes do dia');
    visualItems.push('body-manga-curta');

  } else if (perceivedTemp >= 25 && perceivedTemp < 28) {
    // 😊 AGREEABLE / NICE
    layerCount = 2;
    layersDescription = 'Camadas básicas: Body sob calça leve garantindo que o bebê fique fresco.';
    
    if (isSleeping) {
      outfitSuggestions.push('Opção Principal: Body manga curta + Calça de algodão macio');
      outfitSuggestions.push('Sugestão de sono seguro: Saco de dormir leve para substituir cobertores soltos');
      visualItems.push('body-manga-curta', 'saco-dormir-leve');
    } else {
      outfitSuggestions.push('Body manga curta OU manga longa bem fino');
      outfitSuggestions.push('Calça culote leve (mijão) para liberdade de movimento');
      visualItems.push('body-manga-curta', 'calca');
    }

    recommendedFabrics.push('Algodão Suedine leve', 'Malha canelada de toque macio');
    accessories.push('Meias leves opcionais se perceber pezinhos gelados');

  } else if (perceivedTemp >= 22 && perceivedTemp < 25) {
    // 🌤️ LIGHTLY FRESH
    layerCount = 2;
    layersDescription = '2 camadas leves de algodão mantendo os membros e o tronco perfeitamente aquecidos.';
    
    if (isSleeping) {
      outfitSuggestions.push('Look principal: Body manga longa + Calça de algodão respirável');
      outfitSuggestions.push('Opção para a noite: Saco de dormir leve cobrindo o body manga longa');
      visualItems.push('body-manga-longa', 'saco-dormir-soft');
    } else {
      outfitSuggestions.push('Body manga longa macio');
      outfitSuggestions.push('Calça culote de algodão super flexível');
      outfitSuggestions.push('Macacão de algodão leve por cima (se o dia esfriar)');
      visualItems.push('body-manga-longa', 'calca', 'meias');
    }

    recommendedFabrics.push('Algodão Suedine clássico', 'Soft de espessura super fina');
    accessories.push('Meias de bebê macias');

  } else if (perceivedTemp >= 19 && perceivedTemp < 22) {
    // 🌥️ FRESH
    layerCount = 2;
    layersDescription = 'Proteção refrescante mas aconchegante com body sob macacão de algodão encorpado.';
    
    if (isSleeping) {
      outfitSuggestions.push('Look à noite: Body manga longa + Calça + Saco de dormir soft');
      visualItems.push('body-manga-longa', 'calca', 'saco-dormir-soft');
    } else {
      outfitSuggestions.push('Body manga longa + Calça de algodão base');
      outfitSuggestions.push('Macacão de algodão encorpado por cima comercial');
      visualItems.push('body-manga-longa', 'calca', 'macacao-algodao', 'meias');
    }

    recommendedFabrics.push('Algodão Interlock macio', 'Fleece leve de toque aveludado');
    accessories.push('Meias elásticas confortáveis');

  } else if (perceivedTemp >= 16 && perceivedTemp < 19) {
    // 🍃 MODERATE COLD
    layerCount = 3;
    layersDescription = 'Camada base protetora reforçada sob um macacão soft térmico aconchegante.';
    
    if (isSleeping) {
      outfitSuggestions.push('Opção confortável: Body manga longa + Calça canelada + Saco de dormir soft por cima');
      visualItems.push('body-manga-longa', 'calca', 'macacao-soft', 'meias');
    } else {
      outfitSuggestions.push('Body manga longa confortável');
      outfitSuggestions.push('Calça culote protetora (mijão)');
      outfitSuggestions.push('Macacão soft peluciado para prender o calor no tronco');
      visualItems.push('body-manga-longa', 'calca', 'macacao-soft', 'meias');
    }

    recommendedFabrics.push('Algodão interlock denso', 'Soft escovado térmico');
    accessories.push('Meias bem macias de algodão');

  } else if (perceivedTemp >= 12 && perceivedTemp < 16) {
    // 🥶 COLD
    layerCount = 3;
    layersDescription = 'Camada térmica corporal com body sob calça, protegidas pelo macacão plush aveludado.';
    
    if (isSleeping) {
      outfitSuggestions.push('Visual de sono seguro: Body manga longa + Calça + Saco de dormir plush com mangas');
      visualItems.push('body-manga-longa', 'calca', 'saco-dormir-plush');
    } else {
      outfitSuggestions.push('Body manga longa grosso de toque carinhoso');
      outfitSuggestions.push('Calça protetora encorpada');
      outfitSuggestions.push('Macacão plush atoalhado que sela o tórax e as perninhas');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush', 'meias');
    }

    if (condition === 'externo' || condition === 'vento-frio' || state === 'passeando') {
      accessories.push('Touca protetora de algodão cobrindo as orelhas');
      accessories.push('Luvas macias para passeios ao ar livre');
      visualItems.push('touca');
    } else {
      accessories.push('Meias quentinhas e aconchego natural');
    }

    recommendedFabrics.push('Plush denso atoalhado', 'Algodão escovado espesso');

  } else {
    // ❄️ EXTREME COLD
    layerCount = 4;
    layersDescription = 'Isolamento robusto com sobreposição estratégica e acessórios quentes.';
    
    if (isSleeping) {
      outfitSuggestions.push('Visual recomendado: Body manga longa + Calça + Meias e Saco de dormir plush com mangas cobrindo por cima');
      visualItems.push('body-manga-longa', 'calca', 'saco-dormir-plush', 'meias');
    } else {
      outfitSuggestions.push('Body manga longa grosso e firme');
      outfitSuggestions.push('Calça de algodão reforçada');
      outfitSuggestions.push('Macacão plush aveludado e quentinho');
      visualItems.push('body-manga-longa', 'calca', 'macacao-plush', 'meias', 'touca');
    }

    accessories.push('Meias grossas de lã de algodão ou sapatilhas de pelúcia');
    accessories.push('Touca de plush ou soft protegendo o ouvido');
    
    if (condition === 'externo' || condition === 'vento-frio' || state === 'passeando') {
      accessories.push('Luvas macias infantis');
      visualItems.push('luvas');
    }

    recommendedFabrics.push('Plush de alta densidade', 'Soft térmico aveludado de alto isolamento');
  }

  // Add specific custom suggestions based on items
  let itemOptionalText = 'Se o seu bebezinho costuma transpirar ou sentir calor facilmente, você pode retirar as meias ou dispensar acessórios no ambiente interno.';
  if (sensitivity === 'frio') {
    itemOptionalText = 'Para bebês mais sensíveis ao frio, pode-se adicionar uma camada leve extra de meia ou fechar as patinhas do macacão se houver vento.';
  } else if (sensitivity === 'calor') {
    itemOptionalText = 'Como seu bebê é calorento, remova meias em ambientes internos e dê preferência ao body de manga curta no lugar de plush.';
  }

  // 4. Create human, warm paragraphs (cozyParagraphs) conforming to style examples
  const cozyParagraphs: string[] = [];
  const ageLabel = {
    'recem-nascido': 'seu recém-nascido querido',
    '0-3-meses': 'seu bebezinho de poucos meses',
    '3-6-meses': 'seu bebê que já está descobrindo o mundo',
    '6-12-meses': 'seu bebê ativo de quase 1 ano',
    'mais-de-1-ano': 'seu pequeno tagarela aventureiro'
  }[age];

  // Formatting paragraph 1: Interpreting context & body-heat (perceived)
  let introPara = '';
  if (state === 'dormindo') {
    introPara = `Bebê dormindo de forma confortável enche o coração de paz! Como a noite ou soneca exige atenção extra para evitar sobreposições sufocantes ou cobertores soltos, desenhamos uma sugestão focando na segurança fisiológica de ${ageLabel}. Optar por saco de dormir adequado evita superaquecimento enquanto mantém os pezinhos protegidos a noite toda 💛`;
  } else if (state === 'colo-sling') {
    introPara = `O colo e o sling aquecem bastante o bebê, então normalmente uma camada a menos já é suficiente. O calor gerado pelo abraço e o contato físico íntimo funciona como um isolamento ativo fantástico, mantendo seu bebê de forma aconchegante sem precisar de exageros têxteis.`;
  } else if (condition === 'fechado') {
    introPara = `Mesmo com a temperatura externa mais baixa, ambientes fechados e integrados costumam ficar mais aconchegantes. Nesse caso, um body manga longa com macacão leve ou soft já pode funcionar muito bem e garantir total bem-estar de ${ageLabel} sem precisar empilhar roupas desnecessárias.`;
  } else if (condition === 'ar-condicionado') {
    introPara = `Para ambientes climatizados com ar-condicionado, o segredo é barrar as correntes e rajadas contínuas de ar frio direto no peito de ${ageLabel}. Mantemos a base aconchegante, resguardando o tórax, mas com pernas livres de tecidos pesados.`;
  } else if (condition === 'vento-frio') {
    introPara = `Rajadas ou brisas de vento frio alteram consideravelmente a sensação corporal do seu bebê, exigindo uma barreira de vento física nos ouvidos e bracinhos de ${ageLabel}, mesmo que o dia pareça ensolarado ou ameno.`;
  } else {
    introPara = `Preparamos um visual prático, flexível e inteligente para ${ageLabel} brincar e interagir à vontade. Focamos no equilíbrio térmico perfeito para que as articulações fiquem livres de amarras pesadas.`;
  }
  cozyParagraphs.push(introPara);

  // Formatting paragraph 2: Clothes layering & fabric specifics
  let prescriptionPara = '';
  if (perceivedTemp >= 25) {
    prescriptionPara = `Na percepção agradável desta faixa de clima, o excesso de casacos é contraproducente. Use tecidos bem finos 100% livres de poliéster. O algodão Suedine e malhas finas dão o toque carinhoso à pele e absorvem a umidade com total segurança, permitindo o arejamento natural.`;
  } else if (perceivedTemp >= 16 && perceivedTemp < 25) {
    prescriptionPara = `Em períodos amenos de leve mudança climática, o melhor segredo tático é superpor duas peças macias de algodão. A base do body absorve a umidade de transição enquanto a calça protege os pezinhos, criando uma blindagem confortável para se despedir das inseguranças cotidianas.`;
  } else {
    prescriptionPara = `Nas percepções mais frias, evite malhas descaracterizadas ou blusas sintéticas pesadas. Em vez de entupir com mil peças, o truque perfeito é alinhar a camada base coladinha à pele sob o macacão soft ou plush aveludado de excelente retenção calórica. Isso mantém o bebê quente e absurdamente confortável.`;
  }
  cozyParagraphs.push(prescriptionPara);

  // Formatting paragraph 3: Mother instincts calibration
  let trackingDicaText = '';
  if (age === 'recem-nascido') {
    trackingDicaText = 'Como recém-nascidos ainda não possuem o centro regulador térmico maduro e perdem calor nas extremidades, um pacotinho desse tamanho precisa de cuidados dedicados com meias suaves e proteção nas orelhas.';
  } else {
    trackingDicaText = `Confie sempre nos seus sublimes instintos de mãe! De tempos em tempos, passe generosamente os dedos no peito ou na nuca de ${ageLabel} para recalibrar de forma exata e prática a sugestão de visual criada.`;
  }
  cozyParagraphs.push(trackingDicaText);

  // 5. Build Smart Alerts and Extra Tips
  const importantAlerts = [
    'A nuca do bebê é o melhor indicador de conforto térmico: sinta ali para saber se ele realmente está suando ou com frio.',
    'Mãos frias nem sempre significam frio! A circulação das extremidades nos pequenos ainda está amadurecendo.',
    'Evite excesso de camadas! Superaquecimento é desconfortável e aumenta os riscos térmicos associados ao sono.',
    'Observe sempre sinais importantes como suor excessivo, bochechas avermelhadas, irritabilidade inexplicável ou pele muito quente.',
    'Prefira saco de dormir de segurança ao invés de cobertores soltos para garantir noites tranquilas de sono 100% seguro.'
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
