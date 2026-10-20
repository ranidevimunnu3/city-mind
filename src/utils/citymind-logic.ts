/**
 * CITYMIND AI - Core Pure Logic & Utilities
 * Decoupled calculation and data transformations for smart mobility
 */

export interface TrafficSegmentMetrics {
  currentSpeedKmh: number;
  freeFlowSpeedKmh: number;
  incidentCount: number;
  roadClass: 'highway' | 'arterial' | 'collector' | 'local';
}

export type CongestionLevel = 'FREE_FLOW' | 'MODERATE' | 'HEAVY' | 'SEVERE_GRIDLOCK';

/**
 * Calculates congestion index from 0 (completely free flow) to 100 (gridlock)
 */
export function calculateCongestionIndex(metrics: TrafficSegmentMetrics): number {
  const { currentSpeedKmh, freeFlowSpeedKmh, incidentCount } = metrics;
  if (freeFlowSpeedKmh <= 0) return 0;
  
  // Speed ratio penalty (0 to 80 points)
  const ratio = Math.max(0, Math.min(1, currentSpeedKmh / freeFlowSpeedKmh));
  const speedPenalty = (1 - ratio) * 80;
  
  // Incident penalty (up to 20 points)
  const incidentPenalty = Math.min(20, incidentCount * 5);
  
  const rawIndex = speedPenalty + incidentPenalty;
  return Math.round(Math.max(0, Math.min(100, rawIndex)));
}

/**
 * Categorizes congestion level based on congestion index
 */
export function getCongestionCategory(index: number): CongestionLevel {
  if (index < 25) return 'FREE_FLOW';
  if (index < 50) return 'MODERATE';
  if (index < 75) return 'HEAVY';
  return 'SEVERE_GRIDLOCK';
}

export interface HazardScoreParams {
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0 to 1
  trafficExposure: number; // vehicles/hour
}

/**
 * Computes repair urgency priority score (1 to 10)
 */
export function calculateRepairUrgencyScore(params: HazardScoreParams): number {
  const severityMultipliers: Record<string, number> = {
    low: 2,
    medium: 4,
    high: 7,
    critical: 10,
  };

  const base = severityMultipliers[params.severity] || 3;
  const confidenceWeight = Math.max(0.2, Math.min(1, params.confidence));
  const exposureBonus = params.trafficExposure > 1000 ? 1 : 0;

  const score = base * confidenceWeight + exposureBonus;
  return Math.round(Math.max(1, Math.min(10, score)));
}

/**
 * Validates and formats latitude and longitude strings or numbers
 */
export function formatCoordinates(lat: number, lon: number): string {
  if (isNaN(lat) || isNaN(lon)) return 'Invalid coordinates';
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return 'Out of bounds';
  return `${lat >= 0 ? '+' : ''}${lat.toFixed(4)}°, ${lon >= 0 ? '+' : ''}${lon.toFixed(4)}°`;
}

/**
 * Evaluates weather impact on city driving conditions
 */
export function evaluateWeatherDrivingRisk(weatherCode: number, windSpeedKmh: number): {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'HAZARDOUS';
  recommendedSpeedReductionPercent: number;
  conditionDescription: string;
} {
  // WMO Weather codes:
  // 0-3: Clear/Cloudy
  // 45,48: Fog
  // 51-67: Rain / Drizzle
  // 71-77: Snow
  // 80-82: Showers
  // 95-99: Thunderstorm
  if (weatherCode >= 95 || windSpeedKmh > 70) {
    return {
      riskLevel: 'HAZARDOUS',
      recommendedSpeedReductionPercent: 40,
      conditionDescription: 'Severe thunderstorm or extreme winds. Flash flooding risk.',
    };
  }
  if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 61 && weatherCode <= 67)) {
    return {
      riskLevel: 'HIGH',
      recommendedSpeedReductionPercent: 25,
      conditionDescription: 'Slick roads, reduced braking distance and lower visibility.',
    };
  }
  if (weatherCode >= 45 && weatherCode <= 57) {
    return {
      riskLevel: 'MEDIUM',
      recommendedSpeedReductionPercent: 15,
      conditionDescription: 'Foggy or light drizzle. Exercise caution at intersections.',
    };
  }
  return {
    riskLevel: 'LOW',
    recommendedSpeedReductionPercent: 0,
    conditionDescription: 'Optimal driving conditions. Standard city flow.',
  };
}
