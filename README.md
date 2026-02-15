
# Quantum Authentication Vault (QAV) v6.0

**Classification:** RESTRICTED | PROPRIETARY  
**System Version:** 6.0.0 (Neon Horizon)  
**Architecture:** Zero-Knowledge | Client-Side Encryption  

---

## 1. Executive Summary

Quantum Authentication Vault (QAV) is a high-assurance, military-grade credential management system designed for the post-password era. It leverages **AES-256-GCM** encryption, **Hardware Key (FIDO2)** integration, and **Generative AI** for document analysis. Built on a zero-knowledge architecture, QAV ensures that encryption keys never leave the client device in unencrypted form.

## 2. Core Features

### 2.1 Security Enclave
*   **Zero-Knowledge Proof:** Data is encrypted/decrypted locally using a key derived from the Master PIN (`PBKDF2` + `AES-GCM`).
*   **Multi-Factor Authentication (MFA):** Supports YubiKey, FaceID/TouchID (WebAuthn), and PIN-based auth.
*   **Secure Recovery:** Proprietary recovery protocol using encrypted security answers to restore Master Keys without server intervention.
*   **Clipboard Protection:** Ephemeral clipboard access with auto-clear and blocking capabilities.

### 2.2 Identity Management
*   **Vault Item Types:** Passwords, ID Cards, X.509 Certificates, Bank Cards, Secure Notes.
*   **AI-Powered OCR:** Integrated Google Gemini 2.5 Flash for analyzing and extracting data from physical ID cards and QR codes.
*   **Certificate Engine:** Built-in PKI tools to generate self-signed RSA-2048 certificates and monitor expiration.

### 2.3 Connectivity & Portability
*   **Secure P2P Sharing:** Ephemeral, time-limited QR codes with AES-GCM payload encryption for device-to-device credential transfer.
*   **Cloud Sync:** Encrypted synchronization with Google Drive, OneDrive, and Dropbox (Architecture Ready).
*   **Interoperability:** Import/Export support for JSON, CSV, encrypted PDF, and XLSX.

### 2.4 User Experience (UX)
*   **Theme Engine:** Dynamic CSS variable injection supporting Deep Cyan, Electric Purple, and custom gradient themes.
*   **Visualization:** Real-time cryptographic health gauges, radar charts, and activity graphs.

---

## 3. System Architecture

### 3.1 Frontend Layer
*   **Framework:** React 19 (TypeScript)
*   **State Management:** React Hooks + Context-less Prop Drilling for security isolation.
*   **UI Library:** Tailwind CSS with custom `Neon` utility classes and GPU-accelerated animations.

### 3.2 Cryptographic Layer (`/services/cryptoService.ts`)
*   **Algorithm:** AES-GCM (256-bit)
*   **Key Derivation:** PBKDF2 (SHA-256, 100,000 Iterations)
*   **Randomness:** `window.crypto.getRandomValues` (CSPRNG)
*   **PKI:** `node-forge` for RSA key generation and X.509 signing.

### 3.3 Data Layer (`/services/db.ts`)
*   **Primary Storage:** NeonDB (PostgreSQL) via Serverless Driver.
*   **Schema:**
    *   `users`: User profile metadata (Public).
    *   `vaults`: Encrypted binary blobs (Private).
    *   `user_configs`: Application preferences (Non-sensitive).
*   **Offline Strategy:** LocalStorage fallback with encrypted indices.

### 3.4 Intelligence Layer (`/services/geminiService.ts`)
*   **Model:** `gemini-2.5-flash-image`
*   **Function:** Image classification, text extraction, and security analysis.

---

## 4. Module Description

| Module | Function |
| :--- | :--- |
| **Auth Core** | Handles Login, Registration, PIN Hashing, and Biometric Challenges. |
| **Vault Engine** | Manages CRUD operations, Client-side Decryption, and Search Filtering. |
| **Creator Panel** | Admin interface for Theme customization, App branding, and User management. |
| **Import/Export** | Parsing engine for CSV/XLSX and PDF generation (jspdf). |
| **P2P Node** | Generates and scans encrypted QR codes for secure sharing. |

---

## 5. Developer Manual

### Prerequisites
*   Node.js v18+
*   NeonDB Connection String
*   Google Gemini API Key

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment:
    *   Set `API_KEY` in process environment or inject via build tools.

### Running Development Server
```bash
npm start
```
*Access via `http://localhost:3000`*

### Building for Production
```bash
npm run build
```

### Desktop Packaging (Electron)
```bash
# Terminal 1
npm start
# Terminal 2
electron .
```

---

## 6. License & Legal

**LICENSE: PROPRIETARY / CLOSED SOURCE**

Copyright © 2024 Mohammad Maynul Hasan. All Rights Reserved.

Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited. This software is proprietary to the copyright holder.

*   **Commercial Use:** Requires a specific commercial license agreement.
*   **Private Use:** Granted only to authorized personnel.
*   **Warranty:** THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

---

**Contact:** eayneural@gmail.com
# Quantum-Credentials-Voult-
# Quantum-Credentials-Voult-
# Quantum-Credentials-Voult-
# Quantum-Credentials-Voult-
# Quantum-Credentials-Voult-
# Quantum-Credentials-Voult-
