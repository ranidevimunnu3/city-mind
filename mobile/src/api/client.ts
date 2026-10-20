/**
 * CITYMIND AI - Mobile API Client
 * Configurable base URL for localhost, LAN IP (e.g. 192.168.1.X:3000), or production HTTPS.
 */

// In Expo, use process.env.EXPO_PUBLIC_API_URL or fallback to local IP
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function fetchWeather(lat: number, lon: number) {
  const res = await fetch(`${API_BASE_URL}/api/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchTrafficFlow(lat: number, lon: number) {
  const res = await fetch(`${API_BASE_URL}/api/traffic/flow?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error(`Traffic flow fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchTrafficIncidents() {
  const res = await fetch(`${API_BASE_URL}/api/traffic/incidents`);
  if (!res.ok) throw new Error(`Traffic incidents fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchInfrastructure(status?: string) {
  const url = status 
    ? `${API_BASE_URL}/api/infrastructure?status=${encodeURIComponent(status)}`
    : `${API_BASE_URL}/api/infrastructure`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Infrastructure fetch failed: ${res.status}`);
  return res.json();
}

export async function submitInfrastructureReport(data: {
  title: string;
  type: string;
  severity: string;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
  photo_url?: string;
  ai_analysis?: any;
}) {
  const res = await fetch(`${API_BASE_URL}/api/infrastructure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Report submission failed: ${res.status}`);
  return res.json();
}

export async function fetchInsights() {
  const res = await fetch(`${API_BASE_URL}/api/insights`);
  if (!res.ok) throw new Error(`Insights fetch failed: ${res.status}`);
  return res.json();
}
