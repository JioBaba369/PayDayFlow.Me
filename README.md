# PayDayFlow.me - Personal Finance Dashboard

Welcome to PayDayFlow.me, a modern, feature-rich personal finance application built with Next.js, Firebase, and Genkit. This application provides a comprehensive suite of tools to help you take control of your finances.

## 🚀 Getting Started

This is a Next.js project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

To run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

The Genkit AI flows can be run in development mode using:
```bash
npm run genkit:dev
```

## ✨ Features

*   **Confidence Dashboard**: Get a quick overview of your financial health, including cash left, upcoming bills, and savings progress.
*   **Budgeting**: Set and track monthly budgets for different spending categories.
*   **Bills & Subscriptions**: Manage all your recurring payments and never miss a due date.
*   **Savings Goals**: Define your financial goals and track your progress towards achieving them.
*   **Net Worth Tracker**: Monitor your assets and liabilities over time with historical snapshots and charts.
*   **Personal Runway**: A founder-style dashboard to calculate your financial runway, burn rate, and savings velocity.
*   **AI-Powered Insights**: Leverage Genkit and the Gemini AI model to get personalized financial advice based on your data.
*   **Secure Authentication**: User authentication is handled by Firebase Auth, with security rules ensuring data privacy.

## 🛠️ Tech Stack

*   **Frontend**: [Next.js](https://nextjs.org/) (with App Router) & [React](https://reactjs.org/)
*   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **AI**: [Genkit](https://firebase.google.com/docs/genkit) with Google Gemini
*   **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
*   **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation
*   **Charting**: [Recharts](https://recharts.org/)

## 🔒 Security

Data privacy is enforced using Firestore Security Rules. Each user's data is stored in a separate collection path, and rules are in place to ensure that a user can only access their own information.

## 📄 File Structure

*   `src/app/dashboard/*`: Contains the main pages of the application.
*   `src/components/*`: Reusable React components, including UI components from ShadCN.
*   `src/firebase/*`: Firebase configuration, hooks for authentication and data fetching.
*   `src/ai/*`: Genkit flows for AI-powered features.
*   `src/lib/*`: Utility functions, type definitions, and placeholder data.
*   `firestore.rules`: Defines the security rules for the Firestore database.
