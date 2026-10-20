/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { DashboardView } from './components/DashboardView';
import { CityMapView } from './components/CityMapView';
import { TrafficView } from './components/TrafficView';
import { InfrastructureView } from './components/InfrastructureView';
import { AiStudioView } from './components/AiStudioView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isDeviceMode, setIsDeviceMode] = useState<boolean>(true);

  // Core Data States
  const [weather, setWeather] = useState<any>(null);
  const [trafficFlow, setTrafficFlow] = useState<any>(null);
  const [trafficIncidents, setTrafficIncidents] = useState<any[]>([]);
  const [infrastructureReports, setInfrastructureReports] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any>(null);

  // Loading & Modal States
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Fetch all core datasets
  const loadCityData = async () => {
    try {
      setNetworkError(null);
      const [weatherRes, trafficRes, incidentsRes, infraRes, healthRes] = await Promise.allSettled([
        fetch('/api/weather'),
        fetch('/api/traffic/flow'),
        fetch('/api/traffic/incidents'),
        fetch('/api/infrastructure'),
        fetch('/api/health'),
      ]);

      if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
        setWeather(await weatherRes.value.json());
      }
      if (trafficRes.status === 'fulfilled' && trafficRes.value.ok) {
        setTrafficFlow(await trafficRes.value.json());
      }
      if (incidentsRes.status === 'fulfilled' && incidentsRes.value.ok) {
        const data = await incidentsRes.value.json();
        setTrafficIncidents(data.incidents || []);
      }
      if (infraRes.status === 'fulfilled' && infraRes.value.ok) {
        const data = await infraRes.value.json();
        setInfrastructureReports(data.reports || []);
      }
      if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
        setHealthData(await healthRes.value.json());
      }
    } catch (err: any) {
      console.warn('Network sync error:', err);
      setNetworkError('Temporary connection lag. Operating in resilient cache mode.');
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCityData();
  }, []);

  const handleRefreshAll = () => {
    setIsRefreshing(true);
    loadCityData();
  };

  // Add new infrastructure hazard report
  const handleAddReport = async (newReportData: any) => {
    const res = await fetch('/api/infrastructure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReportData),
    });

    if (res.ok) {
      const data = await res.json();
      setInfrastructureReports((prev) => [data.report, ...prev]);
    } else {
      throw new Error('Failed to submit report');
    }
  };

  // Update status of existing report
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // Optimistic UI update
    setInfrastructureReports((prev) =>
      prev.map((rep) => (rep.id === id ? { ...rep, status: newStatus } : rep))
    );

    try {
      await fetch(`/api/infrastructure/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Revert if failed
      loadCityData();
    }
  };

  // Calculate unread high-severity alerts count
  const criticalCount = infrastructureReports.filter(
    (r) => (r.severity === 'CRITICAL' || r.severity === 'HIGH') && r.status !== 'REPAIRED'
  ).length;

  return (
    <AndroidFrame
      isDeviceMode={isDeviceMode}
      onToggleMode={() => setIsDeviceMode((prev) => !prev)}
    >
      {/* Network Alert Banner (if temporary connection error) */}
      {networkError && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-3 py-1.5 text-center text-xs text-amber-300 font-medium">
          {networkError}
        </div>
      )}

      {/* Main View Area based on Selected Bottom Tab */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {isInitialLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3 bg-slate-950">
            <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <h3 className="text-sm font-bold text-white tracking-wide">CITYMIND AI</h3>
              <p className="text-xs text-slate-400 mt-1">Connecting to City Mobility Grid...</p>
            </div>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                weather={weather}
                trafficFlow={trafficFlow}
                infrastructureReports={infrastructureReports}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onRefreshAll={handleRefreshAll}
                isRefreshing={isRefreshing}
                onOpenReportModal={() => {
                  setCurrentTab('infrastructure');
                  setIsModalOpen(true);
                }}
              />
            )}

            {currentTab === 'map' && (
              <CityMapView
                infrastructureReports={infrastructureReports}
                trafficIncidents={trafficIncidents}
                onUpdateReportStatus={handleUpdateStatus}
              />
            )}

            {currentTab === 'traffic' && (
              <TrafficView
                trafficFlow={trafficFlow}
                trafficIncidents={trafficIncidents}
                weather={weather}
                onRefresh={handleRefreshAll}
                isRefreshing={isRefreshing}
              />
            )}

            {currentTab === 'infrastructure' && (
              <InfrastructureView
                reports={infrastructureReports}
                onAddReport={handleAddReport}
                onUpdateStatus={handleUpdateStatus}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
              />
            )}

            {currentTab === 'ai' && <AiStudioView />}

            {currentTab === 'settings' && (
              <SettingsView
                healthData={healthData}
                onRefreshHealth={handleRefreshAll}
                isCheckingHealth={isRefreshing}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Android Tab Bar */}
      <BottomTabBar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        unreadAlertsCount={criticalCount}
      />
    </AndroidFrame>
  );
}
