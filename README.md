# AI-Style Google Review Generator (Without AI)

A modern, mobile-first web application designed for physical QR-code cards that helps customers draft genuine, natural-sounding Google reviews through an intuitive 4-step interactive flow.

Built with **React**, **Vite**, **Tailwind CSS**, and **Lucide React** icons. **100% client-side** — no backend, no database, and no paid AI APIs.

---

## ✨ Features

- **4-Step Guided Flow**:
  1. **Rating**: Interactive 5-star rating with micro-animations.
  2. **Experience**: Contextual pills tailored to the chosen star rating + optional comments.
  3. **Review**: Instant dynamic review generation with sentence structure variety, regeneration, and inline editing.
  4. **Submit**: Auto-copy to clipboard + direct link opening the business's Google Review page.
- **Natural-Sounding Review Engine**: Predefined JavaScript template engine with dynamic sentence structure, rating-specific tone matching, and variety tracking on regeneration.
- **Ethical & Neutral**: No fake reviews, no automated posting, and negative ratings have full, unrestricted access to the Google Review link.
- **Mobile-First & Touch-Friendly**: Designed for smartphone cameras and QR code scans with Apple-inspired minimal UI.
- **Single Config File**: Easily customize business details without touching app logic.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open your browser at `http://localhost:5173` (or the URL shown in your terminal).

### 3. Build for Production
```bash
npm run build
```
The optimized static build will be generated in the `dist/` directory.

---

## ⚙️ Configuration

All business-specific settings are centralized in:

📂 `src/config/business.js`

```javascript
const businessConfig = {
  // Your public business name displayed in the header and metadata
  BUSINESS_NAME: 'Your Business Name',

  // Path to your logo in /public (e.g., /logo.svg or /logo.png)
  BUSINESS_LOGO: '/logo.svg',

  // Direct link to your Google Place review submission form
  // Example: https://g.page/r/YOUR_PLACE_ID/review or https://search.google.com/local/writereview?placeid=...
  GOOGLE_REVIEW_URL: 'https://g.page/r/YOUR_PLACE_ID/review',

  // Tagline shown on the welcome screen
  BUSINESS_TAGLINE: 'Your feedback means a lot to us.',

  // Brand colors
  PRIMARY_COLOR: '#2563EB',
  SECONDARY_COLOR: '#1E40AF',
};

export default businessConfig;
```

### Finding Your Google Review URL
1. Search your business on Google or go to your **Google Business Profile**.
2. Click **"Ask for reviews"** or **"Get more reviews"**.
3. Copy the short link provided (e.g. `https://g.page/r/.../review`).
4. Paste it into `GOOGLE_REVIEW_URL` in `src/config/business.js`.

---

## 🌐 Deployment

The project produces pure static files and can be deployed directly to any static hosting provider.

### Deploy on Vercel
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `review-gen` repository.
4. Framework Preset will auto-detect as **Vite**.
5. Click **Deploy**.

### Deploy on Netlify
1. Connect your repository on [Netlify](https://www.netlify.com).
2. Set Build Command: `npm run build`
3. Set Publish directory: `dist`
4. Click **Deploy Site**.

---

## 📁 Project Structure

```text
review-gen/
├── public/
│   ├── logo.svg
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── StarRating.jsx
│   │   ├── ExperienceOptions.jsx
│   │   ├── ReviewEditor.jsx
│   │   ├── ProgressIndicator.jsx
│   │   ├── Footer.jsx
│   │   └── Toast.jsx
│   ├── pages/
│   │   ├── Welcome.jsx
│   │   ├── Experience.jsx
│   │   ├── ReviewPreview.jsx
│   │   └── ReviewConfirmation.jsx
│   ├── config/
│   │   └── business.js
│   ├── data/
│   │   ├── reviewOptions.js
│   │   └── reviewTemplates.js
│   ├── utils/
│   │   ├── generateReview.js
│   │   └── clipboard.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

---

## 📄 License
MIT
