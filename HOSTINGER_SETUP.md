# Hostinger Deployment Guide for ShopMaster POS

Congratulations on your POS system! Version v4.2.5 is ready for release. To make it live on **pos.sellerscampus.com** using Hostinger, follow these steps:

## 1. Prepare your Repository
1. Push your code to a **GitHub repository** (Private or Public).
2. Ensure you have the `server.ts`, `package.json`, and `.env.example` files at the root.

## 2. Hostinger Setup (Node.js App)
1. Log in to your **Hostinger hPanel**.
2. **Finding Node.js block**:
   - **Method A**: Use the **Search bar** at the very top of your Hostinger hPanel and type **"Node"** or **"Node.js"**, then click on the suggested result.
   - **Method B**: Go to **Websites** -> click **Manage** next to your domain -> scroll down the left-hand sidebar to the **Advanced** section -> click **Node.js**.
   *(Note: If you do not see Node.js anywhere, your Hostinger plan does not support custom Node.js servers. Read Section 7 below for alternatives).*
3. Click **Create Application** or **Import from GitHub**.
4. **Application Configuration**:
   - **App Directory / Application URL**: Map it to your subdomain (e.g., `pos.sellerscampus.com`).
   - **Entry File**: Set this exactly to **`dist/server.cjs`** (This is the production-ready pre-compiled file generated during the build step!).
     - *Alternative (only if Hostinger complains about directories)*: Keep the Entry File as `server.js` but create a simple `server.js` file inside Hostinger's File Manager with the content: `require('./dist/server.cjs');` (This way it stays out of your main Git repository where it would break compiler pipelines!).
   - **Port Settings (Automatic)**: **You do not need to configure any custom or manual ports inside Hostinger!** Leave any port settings to default. Hostinger assigns a dynamic port inside their environment and we automatically listen to it using modern environment bindings.
5. **Environment Variables**:
   - Go to the **Environment Variables** tab inside the Hostinger Node.js manager interface (matching your screenshot).
   - Add `NODE_ENV=production`
   - Add `GEMINI_API_KEY` (Your Google Gemini API Key for Voice matching AI)
   - Add `ZENDER_MASTER_API_KEY` (Your SellersCampus dynamic messaging gateway key)

## 3. Domain Configuration (pos.sellerscampus.com)
1. In Hostinger, go to **Domains** -> **Manage**.
2. Add a **CNAME** record:
   - **Name**: `pos`
   - **Points to**: Your Hostinger hosting server address (or use the Node.js domain mapping feature).
3. In the Node.js section, map your app to the domain **pos.sellerscampus.com**.

## 4. Automatic Updates (CI/CD)
- When you connect Hostinger to GitHub, enable **"Auto Deploy"**.
- Now, whenever you push changes to your GitHub `main` branch, Hostinger will automatically:
  1. Pull the new code.
  2. Run `npm install`.
  3. Run `npm run build` (Client).
  4. Restart the server.

## 5. Manual Build (If needed)
If you need to manually rebuild on the server:
```bash
npm install
npm run build
npm start
```

## 6. Important Notes
- **Firebase**: Ensure your Firebase whitelist includes `pos.sellerscampus.com`. Go to Firebase Console -> Auth -> Settings -> Authorized domains.
- **SSL**: Hostinger provides free SSL. Ensure it is active for your subdomain.

## 7. What to do if Node.js is missing from your hPanel
If you cannot find "Node.js" anywhere in your hPanel even after searching, it means your Hostinger subscription is a traditional Shared Web Hosting plan (such as Single, Premium, or Business) that does not support persistent background server processes. You can resolve this in **two ways**:

1. **Upgrade your Hostinger plan**: Contact Hostinger support and ask to upgrade to a **Cloud Startup** plan (which includes the built-in Node.js module) or a **VPS Hosting** package.
2. **Alternative direct hosting**: You can host your frontend files completely statically. To do this, simply drag-and-drop the files generated inside your local `dist/` directory directly into Hostinger's **File Manager** inside the `public_html/` folder.
   - *Note*: If you host statically, server-side APIs (like custom simulated WhatsApp Handshakes) will not run locally on Hostinger; however, all core shop features, point of sale tools, calculations, invoice receipts, and client-side integrations will run perfectly.

Your app is now ready for production!
