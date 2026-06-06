/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BabyAge = 'recem-nascido' | '1-6-meses' | '6-12-meses' | 'mais-de-1-ano';

export type BabyState = 'acordado' | 'dormindo' | 'colo-sling' | 'passeando';

export type PeriodOfDay = 'dia' | 'noite';

export type EnvironmentCondition = 'fechado' | 'ventilador' | 'ar-condicionado' | 'vento-frio' | 'externo';

export type AmbientFeeling = 'muito-quente' | 'quente' | 'agradavel' | 'fresquinho' | 'frio' | 'muito-frio';

export interface QuestionnaireAnswers {
  age: BabyAge;
  state: BabyState;
  period: PeriodOfDay;
  condition: EnvironmentCondition;
  feeling: AmbientFeeling;
  temperature: number | null;
}

export interface RecommendationResult {
  temperatureCategory: string; // e.g. "🌥️ Ambiente Fresquinho", "❄️ Ambiente Bem Frio"
  temperatureDescription: string; // Short cozy label
  layerCount: number; // e.g., 1, 2, 3 layers
  layersDescription: string; // Cohesive layer details
  outfitSuggestions: string[]; // List of specific clothes
  recommendedFabrics: string[]; // List of recommended fabrics
  accessories: string[]; // List of optional accessories
  importantAlerts: string[]; // List of vital alerts
  cozyParagraphs: string[]; // The beautiful, warm, human-like voice responses
  severity: 'extreme-cold' | 'cold' | 'mild' | 'warm' | 'hot' | 'extreme-hot';
  visualItems: string[]; // List of clothing IDs to render visuals
}
