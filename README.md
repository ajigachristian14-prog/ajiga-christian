# AI Middleman 🇳🇬

> **Tell us what you need. We'll find the right supplier.**

**AI Middleman** is a production-ready, AI-powered B2B procurement and commercial sourcing platform connecting Nigerian enterprise buyers with verified suppliers across Lagos, Ibadan, Abuja, Port Harcourt, and nationwide.

---

## Key Features

- **AI Sourcing Engine**: Conversational natural-language request processing powered by Google Gemini (`gemini-3.8-flash`). Converts unstructured buyer briefs into structured commercial RFQs (specifications, quantities, budgets, delivery timelines).
- **Intelligent Supplier Matching**: Matches requests against verified Nigerian manufacturers, distributors, and corporate suppliers with tier ratings (*Strong Match*, *Good Match*, *Possible Match*).
- **RFQ & Quote Comparison Matrix**:
  - Suppliers submit itemized quotations (unit prices, production lead time, delivery costs, warranties).
  - AI-assisted quote evaluation explaining pricing variances, turnaround trade-offs, and risk factors.
- **AI Negotiation Assistant**: Formulates strategic, respectful volume-based counter-proposals on behalf of buyers.
- **Direct Bank Transfer Payment Rail**:
  - Official receiving treasury account:
    - **Bank**: OPAY
    - **Account Name**: OLAROTIMI RUFUS AJIGA
    - **Account Number**: `8149482654`
  - Active one-click clipboard copying.
  - Manual payment proof & banking session reference submission.
  - Strict multi-stage state protection: *Pending Verification*, *Approved*, *Rejected*.
- **Admin Verification Portal**:
  - Treasury review dashboard for approving/rejecting Direct Bank Transfers.
  - Automatic platform commission recording (5% standard fee, minimum ₦2,500).
  - Real-time marketplace audit logging and dispute resolution.
- **Multi-Role Portals**: Dedicated dashboards for Buyers, Suppliers, and Platform Administrators.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Node.js, Express, Vite middleware integration
- **AI**: `@google/genai` TypeScript SDK (`gemini-3.8-flash`)
- **Database**: Relational file-backed transactional data store with ACID writes and audit logging

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Required for AI sourcing and quote analysis
GEMINI_API_KEY="your-gemini-api-key"

# Port (default 3000)
PORT=3000
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## Default Demo Accounts

For demonstration and testing purposes, quick login is available directly in the UI, or using these credentials:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@aimiddleman.ng` | `AdminPass2026!` |
| **Buyer** | `buyer.demo@aimiddleman.ng` | `BuyerPass2026!` |
| **Supplier (Apparel - Ibadan)** | `supplier.apparel@aimiddleman.ng` | `SupplierPass2026!` |
| **Supplier (Furniture - Lagos)** | `supplier.furniture@aimiddleman.ng` | `SupplierPass2026!` |
| **Supplier (Industrial - Port Harcourt)** | `supplier.industrial@aimiddleman.ng` | `SupplierPass2026!` |
| **Supplier (Tech - Lagos)** | `supplier.tech@aimiddleman.ng` | `SupplierPass2026!` |

---

## License

Apache-2.0
