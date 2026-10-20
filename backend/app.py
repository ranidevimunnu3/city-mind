"""
CITYMIND AI — Flask API Server
Smart Mobility & Infrastructure Services
"""

import os
import time
import uuid
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from traffic_intelligence import TrafficIntelligence

app = Flask(__name__)
# Allow CORS for Expo mobile development and local web testing
CORS(app, resources={r"/api/*": {"origins": "*"}})

START_TIME = time.time()
traffic_engine = TrafficIntelligence()

# In-memory storage for reported infrastructure issues
INFRASTRUCTURE_REPORTS = [
    {
        "id": "rep-001",
        "title": "Severe Pothole on Market St & 8th",
        "type": "POTHOLE",
        "severity": "CRITICAL",
        "urgency_score": 9,
        "latitude": 37.7785,
        "longitude": -122.4150,
        "address": "Market St & 8th St, San Francisco, CA",
        "description": "Deep 12-inch rim-damaging asphalt void near pedestrian crosswalk.",
        "status": "IN_REVIEW",
        "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
        "reported_at": int(time.time()) - 7200,
        "verified_by_ai": True,
        "ai_analysis": {
            "defect_type": "Severe Asphalt Void / Fatigue Cracking",
            "estimated_depth_cm": 9.5,
            "estimated_diameter_cm": 42.0,
            "vehicle_hazard_rating": 8.8,
            "repair_material_recommendation": "Cold-mix asphalt patch with mastic seal"
        }
    },
    {
        "id": "rep-002",
        "title": "Malfunctioning Traffic Signal",
        "type": "SIGNAL_FAULT",
        "severity": "HIGH",
        "urgency_score": 8,
        "latitude": 37.7842,
        "longitude": -122.4089,
        "address": "Mission St & 5th St, San Francisco, CA",
        "description": "Northbound yellow cycle stuck in rapid flash mode causing transit delays.",
        "status": "DISPATCHED",
        "photo_url": "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80",
        "reported_at": int(time.time()) - 14400,
        "verified_by_ai": False,
        "ai_analysis": None
    },
    {
        "id": "rep-003",
        "title": "Longitudinal Pavement Fracture",
        "type": "PAVEMENT_CRACK",
        "severity": "MEDIUM",
        "urgency_score": 5,
        "latitude": 37.7695,
        "longitude": -122.4460,
        "address": "Haight St & Ashbury St, San Francisco, CA",
        "description": "Sub-surface subsidence causing 4m longitudinal fissure.",
        "status": "SCHEDULED",
        "photo_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=600&auto=format&fit=crop&q=80",
        "reported_at": int(time.time()) - 28800,
        "verified_by_ai": True,
        "ai_analysis": {
            "defect_type": "Thermal / Longitudinal Joint Crack",
            "estimated_depth_cm": 3.0,
            "estimated_diameter_cm": 15.0,
            "vehicle_hazard_rating": 4.5,
            "repair_material_recommendation": "Hot-pour rubberized bitumen crack sealant"
        }
    }
]


@app.route("/api/health", methods=["GET"])
def health_check():
    """
    Standardized backend health check.
    Returns status, uptime, provider states, and service version.
    """
    tomtom_live = traffic_engine.is_live_available()
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    has_gemini = bool(gemini_key and not gemini_key.startswith("MY_"))

    return jsonify({
        "status": "healthy",
        "service": "CITYMIND AI Mobile & Backend Engine",
        "version": "2.4.0-android",
        "uptime_seconds": int(time.time() - START_TIME),
        "timestamp": int(time.time()),
        "providers": {
            "open_meteo": {
                "name": "Open-Meteo Weather API",
                "status": "ONLINE",
                "auth_required": False
            },
            "tomtom_traffic": {
                "name": "TomTom Flow & Incidents API",
                "status": "ONLINE (LIVE)" if tomtom_live else "SIMULATED_FALLBACK (KEY_NOT_SET)",
                "live_mode": tomtom_live
            },
            "gemini_ai": {
                "name": "Google Gemini Multimodal AI",
                "status": "ONLINE (ACTIVE)" if has_gemini else "ONLINE (DEMO_MODE)",
                "vision_enabled": True,
                "high_thinking_enabled": True
            }
        }
    }), 200


@app.route("/api/weather", methods=["GET"])
def get_weather():
    """
    Fetches real-time weather using Open-Meteo API.
    Accepts latitude and longitude query params (defaulting to San Francisco 37.7749, -122.4194).
    """
    try:
        lat = float(request.args.get("lat", 37.7749))
        lon = float(request.args.get("lon", -122.4194))
    except ValueError:
        return jsonify({"error": "Invalid coordinates provided"}), 400

    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation",
            "daily": "weather_code,temperature_2m_max,temperature_2m_min",
            "timezone": "auto"
        }
        res = requests.get(url, params=params, timeout=5)
        if res.status_code == 200:
            data = res.json()
            current = data.get("current", {})
            return jsonify({
                "provider": "Open-Meteo (Live)",
                "timestamp": int(time.time()),
                "latitude": lat,
                "longitude": lon,
                "temperature_c": current.get("temperature_2m"),
                "weather_code": current.get("weather_code"),
                "wind_speed_kmh": current.get("wind_speed_10m"),
                "humidity_percent": current.get("relative_humidity_2m"),
                "precipitation_mm": current.get("precipitation", 0),
                "daily_forecast": data.get("daily", {})
            }), 200
        else:
            return jsonify({"error": "Failed to fetch from Open-Meteo", "status_code": res.status_code}), 502
    except Exception as e:
        # Fallback response for offline or timeout
        return jsonify({
            "provider": "Open-Meteo (Simulated Fallback)",
            "timestamp": int(time.time()),
            "latitude": lat,
            "longitude": lon,
            "temperature_c": 18.5,
            "weather_code": 1,
            "wind_speed_kmh": 12.0,
            "humidity_percent": 68,
            "precipitation_mm": 0,
            "notice": f"Offline or timeout fallback: {str(e)}"
        }), 200


@app.route("/api/traffic/flow", methods=["GET"])
def get_traffic_flow():
    """
    Returns flow segment data for coordinates.
    """
    try:
        lat = float(request.args.get("lat", 37.7749))
        lon = float(request.args.get("lon", -122.4194))
    except ValueError:
        return jsonify({"error": "Invalid coordinates provided"}), 400

    data = traffic_engine.get_flow_segment(lat, lon)
    return jsonify(data), 200


@app.route("/api/traffic/incidents", methods=["GET"])
def get_traffic_incidents():
    """
    Returns active traffic incidents.
    """
    min_lat = float(request.args.get("min_lat", 37.70))
    min_lon = float(request.args.get("min_lon", -122.55))
    max_lat = float(request.args.get("max_lat", 37.85))
    max_lon = float(request.args.get("max_lon", -122.35))

    incidents = traffic_engine.get_incidents(min_lat, min_lon, max_lat, max_lon)
    return jsonify({
        "provider": "CITYMIND Incident Feed",
        "count": len(incidents),
        "incidents": incidents
    }), 200


@app.route("/api/infrastructure", methods=["GET", "POST"])
def infrastructure_handler():
    """
    GET: list all reported infrastructure defects.
    POST: submit a new report.
    """
    if request.method == "GET":
        status_filter = request.args.get("status")
        reports = INFRASTRUCTURE_REPORTS
        if status_filter:
            reports = [r for r in reports if r["status"].upper() == status_filter.upper()]
        return jsonify({
            "count": len(reports),
            "reports": reports
        }), 200

    if request.method == "POST":
        body = request.get_json() or {}
        title = body.get("title", "").strip()
        if not title:
            return jsonify({"error": "Title is required"}), 400

        try:
            lat = float(body.get("latitude", 37.7749))
            lon = float(body.get("longitude", -122.4194))
        except (ValueError, TypeError):
            return jsonify({"error": "Valid latitude and longitude are required"}), 400

        new_report = {
            "id": f"rep-{str(uuid.uuid4())[:8]}",
            "title": title,
            "type": body.get("type", "POTHOLE"),
            "severity": body.get("severity", "MEDIUM"),
            "urgency_score": body.get("urgency_score", 5),
            "latitude": lat,
            "longitude": lon,
            "address": body.get("address", "Reported City Location"),
            "description": body.get("description", ""),
            "status": "IN_REVIEW",
            "photo_url": body.get("photo_url") or "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
            "reported_at": int(time.time()),
            "verified_by_ai": body.get("verified_by_ai", False),
            "ai_analysis": body.get("ai_analysis")
        }

        INFRASTRUCTURE_REPORTS.insert(0, new_report)
        return jsonify({
            "message": "Infrastructure hazard reported successfully",
            "report": new_report
        }), 201


@app.route("/api/infrastructure/<report_id>", methods=["PATCH"])
def update_infrastructure_status(report_id):
    """
    Update status of an infrastructure report.
    """
    body = request.get_json() or {}
    new_status = body.get("status")
    if not new_status:
        return jsonify({"error": "Status is required"}), 400

    for rep in INFRASTRUCTURE_REPORTS:
        if rep["id"] == report_id:
            rep["status"] = new_status
            return jsonify({"message": "Status updated", "report": rep}), 200

    return jsonify({"error": "Report not found"}), 404


@app.route("/api/insights", methods=["GET"])
def get_insights():
    """
    Urban mobility insights & automated optimization suggestions.
    """
    return jsonify({
        "timestamp": int(time.time()),
        "mobility_score": 78,
        "recommendations": [
            {
                "id": "rec-1",
                "category": "SIGNAL_TIMING",
                "title": "Dynamic Green Wave on 3rd St Corridor",
                "impact": "Reduces bus delay by 18%",
                "confidence": 0.92
            },
            {
                "id": "rec-2",
                "category": "INFRASTRUCTURE",
                "title": "Immediate Cold Patch Dispatch for Market St #rep-001",
                "impact": "Averts cyclist tire hazard during PM peak",
                "confidence": 0.96
            },
            {
                "id": "rec-3",
                "category": "WEATHER_ADVISORY",
                "title": "Wet Pavement Speed Advisory in Sunset District",
                "impact": "Decreases hydroplaning accident probability by 34%",
                "confidence": 0.88
            }
        ]
    }), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
