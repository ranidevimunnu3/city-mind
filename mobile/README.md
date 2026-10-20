# CITYMIND AI — Android & Mobile App Guide

CITYMIND AI is an Android-first smart mobility, real-time traffic intelligence, and infrastructure inspection app built with **React Native**, **Expo**, **TypeScript**, and **Google Gemini Multimodal AI**.

---

## 📱 Architecture & Features
- **Mobile Stack**: React Native + Expo (SDK 52), TypeScript, Bottom Tabs Navigation.
- **Backend API**: Full-stack Express/Node.js or Python Flask with standardized `/api/*` endpoints.
- **Weather Engine**: Open-Meteo live API integration for roadway temperature, precipitation, and hydroplaning risk.
- **Traffic Intelligence**: TomTom Traffic API with transparent fallback to CITYMIND Simulation Engine when unconfigured.
- **Infrastructure Scanner**: Road damage & pothole reporting with Gemini multimodal vision analysis.
- **AI Operations**: High-thinking urban simulation (`gemini-4-argon`) and Maps Grounding (`gemini-3.8-flash`).

---

## 🚀 Quick Start (Local Mobile Development)

### 1. Prerequisites
- Node.js 20+
- Expo Go app on your Android device (available on Google Play Store) OR Android Studio with an Android Emulator.

### 2. Environment Configuration
Create a `.env` in the `mobile/` directory:
```env
# For Android Emulator: 10.0.2.2 maps to host machine localhost
EXPO_PUBLIC_API_URL="http://10.0.2.2:3000"

# For Physical Android phone over Wi-Fi (replace with your computer's LAN IP):
# EXPO_PUBLIC_API_URL="http://192.168.1.100:3000"
```

### 3. Install & Start Mobile App
```bash
cd mobile
npm install
npx expo start
```
- Press `a` in terminal to open in Android Emulator.
- Or scan the displayed QR code with the **Expo Go** Android app on your phone.

---

## 📦 Building an Android APK (.apk / .aab)

To build a standalone APK without requiring Expo Go:

### Option A: EAS Build (Cloud Workflow)
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Configure project:
   ```bash
   eas build:configure
   ```
3. Generate standalone Android APK for direct installation:
   ```bash
   eas build -p android --profile preview
   ```
4. Download the `.apk` from the provided Expo build dashboard link.

### Option B: Local Android Build
```bash
npx expo run:android --variant release
```

---

## 🔒 Security & Privacy Notice
- API keys (such as `GEMINI_API_KEY` and `TOMTOM_API_KEY`) remain securely on the backend server.
- The mobile app communicates solely with backend proxy endpoints and does not bundle private credentials.
- Foreground location permissions (`ACCESS_FINE_LOCATION`) are only requested to center maps and tag road hazard submissions.
