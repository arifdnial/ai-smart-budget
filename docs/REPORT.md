# AI Smart Budget - Project Report

## 1. Project Overview
AI Smart Budget is a web-based financial management application designed for Malaysian university students, specifically UTHM students. It helps students manage their PTPTN/MARA allowances, track daily spending, and get AI-powered financial advice.

## 2. Problem Statement
University students often struggle with managing their limited monthly allowances. They lack proper tools to track spending, categorize expenses, and visualize their financial health. Existing tools are too complex or not tailored to the Malaysian student context (e.g., PTPTN repayment, hostel vs. rental costs).

## 3. Solution
AI Smart Budget provides a simple, interactive dashboard that:
- Tracks daily spending in real-time.
- Categorizes expenses (Makan, Rental, Transport, etc.).
- Predicts when money will run out based on spending patterns.
- Offers AI chat support for financial questions.
- Calculates PTPTN/MARA loan risks.

## 4. Features
- **Dashboard**: Real-time financial overview.
- **Allowance Setup**: Configure semester duration and amount.
- **Smart Categories**: AI-suggested budget allocation.
- **Daily Spending**: Easy expense logging.
- **Loan Repayment**: PTPTN analysis and projections.
- **MARA Risk**: CGPA monitoring for MARA scholars.
- **AI Predictions**: Forecast risky spending weeks.
- **AI Chat**: Gemini-powered financial advisor.

## 5. Technology Stack
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Build Tool**: Vite
- **AI**: Google Gemini API
- **Storage**: LocalStorage (No backend required)

## 6. How to Run
1. Clone the repository: `git clone https://github.com/arifdnial/ai-smart-budget.git`
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open `http://localhost:5173` in browser.

## 7. Future Enhancements
- Backend integration for cloud storage.
- Mobile app version (React Native/Flutter).
- Integration with bank APIs for automatic transaction import.
