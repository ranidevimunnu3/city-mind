import React, { useState } from 'react';
import { 
  Settings, 
  Server, 
  Wifi, 
  Smartphone, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Terminal, 
  Database,
  Lock,
  ExternalLink
} from 'lucide-react';

interface SettingsViewProps {
  healthData: any;
  onRefreshHealth: () => void;
  isCheckingHealth: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  healthData,
  onRefreshHealth,
  isCheckingHealth,
}) => {
  const [lanIp, setLanIp] = useState('192.168.1.100');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const providers = healthData?.providers || {};

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20 select-text">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-teal-400" />
            System & Diagnostics
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">Backend & Connectivity</h2>
        </div>
        <button
          onClick={onRefreshHealth}
          disabled={isCheckingHealth}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50 transition active:scale-95 disabled:opacity-50"
          title="Ping Backend"
          aria-label="Ping Backend"
        >
          <RefreshCw className={`w-4 h-4 text-teal-400 ${isCheckingHealth ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Backend Health Badge */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-teal-400" />
            <div>
              <div className="text-xs font-bold text-white">Full-Stack Engine Status</div>
              <div className="text-[10px] text-teal-400 font-mono">
                {healthData?.service || 'CITYMIND AI Mobile Engine'}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase">
            {healthData?.status || 'HEALTHY'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">App Version</span>
            <span className="font-mono font-bold text-white text-[11px]">{healthData?.version || '2.4.0-android'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Server Uptime</span>
            <span className="font-mono font-bold text-teal-300 text-[11px]">
              {healthData?.uptime_seconds ? `${Math.floor(healthData.uptime_seconds / 60)}m ${healthData.uptime_seconds % 60}s` : 'Active'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Environment</span>
            <span className="font-mono font-bold text-slate-300 text-[11px]">Development</span>
          </div>
        </div>
      </div>

      {/* Provider Connectivity Diagnostics */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Integrated Providers
        </h3>

        <div className="space-y-2">
          {/* Open-Meteo */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <div>
                <div className="font-bold text-slate-200">Open-Meteo Weather API</div>
                <div className="text-[10px] text-slate-400">Pavement conditions, wind, precipitation</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">
              {providers.open_meteo?.status || 'ONLINE'}
            </span>
          </div>

          {/* TomTom Traffic */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <span className={`w-2 h-2 rounded-full ${providers.tomtom_traffic?.live_mode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <div>
                <div className="font-bold text-slate-200">TomTom Traffic Flow & Incidents</div>
                <div className="text-[10px] text-slate-400">Live segment telemetry with honest fallback</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {providers.tomtom_traffic?.status || 'SIMULATED_FALLBACK'}
            </span>
          </div>

          {/* Gemini AI */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <div>
                <div className="font-bold text-slate-200">Google Gemini Multimodal AI</div>
                <div className="text-[10px] text-slate-400">Vision (Argon), High-Thinking, Maps Grounding</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">
              {providers.gemini_ai?.status || 'ONLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Physical Mobile Device Testing & LAN Setup */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-white">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>Physical Android Device Testing (LAN)</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Physical phones cannot resolve <code className="text-teal-300">localhost</code>. Connect your Android phone to the same Wi-Fi and configure your computer's local IP address.
        </p>

        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Computer LAN IP
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={lanIp}
              onChange={(e) => setLanIp(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => handleCopy(`http://${lanIp}:3000`, 'url')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center gap-1 transition"
            >
              {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy URL</span>
            </button>
          </div>
        </div>

        {/* Expo CLI Quick Commands */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1.5">
          <div className="text-slate-500">// Run Expo App on Android:</div>
          <div className="flex items-center justify-between text-teal-300">
            <span>cd mobile && npx expo start</span>
            <button
              onClick={() => handleCopy('cd mobile && npx expo start', 'expo')}
              className="text-slate-400 hover:text-white"
            >
              {copiedKey === 'expo' ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="text-slate-500 pt-1">// Build Android APK via EAS:</div>
          <div className="flex items-center justify-between text-cyan-300">
            <span>eas build -p android --profile preview</span>
            <button
              onClick={() => handleCopy('eas build -p android --profile preview', 'eas')}
              className="text-slate-400 hover:text-white"
            >
              {copiedKey === 'eas' ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Security & Privacy Statement */}
      <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs space-y-1.5">
        <div className="flex items-center space-x-1.5 text-teal-400 font-bold">
          <Lock className="w-4 h-4" />
          <span>Security & API Token Isolation</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          CITYMIND AI securely encapsulates all Gemini and TomTom API credentials inside the backend server environment. Zero private tokens are compiled into the client bundle. Location coordinates are strictly processed in foreground memory for real-time GIS rendering.
        </p>
      </div>
    </div>
  );
};
