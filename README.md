# Tour Itinerary Builder & Operations Platform

A modern web application for travel agencies, tour operators, and destination management companies (DMCs) featuring:
- **Interactive Day-by-Day Itinerary Builder**: Visual timeline canvas with hotels, activities, transfers, meals, and guides.
- **Dynamic Costing & Pricing Engine**: Multi-currency markup rules, tax calculation, margin tracking, and pax tiers.
- **Master Catalog Management**: Reusable database for destinations, hotels, room rates, excursions, transport, meals, and policies.
- **Document & PDF Generator**: Export branded client proposals with day-by-day maps, voucher summaries, and payment policies.
- **Workflow Approvals & Audit Trail**: Multi-role governance (Agent, Manager, Finance, Admin).

---

## 🚀 How to Export to GitHub

You can push this repository to your GitHub account using either of the methods below:

### Method 1: Export Directly from Google AI Studio (Recommended)
1. In Google AI Studio, click the **Settings / Menu** in the top right.
2. Select **Export to GitHub** (or **Download ZIP**).
3. Connect your GitHub account and select or create the target repository.

### Method 2: Push via Git CLI
If you downloaded the project ZIP:
```bash
# Unzip and navigate to the project directory
cd tour-itinerary-builder

# Initialize Git repository
git init
git add .
git commit -m "Initial commit of Tour Itinerary Builder"

# Link to your GitHub repository and push
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPOSITORY-NAME>.git
git push -u origin main
```

---

## 🌐 Hosting & Deployment Guide (Fixing GitHub Publish Errors)

If your GitHub publish failed, here is how to resolve it and get your site live in 2 minutes:

---

### Solution 1: Automated GitHub Actions (Recommended)

To allow GitHub Actions to deploy your website automatically:

1. Push your code to your GitHub repository.
2. On GitHub, open your repository and click on **Settings** (top tabs).
3. In the left sidebar, click on **Pages**.
4. Under **Build and deployment** > **Source**, change the dropdown from `"Deploy from a branch"` to **`GitHub Actions`**.
5. *(Optional)* Go to **Settings** > **Actions** > **General** > scroll down to **Workflow permissions** > choose **"Read and write permissions"** and click **Save**.
6. Go to the **Actions** tab on your repository > click **Deploy to GitHub Pages** > click **Run workflow**.
7. Once finished, your live app will be accessible at:
   `https://<YOUR-GITHUB-USERNAME>.github.io/<YOUR-REPOSITORY-NAME>/`

---

### Solution 2: Manual 1-Command Deploy via `gh-pages`

If you prefer to deploy directly from your local terminal without GitHub Actions:

```bash
# 1. Run the deploy command
npm run deploy
```
This automatically builds the project (`npm run build`) and publishes the `dist` folder directly to the `gh-pages` branch.
Then in **Settings** > **Pages**, make sure the Source is set to **Deploy from a branch** with branch **`gh-pages`** and folder **`/(root)`**.

---

### Solution 3: Instant 1-Click Deployment (Vercel / Netlify)

If GitHub Pages is giving you permission errors, you can deploy in 30 seconds for free on Vercel or Netlify:

- **Vercel**:
  1. Visit [vercel.com/new](https://vercel.com/new).
  2. Sign in with GitHub and click **Import** next to this repository.
  3. Leave all default settings (Vite is detected automatically) and click **Deploy**.
- **Netlify**:
  1. Visit [app.netlify.com](https://app.netlify.com).
  2. Click **Add new site** > **Import an existing project** > **GitHub**.
  3. Select your repository and click **Deploy Site**.

---

## 💻 Local Development

To run the project on your local machine:

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build locally
npm run preview
```

---

## 🛠️ Tech Stack
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Motion
- **Build Tool**: Vite
