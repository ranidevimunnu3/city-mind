import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCongestionIndex,
  getCongestionCategory,
  calculateRepairUrgencyScore,
  formatCoordinates,
  evaluateWeatherDrivingRisk,
} from './citymind-logic.ts';

test('calculateCongestionIndex handles free flow and zero speed', () => {
  const freeFlow = calculateCongestionIndex({
    currentSpeedKmh: 60,
    freeFlowSpeedKmh: 60,
    incidentCount: 0,
    roadClass: 'arterial',
  });
  assert.equal(freeFlow, 0);

  const gridlock = calculateCongestionIndex({
    currentSpeedKmh: 0,
    freeFlowSpeedKmh: 60,
    incidentCount: 4,
    roadClass: 'arterial',
  });
  // 80 (speed penalty) + 20 (incident penalty) = 100
  assert.equal(gridlock, 100);

  const moderate = calculateCongestionIndex({
    currentSpeedKmh: 30,
    freeFlowSpeedKmh: 60,
    incidentCount: 1,
    roadClass: 'highway',
  });
  // speed ratio 0.5 -> penalty 40 + incident 5 = 45
  assert.equal(moderate, 45);
});

test('getCongestionCategory classifies thresholds correctly', () => {
  assert.equal(getCongestionCategory(10), 'FREE_FLOW');
  assert.equal(getCongestionCategory(35), 'MODERATE');
  assert.equal(getCongestionCategory(60), 'HEAVY');
  assert.equal(getCongestionCategory(95), 'SEVERE_GRIDLOCK');
});

test('calculateRepairUrgencyScore computes weighted urgency', () => {
  const critical = calculateRepairUrgencyScore({
    severity: 'critical',
    confidence: 1.0,
    trafficExposure: 1500,
  });
  // 10 * 1.0 + 1 = 11 -> clamped to 10
  assert.equal(critical, 10);

  const low = calculateRepairUrgencyScore({
    severity: 'low',
    confidence: 0.8,
    trafficExposure: 500,
  });
  // 2 * 0.8 + 0 = 1.6 -> rounded to 2
  assert.equal(low, 2);
});

test('formatCoordinates returns formatted text and handles out-of-bounds', () => {
  assert.equal(formatCoordinates(37.7749, -122.4194), '+37.7749°, -122.4194°');
  assert.equal(formatCoordinates(105, 20), 'Out of bounds');
  assert.equal(formatCoordinates(NaN, 0), 'Invalid coordinates');
});

test('evaluateWeatherDrivingRisk detects hazardous weather conditions', () => {
  const severe = evaluateWeatherDrivingRisk(95, 40);
  assert.equal(severe.riskLevel, 'HAZARDOUS');
  assert.equal(severe.recommendedSpeedReductionPercent, 40);

  const rainy = evaluateWeatherDrivingRisk(65, 20);
  assert.equal(rainy.riskLevel, 'HIGH');
  assert.equal(rainy.recommendedSpeedReductionPercent, 25);

  const clear = evaluateWeatherDrivingRisk(1, 10);
  assert.equal(clear.riskLevel, 'LOW');
  assert.equal(clear.recommendedSpeedReductionPercent, 0);
});
