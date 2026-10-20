import React, { useState } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  MapPin, 
  Image as ImageIcon, 
  Video, 
  Send, 
  Play, 
  RotateCcw,
  Check,
  Flame,
  Globe
} from 'lucide-react';

export const AiStudioView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'thinking' | 'maps' | 'image' | 'video'>('thinking');

  // High Thinking State
  const [thinkingScenario, setThinkingScenario] = useState('Major Bay Bridge suspension cable maintenance causing westbound lane closure during PM rush hour with unexpected rainstorm.');
  const [isThinkingLoading, setIsThinkingLoading] = useState(false);
  const [thinkingResult, setThinkingResult] = useState<string | null>(null);

  // Maps Grounding State
  const [mapsQuery, setMapsQuery] = useState('Current transit alternatives between Embarcadero station and Mission District during construction');
  const [isMapsLoading, setIsMapsLoading] = useState(false);
  const [mapsResult, setMapsResult] = useState<string | null>(null);

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('Smart city transit hub with electric bus charging catenary and illuminated bike lanes at twilight');
  const [imageRatio, setImageRatio] = useState('16:9');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Veo Video Simulation State
  const [videoPrompt, setVideoPrompt] = useState('Autonomous drone aerial inspection of busy intersection traffic flow with telemetry neon light trails');
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoResultUrl, setVideoResultUrl] = useState<string | null>(null);

  // 1. Run Thinking Mode
  const handleRunThinking = async () => {
    if (!thinkingScenario.trim()) return;
    setIsThinkingLoading(true);
    setThinkingResult(null);

    try {
      const res = await fetch('/api/ai/city-thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_query: thinkingScenario,
          city_name: 'San Francisco Metro',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setThinkingResult(data.simulation_plan);
      }
    } catch {
      setThinkingResult('Simulation failed to connect to neural engine.');
    } finally {
      setIsThinkingLoading(false);
    }
  };

  // 2. Run Maps Grounding
  const handleRunMapsGrounding = async () => {
    if (!mapsQuery.trim()) return;
    setIsMapsLoading(true);
    setMapsResult(null);

    try {
      const res = await fetch('/api/ai/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: mapsQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        setMapsResult(data.answer);
      }
    } catch {
      setMapsResult('Failed to retrieve grounded transit response.');
    } finally {
      setIsMapsLoading(false);
    }
  };

  // 3. Run Image Generation
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsImageLoading(true);

    try {
      const res = await fetch('/api/ai/generate-infrastructure-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspect_ratio: imageRatio,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedImageUrl(data.image_data_url || data.image_url);
      }
    } catch {
      // Fallback
    } finally {
      setIsImageLoading(false);
    }
  };

  // 4. Run Video Simulation
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;
    setIsVideoLoading(true);

    try {
      const res = await fetch('/api/ai/generate-simulation-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspect_ratio: videoRatio,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setVideoResultUrl(data.video_url);
      }
    } catch {
      // Fallback
    } finally {
      setIsVideoLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20 select-text">
      {/* Header */}
      <div>
        <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Multimodal AI Operations
        </span>
        <h2 className="text-xl font-bold text-white tracking-tight">AI City Brain</h2>
      </div>

      {/* Sub-tabs navigation */}
      <div className="flex items-center space-x-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('thinking')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === 'thinking'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>High Thinking</span>
        </button>

        <button
          onClick={() => setActiveSubTab('maps')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === 'maps'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Maps Grounding</span>
        </button>

        <button
          onClick={() => setActiveSubTab('image')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === 'image'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Image Studio</span>
        </button>

        <button
          onClick={() => setActiveSubTab('video')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === 'video'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Veo Video</span>
        </button>
      </div>

      {/* 1. HIGH THINKING MODE */}
      {activeSubTab === 'thinking' && (
        <div className="space-y-3 animate-fade-in">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-teal-400" />
                Gemini 4 Argon (ThinkingLevel.HIGH)
              </span>
              <span className="text-[10px] bg-teal-500/10 text-teal-300 font-mono px-2 py-0.5 rounded border border-teal-500/30">
                Reasoning Enabled
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Evaluates multi-variable urban scenarios, spillback propagation, signal overrides, and emergency dispatch corridors.
            </p>

            <textarea
              rows={3}
              value={thinkingScenario}
              onChange={(e) => setThinkingScenario(e.target.value)}
              placeholder="Describe crisis or construction scenario..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />

            {/* Quick preset scenario buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'Flash flood on lower Market St',
                'Power outage at Montgomery subway station',
                'Freeway off-ramp chemical spill',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setThinkingScenario(preset)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700"
                >
                  {preset}
                </button>
              ))}
            </div>

            <button
              onClick={handleRunThinking}
              disabled={isThinkingLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {isThinkingLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Simulating Multi-System Physics & Flow...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  Execute High-Thinking Urban Simulation
                </>
              )}
            </button>
          </div>

          {/* Simulation Output */}
          {thinkingResult && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-teal-500/40 text-xs text-slate-200 shadow-xl space-y-2 whitespace-pre-wrap leading-relaxed">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-teal-400 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Simulation Directives Ready
                </span>
                <span className="text-[10px] font-mono text-slate-400">Gemini 4 Argon</span>
              </div>
              <div className="text-[11px] prose prose-invert max-w-none text-slate-300">
                {thinkingResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. MAPS GROUNDING */}
      {activeSubTab === 'maps' && (
        <div className="space-y-3 animate-fade-in">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                Gemini 3.8 Flash (Maps & Search Grounding)
              </span>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-500/30">
                Live Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Query real-world locations, transit hub connections, construction advisories, and grounded city geography.
            </p>

            <input
              type="text"
              value={mapsQuery}
              onChange={(e) => setMapsQuery(e.target.value)}
              placeholder="e.g. Best transit route from SFO airport to Downtown"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />

            <button
              onClick={handleRunMapsGrounding}
              disabled={isMapsLoading}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {isMapsLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Grounding with Real Maps & Transit Data...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Search Grounded Mobility Knowledge
                </>
              )}
            </button>
          </div>

          {mapsResult && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 text-xs text-slate-200 shadow-xl space-y-2 leading-relaxed whitespace-pre-wrap">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Grounded Intelligence
                </span>
                <span className="text-[10px] font-mono text-slate-400">Gemini 3.8 Flash</span>
              </div>
              <div className="text-[11px] text-slate-300">{mapsResult}</div>
            </div>
          )}
        </div>
      )}

      {/* 3. IMAGE GENERATOR WITH ASPECT RATIOS */}
      {activeSubTab === 'image' && (
        <div className="space-y-3 animate-fade-in">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-teal-400" />
                Infrastructure Aspect Ratio Studio
              </span>
              <span className="text-[10px] font-mono text-teal-400">Gemini Nano Banana 2.1</span>
            </div>

            <textarea
              rows={2}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="Prompt for infrastructure or architectural render..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />

            {/* Aspect Ratio Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 block">
                Select Aspect Ratio:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['1:1', '16:9', '9:16', '4:3', '3:2', '2:3', '3:4', '21:9'].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setImageRatio(ratio)}
                    className={`py-1 rounded-lg text-xs font-mono font-medium border transition ${
                      imageRatio === ratio
                        ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isImageLoading}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {isImageLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Rendering {imageRatio} Blueprint...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Generate {imageRatio} Visualization
                </>
              )}
            </button>
          </div>

          {generatedImageUrl && (
            <div className="p-3 rounded-2xl bg-slate-900 border border-teal-500/40 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-300">Generated ({imageRatio})</span>
                <span className="text-[10px] text-slate-400 font-mono">Render Complete</span>
              </div>
              <div className="rounded-xl overflow-hidden ring-1 ring-slate-700 bg-black flex items-center justify-center">
                <img
                  src={generatedImageUrl}
                  alt="Generated Smart City Infrastructure"
                  className="max-h-80 w-auto object-contain mx-auto"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. VEO VIDEO SIMULATION */}
      {activeSubTab === 'video' && (
        <div className="space-y-3 animate-fade-in">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Video className="w-4 h-4 text-indigo-400" />
                Veo 3 Video Simulation Studio
              </span>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                veo-3.1-fast-generate-preview
              </span>
            </div>

            <textarea
              rows={2}
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder="Prompt for drone surveillance or intersection simulation..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />

            {/* Video Aspect Ratio Selector (16:9 or 9:16) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 block">
                Video Aspect Ratio:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVideoRatio('16:9')}
                  className={`py-1.5 rounded-xl text-xs font-semibold border transition ${
                    videoRatio === '16:9'
                      ? 'bg-indigo-500 text-white border-indigo-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  16:9 (Landscape HD)
                </button>
                <button
                  type="button"
                  onClick={() => setVideoRatio('9:16')}
                  className={`py-1.5 rounded-xl text-xs font-semibold border transition ${
                    videoRatio === '9:16'
                      ? 'bg-indigo-500 text-white border-indigo-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  9:16 (Portrait Mobile)
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={isVideoLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {isVideoLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Veo 3 Video Simulation...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Generate Veo 3 Video Simulation
                </>
              )}
            </button>
          </div>

          {videoResultUrl && (
            <div className="p-3 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-300">Veo 3 Simulation Preview ({videoRatio})</span>
                <span className="text-[10px] text-slate-400 font-mono">1080p • 30fps</span>
              </div>
              <div className="rounded-xl overflow-hidden ring-1 ring-slate-700 bg-black">
                <video
                  src={videoResultUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full max-h-72 object-cover"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
