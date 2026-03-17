# 💰 FinTrax — Track. Save. Win.

A smart, gamified personal finance management web app built with React, TypeScript, and Vite.

![FinTrax Banner](https://img.shields.io/badge/FinTrax-Track.%20Save.%20Win.-6366f1?style=for-the-badge&logo=trending-up)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss)

---

## 📖 Overview

**FinTrax** is a modern personal finance application that helps you take control of your money through smart expense tracking, visual analytics, gamified savings challenges, and AI-powered goal planning.

> **Track** your spending → **Save** more money → **Win** financial freedom.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Get an at-a-glance overview of your financial health — income, expenses, and savings summary |
| 💸 **Expense Tracking** | Log and categorize personal expenses with ease |
| 📈 **Visual Analytics** | Complete analytics dashboard with time filters, summary cards, category breakdown, spending trends, and monthly comparisons |
| 🎮 **90-Day Savings Game** | Gamified savings board challenge to help you save ₹1,00,000 in 90 days |
| 🏦 **Savings Dashboard** | Track your savings plans and milestones with progress indicators |
| 🎯 **Financial Goals** | Set, track, and plan goals with AI-powered recommendations |
| 🤝 **Splitwise** | Split expenses with friends and manage group shared costs |
| 🔐 **Authentication** | Secure sign-up / login flow |
| 📱 **Mobile Responsive** | Fully optimized for all Android and iOS devices with safe-area and touch support |
| 🖼️ **Custom Favicon** | Branded FinTrax favicon — rupee symbol with upward trend arrow in indigo-purple |

---

## 📈 Analytics Dashboard

The Analytics page is a **fully redesigned financial insights dashboard** giving you a comprehensive view of your spending behaviour.

### ⏱️ Time-Based Filters

Filter all charts and stats by selecting a time window:

| Filter | What it shows |
|---|---|
| **Today** | Spending aggregated for the current day |
| **This Week** | Last 7 days, shown as a bar chart per day |
| **This Month** | All days of the current month (area chart) |
| **This Year** | All 12 months of the current year (bar chart) |

All cards and charts update **dynamically** when you switch filters.

### 🃏 Summary Cards

Three key metrics adjust with the selected time filter:
- **Total Spending** — Sum of all expenses in the selected period
- **Current Balance** — Live wallet balance (money added minus all expenses)
- **Daily Average** — Total spending ÷ number of days in the filter window

### 🔥 Insight Cards

Two insight cards highlight your biggest spending:
- **Top Category** — The category with the highest total, with its icon, amount, and % of total
- **Biggest Spend** — The single highest expense transaction, date, and category

### 🍩 Category Breakdown (Donut Chart)

- Percentage labels rendered **inside each slice**
- Color-coded legend with **both amount and %** for every category
- Fully dark-mode compatible
- Hover tooltip shows exact value and percentage

### 📉 Spending Trend Chart

Dynamically changes type based on the selected filter:
- **Area chart** — for Today and This Month (smooth curve showing accumulation)
- **Bar chart** — for This Week and This Year (easier day/month comparisons)

### 📊 Monthly Comparison

Always-visible bar chart showing the **last 6 months** of total spending for historical reference, independent of the active filter.

### 📭 Empty States

When no expenses exist for a selected period, a clean illustrated empty state is shown instead of blank/broken charts.

### ✨ Animations

All charts use Recharts `isAnimationActive` with `ease-out` easing on entry, giving the dashboard a smooth, premium feel.

### 🧩 Reusable Components

| Component | Purpose |
|---|---|
| `ChartTooltip` | Dark-glass styled tooltip used across all charts |
| `EmptyChart` | Centered empty state with icon and message |

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **State Management**: React Context API
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ — [Install via nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** v9+ (comes with Node.js)

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
└── savelife-gamify-plan/       # Main application
    ├── public/                 # Static assets
    └── src/
        ├── components/         # Reusable UI components
        │   └── ui/             # shadcn/ui base components
        ├── context/            # React Context providers
        │   ├── FinanceContext  # Global finance state
        │   └── SplitContext    # Splitwise group state
        ├── hooks/              # Custom React hooks
        ├── lib/                # Utility functions
        ├── pages/              # Route-level page components
        │   ├── Landing.tsx     # Marketing landing page
        │   ├── Auth.tsx        # Login / Sign-up
        │   ├── Dashboard.tsx   # Main financial overview
        │   ├── Expenses.tsx    # Expense management
        │   ├── Analytics.tsx   # Spending analytics & charts
        │   ├── SavingsGame.tsx # 90-day gamified challenge
        │   ├── SavingsDashboard.tsx  # Savings tracker
        │   ├── Goals.tsx       # Financial goals planner
        │   └── Splitwise.tsx   # Group expense splitting
        └── types/              # TypeScript type definitions
```

---

## 💻 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the codebase with ESLint |

---

## 🗺️ App Routes

| Route | Page |
|---|---|
| `/` | Landing Page |
| `/auth` | Login / Sign-up |
| `/dashboard` | Main Dashboard |
| `/expenses` | Expense Tracker |
| `/analytics` | Visual Analytics |
| `/savings-game` | 90-Day Savings Game |
| `/savings` | Savings Dashboard |
| `/goals` | Financial Goals |
| `/splitwise` | Group Expense Splitter |

---

## 📱 Mobile-First Responsive Design

FinTrax is built **mobile-first** and fully optimized for both **Android and iOS** devices.

### ✅ Mobile Fixes Applied

| Area | Detail |
|---|---|
| **iOS Safari Scroll** | Fixed scroll-freeze bug caused by `overflow-x:hidden` on both `html` + `body` |
| **iOS Safe Area** | Bottom Nav and page padding respect notch & home bar via `env(safe-area-inset-bottom)` |
| **Tap Highlight** | Removed native blue flash on tap (`-webkit-tap-highlight-color: transparent`) |
| **Momentum Scroll** | Smooth iOS momentum scrolling enabled (`-webkit-overflow-scrolling: touch`) |
| **Font Zoom Fix** | Prevents font size change on orientation switch (`-webkit-text-size-adjust: 100%`) |
| **Touch Targets** | All buttons/links have `touch-action: manipulation` for instant tap response |
| **Bottom Nav** | Equal flex touch zones for all 5 tabs, labels truncate cleanly on small screens |
| **Landing Page** | Hero text scales `4xl→7xl`, CTA buttons are full-width on mobile |
| **Expenses Page** | Delete button always visible without hover (mobile-friendly) |

---

## 🖼️ Custom Favicon

A branded **FinTrax favicon** is included — featuring a **₹ rupee symbol** with an **upward trend arrow** in an indigo-purple gradient on a dark background.

- Located at: `public/favicon.png`
- Linked in `index.html` as both `rel="icon"` and `rel="apple-touch-icon"` for full Android & iOS support

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by the FinTrax Team · <strong>Track. Save. Win.</strong>
</p>
