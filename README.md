# LK Diagnostico Clinica

Free financial diagnostic tool for dental clinics. Clinic owners input 7 key metrics and receive a personalized report showing how much money they're losing monthly — broken down by no-shows, rejected quotes, lost patients, and marketing waste.

**Live:** [lk-diagnostico-clinica.vercel.app](https://lk-diagnostico-clinica.vercel.app)

## How It Works

1. **Landing Page** — CTA to start the free diagnostic
2. **Diagnostic Form** — 7 inputs: patients/month, no-show rate, avg ticket, quote acceptance, return rate, marketing spend, new patients
3. **Teaser Gate** — Shows the total loss number, blurs details, captures lead info (name, clinic, WhatsApp, email, city)
4. **Results Dashboard** — Full breakdown with charts, conversion rate benchmarks vs. top clinics, 5-system action plan, PDF export, WhatsApp CTA

## Tech Stack

- **React 19 + Vite 8** (frontend)
- **Vercel Serverless Functions** (backend API)
- **Recharts** (pie chart visualization)
- **jsPDF + html2canvas** (PDF export)
- **Google Sheets** (lead storage via Apps Script)
- **Facebook CAPI** (server-side conversion tracking)
- **WhatsApp** (automated report delivery via LK Chatbot + Evolution API fallback)
- **PWA** (manifest + service worker)

## Setup

```bash
npm install
cp .env.example .env
# Fill in your env vars (see .env.example)
npm run dev
```

## Environment Variables

### Frontend (browser-side, prefixed with `VITE_`)
| Variable | Description |
|---|---|
| `VITE_GOOGLE_SHEET_URL` | Google Apps Script Web App URL for lead storage |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number for the CTA button |

### Backend (Vercel serverless, set in Vercel dashboard)
| Variable | Description |
|---|---|
| `PIXEL_ID` | Facebook Pixel ID |
| `CAPI_ACCESS_TOKEN` | Facebook Conversions API access token |
| `LK_CHATBOT_URL` | LK Chatbot webhook base URL |
| `LK_CHATBOT_API_KEY` | Chatbot API key |
| `LK_CHATBOT_TENANT_ID` | Chatbot tenant ID |
| `EVOLUTION_API_URL` | Evolution API base URL (fallback) |
| `EVOLUTION_API_INSTANCE` | Evolution API instance name |
| `EVOLUTION_API_KEY` | Evolution API key |

## Deployment

Deployed on Vercel. Push to `master` triggers auto-deploy.

```bash
npm run build   # outputs to dist/
```

## Project Structure

```
src/
  components/
    LandingPage.jsx      # Hero + CTA
    DiagnosticForm.jsx    # 7-field input form with validation
    TeaserGate.jsx        # Lead capture gate with blurred preview
    ResultsDashboard.jsx  # Full results + benchmarks + charts + PDF
  utils/
    calculations.js       # Diagnostic math + benchmarks
    sheets.js             # Google Sheets integration
    webhook.js            # WhatsApp delivery
    capi.js               # Facebook CAPI client
  config.js               # App configuration (env vars)
api/
  capi.js                 # Vercel serverless: CAPI proxy
  send-whatsapp.js        # Vercel serverless: WhatsApp delivery
```

## License

Proprietary — LK Digital
