import React from 'react';
import { 
  CloudRain, 
  Wind, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowUpRight, 
  Sparkles, 
  Camera, 
  Compass, 
  RefreshCw,
  Gauge,
  Clock
} from 'lucide-react';
import { TabType } from './BottomTabBar';

interface DashboardViewProps {
  weather: any;
  trafficFlow: any;
  infrastructureReports: any[];
  onNavigateTab: (tab: TabType) => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  onOpenReportModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  weather,
  trafficFlow,
  infrastructureReports,
  onNavigateTab,
  onRefreshAll,
  isRefreshing,
  onOpenReportModal,
}) => {
  const criticalReports = infrastructureReports.filter(
    (r) => r.severity === 'CRITICAL' || r.severity === 'HIGH'
  );

  const congestionIndex = trafficFlow?.congestion_index ?? 35;
  const currentSpeed = trafficFlow?.current_speed_kmh ?? 42;
  const freeFlowSpeed = trafficFlow?.free_flow_speed_kmh ?? 60;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20 select-text">
      {/* Top City Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-teal-400 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            San Francisco Metro Division
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">Mobility Command</h2>
        </div>
        <button
          onClick={onRefreshAll}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 transition active:scale-95 disabled:opacity-50"
          title="Refresh City Data Feed"
          aria-label="Refresh City Data Feed"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onOpenReportModal}
          className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-500/20 border border-teal-500/30 flex flex-col items-center justify-center text-center transition hover:border-teal-400 active:scale-95 group"
        >
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 mb-1 group-hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200 leading-tight">Report Hazard</span>
          <span className="text-[9px] text-teal-400 mt-0.5">AI Camera Scan</span>
        </button>

        <button
          onClick={() => onNavigateTab('map')}
          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center transition hover:border-slate-700 active:scale-95 group"
        >
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mb-1 group-hover:scale-110 transition-transform">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200 leading-tight">Live Map</span>
          <span className="text-[9px] text-slate-400 mt-0.5">GIS & Hotspots</span>
        </button>

        <button
          onClick={() => onNavigateTab('ai')}
          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center transition hover:border-slate-700 active:scale-95 group"
        >
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mb-1 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200 leading-tight">AI Thinking</span>
          <span className="text-[9px] text-slate-400 mt-0.5">High Simulation</span>
        </button>
      </div>

      {/* Weather & Road Surface Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800/90 shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">Roadway Weather Condition</span>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
            {weather?.provider || 'Open-Meteo'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-1">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400">Pavement Temp</span>
            <span className="text-xl font-bold text-white tracking-tight mt-0.5">
              {weather ? `${weather.temperature_c}°C` : '--'}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Dry Surface</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Wind className="w-3 h-3 text-slate-400" /> Wind Speed
            </span>
            <span className="text-xl font-bold text-white tracking-tight mt-0.5">
              {weather ? `${weather.wind_speed_kmh}` : '--'}{' '}
              <span className="text-xs font-normal text-slate-400">km/h</span>
            </span>
            <span className="text-[10px] text-slate-400">Moderate Crosswind</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400">Driving Risk</span>
            <div className="mt-1 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-bold text-teal-400">OPTIMAL</span>
            </div>
            <span className="text-[9px] text-slate-400">Normal braking</span>
          </div>
        </div>
      </div>

      {/* Traffic Intelligence Segment Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800/90 shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Activity className="w-4 h-4 text-teal-400" />
            <span className="font-semibold">Corridor Traffic Congestion</span>
          </div>
          <button
            onClick={() => onNavigateTab('traffic')}
            className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-0.5 font-medium"
          >
            Details <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {congestionIndex}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5">
              {congestionIndex < 25 ? 'Free Flowing Traffic' : congestionIndex < 55 ? 'Moderate Congestion' : 'Heavy Traffic Delay'}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Current Velocity</div>
            <div className="text-lg font-bold text-teal-300">
              {currentSpeed} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Free Flow: <span className="font-semibold text-slate-300">{freeFlowSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2.5 w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              congestionIndex > 70
                ? 'bg-rose-500'
                : congestionIndex > 40
                ? 'bg-amber-400'
                : 'bg-teal-400'
            }`}
            style={{ width: `${Math.max(5, congestionIndex)}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
          <span>Provider: {trafficFlow?.provider || 'TomTom / Simulation Engine'}</span>
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-2.5 h-2.5" /> Live telemetry
          </span>
        </div>
      </div>

      {/* Critical Infrastructure Watchlist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              High Priority Road Hazards ({criticalReports.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('infrastructure')}
            className="text-[10px] text-teal-400 hover:text-teal-300 font-medium"
          >
            View All
          </button>
        </div>

        <div className="space-y-2">
          {criticalReports.slice(0, 2).map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigateTab('infrastructure')}
              className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <img
                  src={item.photo_url}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Urgency: {item.urgency_score}/10
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 truncate mt-0.5 group-hover:text-teal-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">{item.address}</p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
