import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Search, 
  MapPin, 
  Layers, 
  Crosshair, 
  X, 
  AlertOctagon, 
  Activity, 
  ExternalLink,
  ChevronUp,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface CityMapViewProps {
  infrastructureReports: any[];
  trafficIncidents: any[];
  onSelectReport?: (report: any) => void;
  onUpdateReportStatus?: (id: string, newStatus: string) => void;
}

export const CityMapView: React.FC<CityMapViewProps> = ({
  infrastructureReports,
  trafficIncidents,
  onUpdateReportStatus,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [activeLayerFilter, setActiveLayerFilter] = useState<'ALL' | 'HAZARDS' | 'TRAFFIC'>('ALL');
  const [isSearching, setIsSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Guard against multiple initializations
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [37.7749, -122.4194], // San Francisco default
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Free OpenStreetMap tiles with dark CSS filter
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

      // Custom Zoom control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Layer group for dynamic markers
      const markerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update Markers when data or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Add Infrastructure Markers
    if (activeLayerFilter === 'ALL' || activeLayerFilter === 'HAZARDS') {
      infrastructureReports.forEach((rep) => {
        if (!rep.latitude || !rep.longitude) return;

        const isCritical = rep.severity === 'CRITICAL';
        const color = isCritical ? '#f43f5e' : rep.severity === 'HIGH' ? '#fbbf24' : '#14b8a6';

        const customHtml = `
          <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px ${color}88; border: 2px solid #ffffff; cursor: pointer;">
            <span style="font-size: 14px;">⚠️</span>
          </div>
        `;

        const icon = L.divIcon({
          className: 'citymind-hazard-pin',
          html: customHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([rep.latitude, rep.longitude], { icon });
        marker.on('click', () => {
          setSelectedItem({ ...rep, itemType: 'INFRASTRUCTURE' });
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([rep.latitude, rep.longitude]);
          }
        });
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 2. Add Traffic Incident Markers
    if (activeLayerFilter === 'ALL' || activeLayerFilter === 'TRAFFIC') {
      trafficIncidents.forEach((inc) => {
        if (!inc.latitude || !inc.longitude) return;

        const customHtml = `
          <div style="background-color: #38bdf8; width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px #38bdf888; border: 2px solid #0f172a; cursor: pointer;">
            <span style="font-size: 13px;">🚗</span>
          </div>
        `;

        const icon = L.divIcon({
          className: 'citymind-traffic-pin',
          html: customHtml,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([inc.latitude, inc.longitude], { icon });
        marker.on('click', () => {
          setSelectedItem({ ...inc, itemType: 'TRAFFIC_INCIDENT' });
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([inc.latitude, inc.longitude]);
          }
        });
        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [infrastructureReports, trafficIncidents, activeLayerFilter]);

  // Recenter GPS
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([37.7749, -122.4194], 14, { duration: 1 });
    setStatusMessage('Centered to Central Metro Division');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  // Search address handler
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ', San Francisco'
        )}`
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const first = results[0];
          const lat = parseFloat(first.lat);
          const lon = parseFloat(first.lon);
          mapInstanceRef.current.flyTo([lat, lon], 15, { duration: 1.2 });
          setStatusMessage(`Found: ${first.display_name.split(',')[0]}`);
          setTimeout(() => setStatusMessage(null), 3000);
        } else {
          setStatusMessage('No matching location found');
          setTimeout(() => setStatusMessage(null), 2500);
        }
      }
    } catch {
      setStatusMessage('Location search timeout');
      setTimeout(() => setStatusMessage(null), 2500);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col overflow-hidden select-text relative">
      {/* Pinned Top Bar: Search and Hotspot Filters */}
      <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 z-20 shrink-0 space-y-2 shadow-lg">
        <form onSubmit={handleSearchSubmit}>
          <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5">
            <Search className={`w-3.5 h-3.5 text-slate-400 mr-2 ${isSearching ? 'animate-pulse text-teal-400' : ''}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search intersection, avenue or landmark..."
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Layer Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => setActiveLayerFilter('ALL')}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide transition border ${
              activeLayerFilter === 'ALL'
                ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            All Hotspots ({infrastructureReports.length + trafficIncidents.length})
          </button>
          <button
            onClick={() => setActiveLayerFilter('HAZARDS')}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide transition border ${
              activeLayerFilter === 'HAZARDS'
                ? 'bg-rose-500 text-white border-rose-400 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Potholes ({infrastructureReports.length})
          </button>
          <button
            onClick={() => setActiveLayerFilter('TRAFFIC')}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide transition border ${
              activeLayerFilter === 'TRAFFIC'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Traffic ({trafficIncidents.length})
          </button>
        </div>
      </div>

      {/* Map Body */}
      <div className="flex-1 relative w-full h-full min-h-0">
        {/* Recenter Button */}
        <div className="absolute right-3 bottom-6 z-[1000] flex flex-col space-y-2">
          <button
            onClick={handleRecenter}
            className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700 text-teal-400 shadow-xl flex items-center justify-center hover:bg-slate-800 active:scale-95 transition"
            title="Recenter to Central Metro"
            aria-label="Recenter to Central Metro"
          >
            <Crosshair className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Notification */}
        {statusMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-full bg-slate-900/95 border border-teal-500/40 text-teal-300 text-xs font-medium shadow-2xl pointer-events-none flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            {statusMessage}
          </div>
        )}

        {/* Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full bg-slate-950" />
      </div>

      {/* Selected Item Bottom Sheet */}
      {selectedItem && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/80 p-4 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] animate-slide-up max-h-[75%] overflow-y-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  selectedItem.severity === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {selectedItem.severity || 'ALERT'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedItem.itemType === 'INFRASTRUCTURE' ? 'CIVIL INFRASTRUCTURE' : 'TRAFFIC DISRUPTION'}
              </span>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800/80"
              aria-label="Close details sheet"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-sm font-bold text-white mt-1.5">{selectedItem.title || selectedItem.description}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-teal-400" />
            {selectedItem.address || `${selectedItem.latitude.toFixed(4)}, ${selectedItem.longitude.toFixed(4)}`}
          </p>

          {/* Infrastructure Photo & AI Details */}
          {selectedItem.itemType === 'INFRASTRUCTURE' && (
            <div className="mt-3 space-y-2.5">
              {selectedItem.photo_url && (
                <div className="relative rounded-xl overflow-hidden ring-1 ring-slate-700 max-h-36">
                  <img
                    src={selectedItem.photo_url}
                    alt={selectedItem.title}
                    className="w-full h-36 object-cover"
                  />
                  {selectedItem.verified_by_ai && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-teal-500/40 text-[9px] font-bold text-teal-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      Gemini Vision Verified
                    </div>
                  )}
                </div>
              )}

              {selectedItem.ai_analysis && (
                <div className="p-2.5 rounded-xl bg-slate-800/70 border border-teal-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between text-teal-400 font-semibold text-[11px]">
                    <span>Defect: {selectedItem.ai_analysis.defect_type}</span>
                    <span>Hazard: {selectedItem.ai_analysis.vehicle_hazard_rating}/10</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Depth: <span className="font-mono text-white">{selectedItem.ai_analysis.estimated_depth_cm} cm</span> • 
                    Diameter: <span className="font-mono text-white"> {selectedItem.ai_analysis.estimated_diameter_cm} cm</span>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">
                    Material: {selectedItem.ai_analysis.repair_material_recommendation}
                  </div>
                </div>
              )}

              {/* Status Update Actions */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Current Status:</span>
                <div className="flex items-center space-x-1">
                  {(['IN_REVIEW', 'DISPATCHED', 'REPAIRED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        if (onUpdateReportStatus) onUpdateReportStatus(selectedItem.id, st);
                        setSelectedItem({ ...selectedItem, status: st });
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition ${
                        selectedItem.status === st
                          ? 'bg-teal-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Traffic Incident Details */}
          {selectedItem.itemType === 'TRAFFIC_INCIDENT' && (
            <div className="mt-3 p-3 rounded-xl bg-slate-800/80 border border-cyan-500/30 text-xs space-y-1">
              <div className="flex items-center justify-between text-cyan-400 font-semibold">
                <span>Estimated Delay: +{Math.round(selectedItem.delay_seconds / 60)} minutes</span>
                <span>Type: {selectedItem.type}</span>
              </div>
              <p className="text-[11px] text-slate-300">{selectedItem.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
