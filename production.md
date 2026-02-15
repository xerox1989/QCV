
# Quantum Authentication Vault (QAV) - Production Guide

This guide details the procedures for deploying QAV v8.0 to Web, Windows, and Android.

---

## 1. Environment Requirements
*   **Google Gemini API Key:** Ensure your `process.env.API_KEY` is valid.
*   **NeonDB:** Verify the database connection string is active.
*   **Node.js:** v18.x or higher.
*   **Android Studio:** Required for Play Store packaging.

---

## 2. Web Application Deployment (Recommended: Vercel/Netlify)
The web version is the foundation for all other platforms.

1.  **Build the Project:**
    ```bash
    npm install
    npm run build
    ```
2.  **Configure Environment Variables:**
    In your hosting provider dashboard (Vercel/Netlify/Firebase), add:
    *   `API_KEY`: Your Google GenAI Key.
3.  **Deployment:**
    Upload the `dist/` folder. Ensure the platform supports SPA routing.

---

## 3. Windows Desktop Application (.EXE)
We use **Electron** to wrap the React application into a native Windows executable.

1.  **Installation:**
    ```bash
    npm install electron electron-builder --save-dev
    ```
2.  **Configuration:**
    Ensure `electron-main.js` and `preload.js` are in your root.
3.  **Build EXE:**
    ```bash
    npm run electron-build
    ```
    *This will generate a portable `.exe` and a setup installer in the `dist_electron/` folder.*

---

## 4. Android Version (Google Play Store)
We use **Capacitor** to bridge the web app to native Android.

1.  **Add Capacitor:**
    ```bash
    npm install @capacitor/core @capacitor/cli @capacitor/android
    npx cap init QAV com.quantum.vault
    ```
2.  **Build and Sync:**
    ```bash
    npm run build
    npx cap add android
    npx cap copy
    npx cap sync
    ```
3.  **Android Studio Workflow:**
    ```bash
    npx cap open android
    ```
    *   In Android Studio, go to **Build > Generate Signed Bundle / APK**.
    *   Follow the Google Play instructions to create a Keystore and sign your `.aab` file.
4.  **Hardware Permissions:**
    Ensure `AndroidManifest.xml` includes:
    ```xml
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    ```

---

## 5. Security Checklist for Launch
- [ ] **API Key Restriction:** Restrict your Gemini API key to only your domain/bundle ID in the Google Cloud Console.
- [ ] **Minification:** Ensure all code is minified and obfuscated in production.
- [ ] **SSL/HTTPS:** Native apps and web must serve over HTTPS for WebCrypto and Biometrics to work.
- [ ] **Database Backup:** Enable periodic snapshots in your NeonDB dashboard.

---

## 6. Play Store / Store Metadata
*   **Name:** Quantum Authentication Vault
*   **Category:** Tools / Security
*   **Age Rating:** 3+
*   **Privacy Policy:** Must state that images for AI analysis are processed ephemerally.

---
*Created by Quantum Vault Engineering Team*
