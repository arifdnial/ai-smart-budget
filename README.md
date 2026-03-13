# AI Smart Budget 🇲🇾

**AI Smart Budget** is an intelligent financial management application designed specifically for Malaysian university students (focusing on UTHM students). It helps students manage their PTPTN/MARA allowances, track daily spending, categorize expenses, and get AI-powered financial advice.

## 📹 Demo Video

Watch the demo video here: [https://youtu.be/EeBcGOAi6gY](https://youtu.be/EeBcGOAi6gY)

## 📄 Project Report

View the full project report here: [AI Smart Budget Report (PDF)](docs/Report.pdf)

## ✨ Features

- **Dashboard**: Real-time overview of remaining balance, daily spending limits, and risk levels.
- **Allowance Setup**: Configure semester allowance, duration, and housing type (Hostel vs. Rental).
- **Smart Categories**: AI-suggested budget allocation (Makan, Rental, Transport, Study, Entertainment).
- **Daily Spending Tracker**: Log daily expenses with instant category updates.
- **Loan Repayment**: PTPTN loan analysis and repayment projections.
- **Early Settlement**: Explore discount campaigns for early loan repayment.
- **MARA Risk**: Monitor CGPA risks that might affect MARA allowance.
- **AI Predictions**: Forecast spending patterns and identify risky weeks (e.g., Shopee sales periods).
- **AI Chat**: Ask questions to a Gemini-powered financial advisor (requires API key).

## 🚀 How to Run

1. **Clone the Repository** (if you haven't already):
   ```bash
   git clone https://github.com/arifdnial/ai-smart-budget.git
   cd ai-smart-budget
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser to the URL shown (usually `http://localhost:5173`).

4. **Build for Production**:
   ```bash
   npm run build
   ```
   The output will be in the `dist` folder, ready to deploy.

## 🤖 Setting up AI Chat (Optional)

The AI Chat feature uses Google Gemini API.

1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey).
2. In the app, click the **Chat icon (🤖)** in the bottom right.
3. Type `/setkey YOUR_API_KEY` or click "Set API Key" and paste your key.
4. The AI will now answer your financial questions!

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tool**: Vite
- **AI**: Google Gemini API (for chat), Local Logic (for dashboard/predictions)
- **Storage**: LocalStorage (no backend required)

## 📄 License

MIT
