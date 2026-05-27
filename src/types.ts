/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BabyAge = 'recem-nascido' | '0-3-meses' | '3-6-meses' | '6-12-meses' | 'mais-de-1-ano';

export type BabyState = 'dormindo' | 'acordado-casa' | 'passeando' | 'sling-colo' | 'ar-condicionado';

export type PeriodOfDay = 'dia' | 'noite';

export type ThermalSensitivity = 'calor' | 'normal' | 'frio';

export type EnvironmentLocation = 'interno' | 'externo';

export interface QuestionnaireAnswers {
  age: BabyAge;
  state: BabyState;
  period: PeriodOfDay;
  temperature: number; // in °C
  hasWind: boolean;
  sensitivity: ThermalSensitivity;
  location: EnvironmentLocation;
  wantsExtras: boolean;
}

export interface RecommendationResult {
  temperatureCategory: string; // e.g. "Extremamente Frio", "Fresco", "Agradável", "Quente", "Extremamente Quente"
  temperatureDescription: string; // Short cozy label
  layerCount: number; // e.g., 1, 2, 3 layers
  layersDescription: string; // Cohesive layer details
  outfitSuggestions: string[]; // List of specific clothes
  recommendedFabrics: string[]; // List of recommended fabrics
  accessories: string[]; // List of optional accessories
  importantAlerts: string[]; // List of vital alerts (e.g. SIDS safety, wind chill, etc.)
  cozyParagraphs: string[]; // The beautiful, warm, human-like voice responses
  extraTips?: string[]; // Extra contextual advice if selected
  severity: 'extreme-cold' | 'cold' | 'mild' | 'warm' | 'hot' | 'extreme-hot';
  visualItems: string[]; // List of clothing IDs to render visuals
}
