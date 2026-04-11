# 💰 FinTrax — Track. Save. Win.

A smart, gamified personal finance management web app built with React, TypeScript, and Vite.

![FinTrax Banner](https://img.shields.io/badge/FinTrax-Track.%20Save.%20Win.-6366f1?style=for-the-badge&logo=trending-up)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss)

---

## 📖 Overview

**FinTrax** is a modern, comprehensive personal finance application that helps you take control of your money through smart expense tracking, visual analytics, gamified savings challenges, AI-driven goal planning, and group expense splitting mechanics.

> **Track** your spending → **Save** more money → **Win** financial freedom.

---

## ✨ Comprehensive Feature Set

### 1. 🚀 Onboarding & Dashboard
- **Marketing Landing Page:** Features striking hero sections with dynamic blurred gradients, user stats (Active Users, Money Tracked), and beautifully designed feature cards.
- **Wallet Overview:** Real-time calculation of your Wallet Balance based on total money added minus lifetime expenses.
- **Cross-Sectional Dashboard:** One central portal combining your wallet balance, monthly burn rate, quick actions, cross-group Splitwise summary, Gamified Savings progress, an interactive spending breakdown pie chart, and a mini-ledger of recent transactions.
- **Quick Money Additions:** Smart modal with quick-select denomination chips (₹500, ₹1000, etc.) for instant wallet top-ups.

### 2. 💸 Expense Management
- **Full CRUD Support:** Add, edit, and delete daily expenses.
- **Categorization:** Categorize expenses such as Food (🍔), Travel (✈️), Rent (🏠), Shopping (🛍️), Bills (📄), and Others (📦) to enable accurate tracking.
- **Derived Logic:** Logging an expense automatically deducts from your main Wallet Balance natively inside the state context.

### 3. 📉 Advanced Visual Analytics
- **Dynamic Time Filters:** Check insights filtered by 'Today', 'This Week', 'This Month', or 'This Year'.
- **Interactive Charts (Powered by Recharts):**
  - **Area/Bar Trend Charts:** Smooth accumulated area curves for daily/monthly tracking, and segmented bar charts for weekly/yearly tracking.
  - **Category Donut/Pie Chart:** Detailed inner labels highlighting category percentage vs total, hover tooltips, and interactive legends.
  - **Historical Comparison:** Always-visible last 6 months bar chart for historical performance checking.
- **Insight Cards:** Highlights top spent category and largest single transaction.

### 4. 🎯 AI-Powered Financial Goals
- **Smart Goal Setter Wizard:** Advanced 3-step interactive wizard that takes your target amount, monthly salary, and fixed/variable expenses, combined with a target deadline.
- **Dynamic Calculation engine:** Automatically computes a safe monthly and daily saving target required to meet the goal.
- **Budget Alerts:** Proactively warns you if the required monthly savings exceed your available disposable income (salary - expenses), advising you to reduce variable costs or extend the deadline.
- **Goal Tracking:** Track active vs completed goals. Add funds directly to goals in increments with animated progress bars adapting colors upon completion (`gradient-primary` to `success`).

### 5. 🎮 90-Day Savings Challenge
- **Gamification Mechanics:** A 90x tile interactive board to save ₹1,00,000 in 90 days.
- **Randomized Tiles:** Board is consistently populated with localized ₹100, ₹200, and ₹500 actionable cells.
- **Complete Decoupling:** Game progress is isolated from your actual Wallet Balance to act purely as a psychological/motivational tracking mechanic.
- **Celebration Animations:** Special end-game success screens when the goal is met.

### 6. 🏦 Savings Dashboard
- **Holistic Savings View:** Cross-references Wallet balance vs your total game progress simultaneously.
- **Monthly Savings History:** Displays the last 3 months of estimated savings mapped in bar charts.

### 7. 🤝 Splitwise (Group Expenses)
- **Shared Group Ledgers:** Create trip or flat groups and add members securely.
- **Flexible Splitting:** Log an expense and split the debt between members seamlessly.
- **Settlements:** Settle up specific debts between any two distinct members.
- **Minimum Transaction Algorithm:** Incorporates an advanced debt-simplification engine that matches creditors to debtors, heavily reducing cyclic/complex group debts into clean direct payouts.
- **Cross-Group Aggregation:** The global Split Summary calculates exactly who owes you and who you owe across *all* active or past groups entirely (Net-Balance resolution).

### 8. 🔐 Local-First & Persisted
- Extensive `localStorage` integration ensures your financial data globally persists across browser reloads ensuring zero latency data loading.

### 9. 📱 Progressive Mobile Optimizations
- **iOS SafeArea Integration:** Natively implements `env(safe-area-inset-bottom)` and top notch adjustments (`.pt-safe`, `.pb-safe`) ensuring pixel-perfect layout on latest iPhones.
- **Touch-Optimized Mechanics:** Uses `touch-action: manipulation` and strips native Webkit highlight interactions (`-webkit-tap-highlight-color: transparent`) to make web elements feel like native iOS components.
- **No-Scroll Leaks:** `page-container` classes strictly control global overflow tracking, stopping Safari's notorious lateral scroll bounce.
- **Ergonomic Bottom Nav:** A slick modular bottom-tab navigation system for small viewports.
- **Aesthetics & Animations:** Heavy implementation of glassmorphism (`.glass`), sleek tailwind variables `--shadow-glow`, and fluid micro-animations (`animate-float`, `animate-slide-up`, `animate-scale-in`).

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Engine**: [Vite](https://vitejs.dev/) utilizing `@vitejs/plugin-react-swc`
- **UI Architecture**: [shadcn/ui](https://ui.shadcn.com/) components built on top of [Radix UI](https://www.radix-ui.com/) accessible primitives.
- **Routing**: [React Router v6](https://reactrouter.com/) handling extensive client-side pathing (`BrowserRouter`).
- **Styling Pipeline**: [Tailwind CSS v3](https://tailwindcss.com/) heavily customized with robust CSS variables (`--primary`, `--card`, `--success`) and bespoke keyframes.
- **Data Visualization**: [Recharts](https://recharts.org/) for highly responsive Pie, Area, and Bar charts.
- **State Management**: Built-in Context APIs isolated by domain boundaries (`FinanceContext`, `SplitContext`).
- **Icons**: [Lucide React](https://lucide.dev/) for crisp SVGs.
- **Toasts & Feedback**: [Sonner](https://sonner.emilkowal.ski/) providing stacking notification feeds and contextual error checking.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ — [Install via nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** v9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/Fintrax.git
cd Fintrax

# 2. Navigate to the app directory
cd savelife-gamify-plan

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📂 Project Structure

```
Fintrax/
└── savelife-gamify-plan/       # Main Vite Workspace
    ├── public/                 # Static assets (Favicon, Web App Manifests)
    └── src/
        ├── components/         # Reusable UI elements
        │   ├── charts/         # Specialized Recharts sub-components
        │   └── ui/             # Radix + shadcn/ui derived components (Dialog, Input, Button)
        ├── context/            # React Context providers
        │   ├── FinanceContext  # Global wallet, expenses, goals, savings game state
        │   └── SplitContext    # Group logic, settlement engine, debt simplification
        ├── hooks/              # Custom reactive hooks
        ├── lib/                # Utility pure functions (clsx, tailwind-merge)
        ├── pages/              # Core application route definitions
        │   ├── Landing.tsx     # Hero page marketing & Features breakdown
        │   ├── Auth.tsx        # Login / Signup flows
        │   ├── Dashboard.tsx   # Aggregated quick-glance portal (Cross-system stats)
        │   ├── Expenses.tsx    # Transaction ledger
        │   ├── Analytics.tsx   # Temporal breakdown charts & category pies
        │   ├── SavingsGame.tsx # Interactive 90 tile matrix
        │   ├── SavingsDashboard.tsx  # Savings trajectory & history
        │   ├── Goals.tsx       # AI powered financial goals management
        │   └── Splitwise.tsx   # Interpersonal ledger & group logic interface
        └── types/              # Cross-boundary TypeScript definitions (Interfaces)
```

---

## 💻 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Spins up the SWC-optimized development server |
| `npm run build` | Builds the project for production deployment |
| `npm run preview` | Runs a local server to test the production build |
| `npm run lint` | Lints the entire TSX codebase via ESLint |

---

## 🗺️ Pathing Topology

| Route | Page Component | Focus |
|---|---|---|
| `/` | Landing Page | Lead-gen, marketing stats, and product intro |
| `/auth` | Login / Sign-up | Entrance barrier to secure local-storage context |
| `/dashboard` | Main Dashboard | High-level wallet pulse-check & global snapshot |
| `/expenses` | Expense Tracker | Direct CRUD operations for standard expenses |
| `/analytics` | Visual Analytics | Deep dives into where exactly funds are draining |
| `/savings-game` | 90-Day Challenge | A decoupled behavioral finance savings mechanic |
| `/savings` | Savings Dashboard | Long-term trajectory insight |
| `/goals` | Financial Goals | Dynamic smart planning based on active salary/expenses |
| `/splitwise` | Group Splitter | Debts minification and shared flat/trip planning |

---

## 🤝 Contributing

Contributions are highly encouraged to expand feature sets like multi-currency support, robust server-side synchronization (replacing localstorage), and OCR receipt scanning.

1. Fork the repository
2. Create your isolated feature branch: `git checkout -b feature/your-feature-name`
3. Commit with semantic intent: `git commit -m 'feat: added receipt scanner'`
4. Push to branch: `git push origin feature/your-feature-name`
5. Open a well-documented Pull Request

---

## 📄 License

This open-source suite is distributed under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by the FinTrax Team · <strong>Track. Save. Win.</strong>
</p>
