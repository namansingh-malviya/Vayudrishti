export interface AqiCategoryInfo {
  name: string;
  color: string;
  bgLight: string;
  textDark: string;
  rangePm25: string;
  description: string;
  healthImpact: string;
}

export const AQI_CATEGORIES: Record<string, AqiCategoryInfo> = {
  Good: {
    name: 'Good',
    color: '#00B050',
    bgLight: '#E8F5E9',
    textDark: '#1B5E20',
    rangePm25: '0 - 30 µg/m³',
    description: 'Minimal impact',
    healthImpact: 'Air quality is considered satisfactory, and air pollution poses little or no risk.'
  },
  Satisfactory: {
    name: 'Satisfactory',
    color: '#92D050',
    bgLight: '#F1F8E9',
    textDark: '#33691E',
    rangePm25: '31 - 60 µg/m³',
    description: 'Minor breathing discomfort',
    healthImpact: 'Minor breathing discomfort to sensitive people.'
  },
  Moderate: {
    name: 'Moderate',
    color: '#D4A017',
    bgLight: '#FFFDE7',
    textDark: '#827717',
    rangePm25: '61 - 90 µg/m³',
    description: 'Breathing discomfort to people with lungs/asthma',
    healthImpact: 'Discomfort to people with lung disease, asthma and heart ailments.'
  },
  Poor: {
    name: 'Poor',
    color: '#FF9900',
    bgLight: '#FFF3E0',
    textDark: '#E65100',
    rangePm25: '91 - 120 µg/m³',
    description: 'Breathing discomfort on prolonged exposure',
    healthImpact: 'Breathing discomfort to most people on prolonged outdoor exposure.'
  },
  'Very Poor': {
    name: 'Very Poor',
    color: '#E63946',
    bgLight: '#FFEBEE',
    textDark: '#B71C1C',
    rangePm25: '121 - 250 µg/m³',
    description: 'Respiratory illness on prolonged exposure',
    healthImpact: 'Respiratory illness on prolonged exposure. Significant risk for elders and children.'
  },
  Severe: {
    name: 'Severe',
    color: '#7E0023',
    bgLight: '#FCE4EC',
    textDark: '#880E4F',
    rangePm25: '250+ µg/m³',
    description: 'Affects healthy people and seriously impacts those with existing diseases',
    healthImpact: 'Emergency conditions: GRAP Stage III/IV enforcement triggered immediately.'
  }
};

export function getAqiInfo(pm25: number): AqiCategoryInfo {
  if (pm25 <= 30) return AQI_CATEGORIES['Good'];
  if (pm25 <= 60) return AQI_CATEGORIES['Satisfactory'];
  if (pm25 <= 90) return AQI_CATEGORIES['Moderate'];
  if (pm25 <= 120) return AQI_CATEGORIES['Poor'];
  if (pm25 <= 250) return AQI_CATEGORIES['Very Poor'];
  return AQI_CATEGORIES['Severe'];
}

export function getAqiColor(pm25: number): string {
  return getAqiInfo(pm25).color;
}
