import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Camera, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertTriangle,
  Upload,
  X,
  MapPin,
  HelpCircle,
  Check
} from 'lucide-react';

interface InfrastructureViewProps {
  reports: any[];
  onAddReport: (newReport: any) => Promise<void>;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({
  reports,
  onAddReport,
  onUpdateStatus,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80');
  const [title, setTitle] = useState('');
  const [hazardType, setHazardType] = useState('POTHOLE');
  const [severity, setSeverity] = useState('CRITICAL');
  const [address, setAddress] = useState('Market St & 7th St, San Francisco');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('37.7790');
  const [longitude, setLongitude] = useState('-122.4140');
  
  // AI Vision state
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sample photos for quick one-click testing
  const samplePresets = [
    {
      name: 'Severe Pothole',
      url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      type: 'POTHOLE',
      severity: 'CRITICAL',
      title: 'Deep Asphalt Pothole near Crosswalk',
      address: 'Market St & 6th St',
    },
    {
      name: 'Traffic Signal Stuck',
      url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80',
      type: 'SIGNAL_FAULT',
      severity: 'HIGH',
      title: 'Signal Sequence Desynchronization',
      address: 'Mission St & 4th St',
    },
    {
      name: 'Pavement Crack',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=600&auto=format&fit=crop&q=80',
      type: 'PAVEMENT_CRACK',
      severity: 'MEDIUM',
      title: 'Structural Longitudinal Crack',
      address: 'Haight St & Clayton St',
    },
  ];

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoBase64(base64);
        setPhotoUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Gemini Multimodal AI Analysis
  const handleAnalyzeWithGemini = async () => {
    setIsAnalyzingAi(true);
    setFormError(null);

    try {
      const res = await fetch('/api/ai/analyze-infrastructure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo_base64: photoBase64 || photoUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysisResult(data.analysis);
        if (data.analysis?.severity) {
          setSeverity(data.analysis.severity);
        }
        if (data.analysis?.defect_type && !title) {
          setTitle(data.analysis.defect_type);
        }
        if (data.analysis?.structural_risk_summary && !description) {
          setDescription(data.analysis.structural_risk_summary);
        }
      } else {
        setFormError('Failed to run AI analysis.');
      }
    } catch {
      setFormError('Network error connecting to AI vision scanner.');
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Submit report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please provide a title for the hazard report.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await onAddReport({
        title: title.trim(),
        type: hazardType,
        severity,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address.trim(),
        description: description.trim(),
        photo_url: photoUrl,
        urgency_score: aiAnalysisResult?.urgency_score || (severity === 'CRITICAL' ? 9 : severity === 'HIGH' ? 7 : 5),
        ai_analysis: aiAnalysisResult,
      });

      // Reset form
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setAiAnalysisResult(null);
    } catch {
      setFormError('Failed to submit report. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports = activeFilter === 'ALL'
    ? reports
    : reports.filter((r) => r.status.toUpperCase() === activeFilter.toUpperCase());

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20 select-text">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Infrastructure Monitoring
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">Civil Hazard Radar</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Report Hazard</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'IN_REVIEW', 'DISPATCHED', 'SCHEDULED', 'REPAIRED'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              activeFilter === filter
                ? 'bg-slate-800 text-teal-300 border-teal-500/50'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {filter.replace('_', ' ')}
            {filter === 'ALL' ? ` (${reports.length})` : ''}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto mb-2 opacity-70" />
            <h4 className="text-sm font-semibold text-white">No hazards in this category</h4>
            <p className="text-xs text-slate-400 mt-1">All monitored roadway segments are verified clear.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 shadow-lg space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <img
                    src={report.photo_url}
                    alt={report.title}
                    className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          report.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : report.severity === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        }`}
                      >
                        {report.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Urgency: <span className="font-bold text-white">{report.urgency_score}/10</span>
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-100 mt-1 leading-snug">
                      {report.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                      {report.address}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold uppercase tracking-wider shrink-0">
                  {report.status.replace('_', ' ')}
                </span>
              </div>

              {/* AI Vision Insights (if analyzed) */}
              {report.ai_analysis && (
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-teal-500/20 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-teal-300 font-medium text-[10px]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      Gemini Multimodal Inspection
                    </span>
                    <span className="font-mono">Hazard: {report.ai_analysis.vehicle_hazard_rating}/10</span>
                  </div>
                  <div className="text-slate-300 text-[10px]">
                    Est. Void Depth: <span className="font-mono font-bold text-white">{report.ai_analysis.estimated_depth_cm} cm</span> • 
                    Diameter: <span className="font-mono font-bold text-white">{report.ai_analysis.estimated_diameter_cm} cm</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Fix: {report.ai_analysis.repair_material_recommendation}
                  </div>
                </div>
              )}

              {/* Status Advancement Button Group */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Workflow:</span>
                <div className="flex items-center space-x-1.5">
                  {(['IN_REVIEW', 'DISPATCHED', 'SCHEDULED', 'REPAIRED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(report.id, st)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        report.status === st
                          ? 'bg-teal-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {st === 'IN_REVIEW' ? 'Review' : st === 'DISPATCHED' ? 'Dispatch' : st === 'SCHEDULED' ? 'Schedule' : 'Repaired'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Report Hazard with Gemini Multimodal Scan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">Report Road Hazard</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitReport} className="space-y-4">
              {/* Photo Preview & Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Damage Photo (Upload or Select Preset)
                </label>
                
                <div className="relative rounded-2xl overflow-hidden ring-1 ring-slate-700 h-44 bg-slate-950 flex items-center justify-center">
                  <img
                    src={photoUrl}
                    alt="Hazard Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-teal-300 text-xs font-semibold flex items-center gap-1.5 border border-teal-500/40 shadow-lg">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload My Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[10px] text-slate-400">Or test preset:</span>
                  {samplePresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setPhotoUrl(preset.url);
                        setHazardType(preset.type);
                        setSeverity(preset.severity);
                        setTitle(preset.title);
                        setAddress(preset.address);
                        setAiAnalysisResult(null);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300 border border-slate-700"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gemini AI Scan Action */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-teal-950/50 via-slate-900 to-cyan-950/50 border border-teal-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
                    <span className="text-xs font-bold text-white">Gemini 4 Argon Multimodal Vision</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAnalyzeWithGemini}
                    disabled={isAnalyzingAi}
                    className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1"
                  >
                    {isAnalyzingAi ? (
                      <>
                        <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Scan Photo
                      </>
                    )}
                  </button>
                </div>

                {aiAnalysisResult && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-900/90 border border-teal-500/40 text-xs space-y-1">
                    <div className="text-teal-300 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Detected: {aiAnalysisResult.defect_type}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                      <div>Estimated Depth: <span className="font-mono font-bold text-white">{aiAnalysisResult.estimated_depth_cm} cm</span></div>
                      <div>Diameter: <span className="font-mono font-bold text-white">{aiAnalysisResult.estimated_diameter_cm} cm</span></div>
                      <div>Hazard Rating: <span className="font-mono font-bold text-rose-400">{aiAnalysisResult.vehicle_hazard_rating}/10</span></div>
                      <div>Urgency Priority: <span className="font-mono font-bold text-amber-400">{aiAnalysisResult.urgency_score}/10</span></div>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Recommended Repair: {aiAnalysisResult.repair_material_recommendation}
                    </div>
                  </div>
                )}
              </div>

              {/* Input Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Hazard Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Severe 10-inch Pothole on Market St"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Hazard Type</label>
                    <select
                      value={hazardType}
                      onChange={(e) => setHazardType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-teal-400"
                    >
                      <option value="POTHOLE">Pothole</option>
                      <option value="PAVEMENT_CRACK">Pavement Crack</option>
                      <option value="SIGNAL_FAULT">Signal Malfunction</option>
                      <option value="DRAINAGE_FLOOD">Storm Drain Flood</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Severity</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-teal-400"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Market St & 8th St, San Francisco"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Latitude</label>
                    <input
                      type="text"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Longitude</label>
                    <input
                      type="text"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit to Radar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
