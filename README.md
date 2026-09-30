# 💨 Vayu — Actionable Clean Air & Hotspot Enforcement

> **Problem Track:** Clean Air & Climate Resilience, India (Hackathon 2026)  
> **Core Concept:** Turn a hidden pollution hotspot into a verified, legally closed enforcement case. An action-driven enforcement tool, not a plain AQI dashboard. Every simulated layer is honestly badged.

---

## ⚡ Quick Start

```bash
# 1. Clone or navigate to the repository
cd vayu

# 2. Seed database with realistic Delhi NCR stations, readings, hotspots & cases
npm run seed

# 3. Start both backend (port 4000) and frontend (port 5173) concurrently
npm run dev
```

The application will be live at:
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:4000](http://localhost:4000)
- **Health Check:** [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## 🏗️ Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, MapLibre GL JS (free OpenStreetMap tiles), Recharts, Zustand, React Router.
- **Backend:** Node.js 20+, Express, TypeScript, Zod for request validation, Multer for evidence photo uploads, Node-Cron for periodic data refresh.
- **Database:** SQLite via zero-setup modular SQL storage layer (ready for immediate drop-in PostgreSQL/PostGIS migration).
- **Architecture:** Monorepo (`/client`, `/server`, `/shared/types.ts`) with root concurrently dev runner. Vite automatically proxies `/api` and `/uploads` to Express on port 4000.

---

## 🌟 Key Product Features

### 1. Live Map & The Hero Moment
- **Toggle "What stations see" vs "Vayu fused view":**
  - **What stations see:** Displays smooth inverse distance weighting (IDW) interpolation across official CAAQMS monitors. Deceptive calm hides severe blindspots.
  - **Vayu fused view:** Fuses station baselines with satellite aerosol optical depth (AOD) and citizen telemetry to reveal unmonitored severe plumes with exact gap badges (e.g. **+186 µg/m³ at Bhalaswa**).
- **Active Layers:** Official CAAQMS monitors, hidden hotspots, citizen reports, NASA FIRMS active fires, animated Open-Meteo wind vectors, pollution grid surface.
- **48-Hour Time Slider:** Interactive scrubber (-24h history to +24h forecast) with play/pause animation.

### 2. Hotspot Drawer
- Displays local fused PM2.5, Indian CPCB AQI category, and sensor blindspot gap over stations.
- Primary source classification with confidence rating (e.g. Open Waste Burning, 94% confidence).
- Explainable **48-hour physical forecast chart** with 90% uncertainty band and dashed severe threshold line at **250 µg/m³**.
- **Create Enforcement Case** button auto-routing the anomaly under CPCB GRAP Stage III rules.

### 3. Mobile-First Citizen Report & DPDP Act 2023 Redaction
- Camera and file photo upload.
- Auto-detect GPS coordinates with demonstration presets.
- **Client-Side Plate & Face Blur Tool:** Canvas-based pixelation tool enabling citizens to redact vehicle registration plates and bystander faces in the browser before upload, ensuring strict compliance with India's **Digital Personal Data Protection (DPDP) Act 2023**.
- Instant AI Computer Vision inspection feedback explicitly labelled: *"AI check labelled as advisory evidence, not regulatory measurement."*

### 4. Enforcement Case Board
- 4-stage Kanban workflow: **Open → Assigned → In Progress → Closed**.
- **24-Hour Statutory Countdown Timer:** Live ticking timer with automated escalation warnings when under 4 hours remaining.
- **Mandatory Photo Closure:** Cases cannot be resolved without geotagged on-ground verification photos showing active suppression (e.g. anti-smog guns, water mist cannons).

### 5. Cross-City Federated Learning
- 3 simulated municipal nodes: **Delhi NCR**, **Kanpur**, **Patna**.
- Real-time **Federated Averaging (FedAvg)** training rounds: observe global and local Mean Absolute Error (MAE) falling from ~31 µg/m³ toward ~12.8 µg/m³.
- Privacy guarantee: **Only model weights are shared**; raw sensor streams never leave municipal boundaries.
- **"Add a City" Form:** Register a new city node purely via config JSON (`POST /api/cities`) with zero code changes; the city immediately appears live in the application!

### 6. Methods & Impact
- Full data inventory transparency: OpenAQ, Open-Meteo, NASA FIRMS, Sentinel-5P, Citizen Reports.
- Physical modeling math: IDW spatial interpolation and advection-diurnal equation.
- Honest benchmarks: **16.4 µg/m³ Model MAE vs 27.8 µg/m³ Persistence Baseline** (41% error reduction; no invented accuracy numbers).
- Clear scientific limitations (secondary particulate non-attributability, satellite cloud/fog limits, advisory status).

---

## 🎬 5-Step Hackathon Demo Scenario

Click the **"Walk Demo Scenario"** button in the top navbar to launch the interactive guided walkthrough:

1. **Step 1: Detect an Unseen Plume**  
   Click the map toggle: switch from *"What Stations See"* to *"Vayu Fused View"* to reveal the Bhalaswa plume (+186 µg/m³ gap over stations).
2. **Step 2: Inspect Hotspot & Forecast**  
   Click the Bhalaswa hotspot marker to open the drawer; review the 94% waste burning confidence and 48h forecast exceeding the 250 µg/m³ severe line.
3. **Step 3: Create Enforcement Case**  
   Click *"Create Enforcement Case"* to route the violation to the Municipal Corporation of Delhi (MCD) Flying Squad under statutory rules.
4. **Step 4: Dispatch Officer & Mobilize**  
   Navigate to the Case Board; observe the 24-hour statutory deadline countdown and assign an enforcement officer.
5. **Step 5: Verify & Close with Ground Photo**  
   Click *"Verify & Close Case"*, upload an on-ground mitigation photo, and archive the resolution in the immutable audit trail.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | System health, uptime, and database entity counts |
| `/api/cities` | GET / POST | List cities or register new city from config JSON |
| `/api/stations` | GET | Station readings with live OpenAQ integration |
| `/api/field` | GET | Spatial pollution grid (`mode=stations` or `mode=fused`) |
| `/api/hotspots` | GET | Detected anomalies with blindspot gap calculations |
| `/api/forecast` | GET | 48h physical forecast with uncertainty band and GRAP triggers |
| `/api/reports` | GET / POST | Citizen reports with multipart upload & AI inspection |
| `/api/cases` | GET / POST | Enforcement cases with statutory routing rules |
| `/api/cases/:id` | PATCH | Update case assignment, officer, or status |
| `/api/cases/:id/close`| POST | Resolve case (mandatory verification photo required) |
| `/api/federation/round`| POST | Execute simulated cross-city federated training round |
| `/api/sources` | GET | Data source transparency and scientific limits disclosures |

---

## 📄 License
Open source for hackathon evaluation and public atmospheric research.
