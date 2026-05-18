# Fino - Personal Finance Dashboard

Fino is a modern, beautifully designed personal finance application that empowers you to take control of your money. It features a stunning user interface with dark/light mode, real-time spending trends, customizable savings goals, and budget tracking.

## ✨ Features
- **Dashboard Overview:** Instantly see your Net Available Funds, Total Income, and Total Expenses.
- **Beautiful Visualizations:** Track your cash flow with dynamic Area Charts that compare income versus spending over time.
- **Smart Transactions:** Easily log income and expenses with automatic categorization. Expenses are clearly highlighted in red to ensure complete visibility into where your money goes.
- **Interactive Savings Goals:** Create custom savings goals with interactive, expandable cards that track your progress toward your target amount.
- **Budget Management:** Set monthly limits for different categories (Food, Transport, Entertainment, etc.) and see real-time progress bars indicating how close you are to your limits.
- **CSV Data Export:** Download all of your transaction history as a CSV file to open in Excel or Google Sheets.
- **Secure Backend:** Powered by Node.js and MongoDB Atlas with encrypted password hashing (bcrypt).

## 🚀 Tech Stack
- **Frontend:** React.js, Recharts (for data visualization), TailwindCSS / Vanilla CSS, Lucide Icons.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (Mongoose ODM).

## 🛠️ How to Run Locally
1. Clone the repository.
2. Navigate to the `backend` directory, run `npm install`, and start the server with `node server.js` (Requires a `.env` file with `MONGO_URI` and `PORT=5000`).
3. Open a new terminal, navigate to `frontend/my-fino`, run `npm install`, and start the React app with `npm start`.
