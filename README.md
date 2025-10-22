# BharatMesh

**Offline-First Service Orchestration Platform for Tier 2/3 Indian SMBs**

## Vision

Enable small and medium businesses in Tier 2/3 Indian cities to digitize operations using microservices that run locally on low-cost devices, work offline during power cuts and internet outages, and sync peer-to-peer without mandatory cloud dependency.

## Key Features

✅ **100% Offline Operation** - Works 24+ hours without internet  
✅ **P2P Mesh Sync** - Automatic device discovery via WiFi/Bluetooth  
✅ **Vernacular UI** - 8+ Indian languages with voice support  
✅ **Low-Cost Hardware** - Runs on ₹8K-12K Android tablets  
✅ **Zero Cloud Dependency** - Optional backup only  
✅ **Power Resilient** - Bluetooth fallback during outages

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Material-UI + PWA
- **Backend:** Node.js 20 + Express + MongoDB + Socket.io
- **Sync:** WebRTC + PouchDB + CRDT conflict resolution
- **Storage:** IndexedDB (client) + MongoDB (local server)
- **Security:** JWT + AES-256-GCM + Biometric auth

## Project Structure

```
bharatmesh/
├── backend/          # Node.js/Express server
│   ├── src/
│   │   ├── api/      # REST API routes
│   │   ├── services/ # Business logic
│   │   ├── models/   # MongoDB schemas
│   │   ├── sync/     # P2P sync engine
│   │   └── discovery/# Device discovery
├── frontend/         # React PWA
│   ├── src/
│   │   ├── modules/  # Microservices (Billing, Inventory, etc.)
│   │   ├── core/     # Shared components
│   │   ├── sync/     # P2P sync client
│   │   └── i18n/     # Translations
└── shared/           # Shared TypeScript types
```

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+
- npm or yarn

### Installation

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Backend runs on: http://localhost:5000
# Frontend runs on: http://localhost:5173
```

### First-Time Setup

1. Install BharatMesh APK on Android device (or use PWA in browser)
2. Choose business template (Kirana/Coaching/Manufacturing)
3. Enable required modules
4. Import products/students CSV (optional)
5. Pair additional devices via QR code
6. Start transacting!

## Core Modules

### 1. Billing
- Offline invoice generation
- Multi-tender support (Cash/UPI/Card/Credit)
- GST compliance (CGST/SGST/IGST)
- Thermal printer support
- Barcode scanning

### 2. Inventory
- Real-time stock tracking
- Batch and expiry management
- Low-stock alerts
- Supplier quick-reorder
- Valuation reports

### 3. Orders (WhatsApp Integration)
- Automated order parsing
- Vernacular NLP support
- Status updates
- Voice note transcription

### 4. UPI Reconciliation
- SMS parsing (on-device only)
- Auto-match to invoices
- Partial payment support
- Unidentified payment queue

### 5. Attendance
- Geofenced clock in/out
- Selfie verification
- Shift scheduling
- Salary calculation

## Offline-First Architecture

### Local-First Data Flow
```
User Action → IndexedDB (instant) → Local Queue → P2P Sync → Cloud Backup (optional)
```

### Sync Priority Lanes
- **Critical** (<30s): Billing, Payments
- **High** (2-5min): Inventory, Orders
- **Medium** (daily): Attendance
- **Low** (weekly): Analytics

### Conflict Resolution
- **Last-Write-Wins** (LWW) for simple fields
- **Additive Counters** for inventory
- **Manual Review** for financial duplicates
- **Visual Diff UI** for owners

## Device Requirements

- **OS:** Android 10+
- **RAM:** 3GB minimum, 4GB recommended
- **Storage:** 8GB free space
- **Connectivity:** WiFi 2.4/5GHz + Bluetooth 5.0
- **Optional:** Thermal printer (Bluetooth), Barcode scanner

## Pricing

- **Free Tier:** Up to 3 devices, core modules, local-only
- **Pro (₹299/mo):** Up to 10 devices, 10GB cloud backup, WhatsApp API
- **Enterprise (₹999/mo):** Unlimited devices, 100GB backup, multi-location

## Security

- **Authentication:** JWT + Biometric/PIN unlock
- **Encryption:** AES-256-GCM for sensitive data at rest
- **Transport:** TLS 1.3 + WebRTC DTLS/SRTP
- **Privacy:** On-device analytics, no third-party trackers
- **RBAC:** Owner, Manager, Employee, Auditor, Family roles

## Development Timeline

- **Week 1-2:** Registry, Discovery, Billing, Hindi UI
- **Week 3:** Inventory, Sync, Conflict resolution
- **Week 4:** Attendance, Exports (PDF/CSV)
- **Week 5:** WhatsApp Orders, UPI reconciliation
- **Week 6:** Admin panel, Backup/Restore, Analytics
- **Buffer:** Pilot testing, performance optimization

## Target Users

### Primary Personas
1. **Kirana Store Owners** - Grocery/retail shops
2. **Coaching Centers** - Education institutions
3. **Small Manufacturers** - Auto parts, handicrafts

### Market Opportunity
- **50M+ SMBs** in Tier 2/3 India
- **<5% digitized** (vs 40% in metros)
- **₹2,500 Cr+ TAM** (10% penetration @ ₹5K ARPU)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

- **Documentation:** [docs.bharatmesh.in](https://docs.bharatmesh.in)
- **WhatsApp:** +91-XXXX-XXXXXX (Hindi/English/Tamil support)
- **Email:** support@bharatmesh.in
- **Community:** [community.bharatmesh.in](https://community.bharatmesh.in)

---

**Built with ❤️ for Bharat SMBs**

