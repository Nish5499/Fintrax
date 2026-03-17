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
| 📈 **Visual Analytics** | Beautiful charts exposing your spending patterns by category and time period |
| 🎮 **90-Day Savings Game** | Gamified savings board challenge to help you save ₹1,00,000 in 90 days |
| 🏦 **Savings Dashboard** | Track your savings plans and milestones with progress indicators |
| 🎯 **Financial Goals** | Set, track, and plan goals with AI-powered recommendations |
| 🤝 **Splitwise** | Split expenses with friends and manage group shared costs |
| 🔐 **Authentication** | Secure sign-up / login flow |

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
