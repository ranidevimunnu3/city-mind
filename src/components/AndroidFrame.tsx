import React from 'react';
import { Wifi, Signal, Battery, Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isDeviceMode: boolean;
  onToggleMode: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isDeviceMode,
  onToggleMode,
}) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-0 md:py-6 md:px-4">
      {/* Top Floating Utility Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between px-4 py-2.5 mb-2 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 md:rounded-2xl md:border z-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="font-black text-slate-950 text-sm tracking-wider">CM</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-tight text-white">CITYMIND AI</h1>
              <span className="text-[10px] bg-teal-500/10 text-teal-400 font-semibold px-1.5 py-0.5 rounded border border-teal-500/30">
                v2.4.0 Android
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Smart Mobility & Multimodal Infrastructure Engine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode toggle */}
          <button
            onClick={onToggleMode}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Toggle between Android Pixel frame and Full Viewport mode"
            aria-label={isDeviceMode ? "Switch to Fullscreen viewport" : "Switch to Android Phone frame"}
          >
            {isDeviceMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Expanded View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Pixel 9 Frame</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      {isDeviceMode ? (
        <div className="relative w-full max-w-[412px] h-[860px] bg-slate-950 rounded-[44px] border-[9px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden ring-1 ring-slate-700/50">
          {/* Android Status Bar */}
          <div className="h-10 px-6 pt-2 flex items-center justify-between text-xs text-slate-400 select-none bg-slate-950 z-20 shrink-0">
            <span className="font-semibold text-slate-200 text-[12px] tracking-tight">{currentTime}</span>
            {/* Front Camera Cutout */}
            <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800 mx-auto" />
            <div className="flex items-center space-x-2 text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-mono">88%</span>
                <Battery className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* App Viewport inside Phone Frame */}
          <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-950">
            {children}
          </div>

          {/* Android Gesture Bar */}
          <div className="h-5 bg-slate-950 flex items-center justify-center shrink-0 z-20">
            <div className="w-28 h-1 bg-slate-600 rounded-full opacity-60" />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-5xl flex-1 flex flex-col bg-slate-950 border border-slate-800 md:rounded-2xl overflow-hidden shadow-2xl relative min-h-[780px]">
          {children}
        </div>
      )}
    </div>
  );
};
