# LendSwift - Multi-Step Loan Application

LendSwift is a production-grade, 8-step multi-step loan application form built with React and Vite. It is designed to handle complex requirements including conditional routing, AES-256 state encryption, E-Signatures, and RBI-compliant data collection securely and responsively.

## 🚀 Live Deployment
- **Vercel Preview URL:** *(Will be generated upon deployment)*

## 📦 Setup Instructions

To run this application locally, ensure you have Node.js 18+ installed.

1. **Clone & Install Dependencies**
```bash
git clone <your-repo-url>
cd loan-application
npm install
```

2. **Run the Development Server**
```bash
npm run dev
```

3. **Run End-to-End Tests (Cypress)**
```bash
# To run headless tests:
npm run test:e2e

# To open the Cypress UI:
npm run cypress:open
```

## 🏗️ Architecture Decisions

### 1. State Persistence & Security
We strictly adhere to the RBI guidelines for handling Personally Identifiable Information (PII) on the client side. 
- **Tool:** Zustand (for lightweight global state).
- **Security:** Web Crypto API (`crypto.subtle`) encrypts the Zustand state payload using `AES-GCM` before persisting it to `LocalStorage`.
- **TTL:** The Auto-Save engine implements a strict 72-hour Time-to-Live (TTL). Expired drafts are automatically purged.

### 2. Validation Engine
- **Tool:** React Hook Form + Zod.
- **Why:** To efficiently handle 50+ fields across 8 dynamic steps without severe re-render performance hits. Zod is used for schema-based validation, particularly utilizing `.superRefine` to create complex, conditional cross-field dependencies (e.g., swapping Salaried vs. Self-Employed requirements instantly).

### 3. Component Design Patterns
All UI elements follow strict patterns for maintainability and WCAG AA Accessibility:
- **Compound Components:** Standard inputs use the compound pattern (`<Input.Label>`, `<Input.Field>`) to tightly couple accessibility ARIA-labels with their respective fields and errors.
- **Render Props:** The `FileUpload` component uses the render props pattern to allow customized, decoupled file previews while maintaining the `react-dropzone` drag-and-drop core.

## 📸 Application Flow (Screenshots)

*Note: Add screenshots here prior to final submission*

1. **Step 1: Loan Type** - Dynamic card selectors and amount formatting.
2. **Step 2: Personal Info** - Data gathering with input masks.
3. **Step 3: KYC Verification** - Simulated API delays and UI locking for PAN/Aadhaar validation.
4. **Step 4: Address Details** - Dynamic rent inputs.
5. **Step 5: Employment** - Conditional branch logic (Salaried vs. Business).
6. **Step 6: Co-Applicant** - Skips automatically for small personal loans!
7. **Step 7: Documents** - Multi-file dropzones with Base64 limits.
8. **Step 8: Review & Submit** - Live summary extraction and E-Signature Canvas integration.

---
*Developed for the ZeTheta Algorithms Frontend Engineering Simulation.*
