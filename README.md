# Maatra — Vernacular Medicine & Visual Dose Companion

Maatra is an accessible, voice-first medicine and dose companion designed for people who cannot read English packaging — such as seniors living alone and parents managing multiple children.

## Key Features
- **5 Indian & Vernacular Languages**: Instant switching between English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Tamil (தமிழ்), and Telugu (తెలుగు) with spoken `speechSynthesis` alerts (`en-IN`, `hi-IN`, `kn-IN`, `ta-IN`, `te-IN` at 0.85x speed).
- **Visual Routine Builder**: Set up medicines by pill colour, shape (round, oval, capsule, syrup bottle), dose icons (half-pill, full pills, ml spoons), and meal-linked times.
- **AI Prescription Scanner (`/api/scan`)**: Uses Gemini (`@google/genai`) server-side to extract structured medicine schedules from camera photos or gallery uploads, with automatic fallback to clearly labelled demo data if `GEMINI_API_KEY` is not configured.
- **7-Step Voice-Assisted Onboarding**: Passwordless, no-OTP local profile setup capturing language, personal info, role, health conditions, allergies, lifestyle meal schedules, and caregiver/accessibility needs.
- **Full Health Suite**: Today dashboard with interactive Organ Condition Hero, Family stories & profiles, Medicine Cabinet with stock & look-alike warnings, Vitals logger with sparklines & Recharts charts, Findings-style History timeline, Daily Condition Tips, Doctor Appointments & voice notes, High-Contrast Emergency SOS Card, and Impact streaks.
- **Installable Offline-Ready PWA**: Includes Web App Manifest, Service Worker, and in-app install prompt.

## Development & Build
```bash
npm install
npm run dev    # Starts Express + Vite server on port 3000
npm run build  # Builds production bundle to dist/
```
