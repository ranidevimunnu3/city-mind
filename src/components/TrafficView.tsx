import React, { useState } from 'react';
import { 
  Activity, 
  Gauge, 
  AlertCircle, 
  Car, 
  Clock, 
  Navigation, 
  Info, 
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface TrafficViewProps {
  trafficFlow: any;
  trafficIncidents: any[];
  weather: any;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const TrafficView: React.FC<TrafficViewProps> = ({
  trafficFlow,
  trafficIncidents,
  weather,
  onRefresh,
  isRefreshing,
}) => {
  const [selectedCorridor, setSelectedCorridor] = useState('Central Downtown');

  const congestion = trafficFlow?.congestion_index ?? 38;
  const currentSpeed = trafficFlow?.current_speed_kmh ?? 40;
  const freeFlow = trafficFlow?.free_flow_speed_kmh ?? 60;
  const isLive = trafficFlow?.is_live ?? false;
  const provider = trafficFlow?.provider ?? 'CITYMIND Traffic Engine';

  // Dynamic status category
  let categoryLabel = 'Optimal Flow';
  let categoryColor = 'text-teal-400 bg-teal-500/10 border-teal-500/30';
  if (congestion > 75) {
    categoryLabel = 'Severe Gridlock';
    categoryColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  } else if (congestion > 45) {
    categoryLabel = 'Moderate Congestion';
    categoryColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20 select-text">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Live Traffic Intelligence
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">Flow & Congestion</h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50 transition active:scale-95 disabled:opacity-50"
          title="Refresh Traffic Data"
          aria-label="Refresh Traffic Data"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Provider & Live Status Banner */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
          <div>
            <div className="font-semibold text-slate-200">{provider}</div>
            <div className="text-[10px] text-slate-400 font-mono">
              {isLive ? 'TomTom Live Flow Feed' : trafficFlow?.fallback_reason || 'Simulation Mode Active'}
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
          {new Date((trafficFlow?.timestamp || Date.now() / 1000) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Main Dial & Metrics Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Congestion Index</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-4xl font-extrabold text-white tracking-tight">{congestion}</span>
              <span className="text-sm font-mono text-slate-400">/ 100</span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${categoryColor}`}>
            {categoryLabel}
          </div>
        </div>

        {/* Speed Comparison Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Current Velocity</span>
              <span className="font-bold text-teal-300 font-mono">{currentSpeed} km/h</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (currentSpeed / 100) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Free Flow Benchmark</span>
              <span className="font-semibold text-slate-300 font-mono">{freeFlow} km/h</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-cyan-600 h-full rounded-full transition-all duration-500 opacity-60"
                style={{ width: `${Math.min(100, (freeFlow / 100) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weather Impact Advisory */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center space-x-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <div className="text-[11px] text-slate-300">
            <span className="font-semibold text-teal-300">Weather Advisory: </span>
            {weather?.wind_speed_kmh > 35 ? 'Gusty crosswinds on bridges; maintain 4-second following distance.' : 'Optimal pavement conditions. Speed limits standard.'}
          </div>
        </div>
      </div>

      {/* Corridor Quick Selectors */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Monitored Corridors
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Central Downtown', speed: currentSpeed, index: congestion },
            { name: 'Bay Bridge Inbound', speed: 28, index: 65 },
            { name: 'Sunset Arterial', speed: 48, index: 22 },
            { name: 'Mission Expressway', speed: 34, index: 52 },
          ].map((corridor) => (
            <div
              key={corridor.name}
              onClick={() => setSelectedCorridor(corridor.name)}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                selectedCorridor === corridor.name
                  ? 'bg-slate-800 border-teal-500/50 text-white'
                  : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-200 truncate">{corridor.name}</div>
              <div className="flex items-center justify-between mt-1 text-[10px]">
                <span className="font-mono text-teal-300">{corridor.speed} km/h</span>
                <span className={`font-semibold ${corridor.index > 50 ? 'text-amber-400' : 'text-teal-400'}`}>
                  CI: {corridor.index}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Incidents List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Traffic Incidents ({trafficIncidents.length})
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Real-Time Queue</span>
        </div>

        <div className="space-y-2">
          {trafficIncidents.map((incident) => (
            <div
              key={incident.id}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3 text-xs"
            >
              <div className={`p-2 rounded-lg mt-0.5 ${
                incident.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                <Car className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 truncate">{incident.title || incident.type}</span>
                  <span className="text-[10px] font-mono text-rose-400 font-semibold shrink-0">
                    +{Math.round(incident.delay_seconds / 60)} min delay
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {incident.description}
                </p>
                <div className="mt-1 flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                  <span>Lat: {incident.latitude?.toFixed(3)}</span>
                  <span>Lon: {incident.longitude?.toFixed(3)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
