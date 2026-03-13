// Gemini AI Service Module
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;

const SYSTEM_PROMPT = `You are an AI Financial Advisor for Malaysian university students (specifically UTHM students). 
Your role is to help students manage their finances, including PTPTN loans, MARA allowances, and daily budgeting.

Guidelines:
- Always respond in a friendly, encouraging tone
- Use Malaysian context (RM currency, local tips)
- Provide practical advice for student life
- Keep responses concise but helpful
- Use bullet points when listing tips
- Always consider the user's specific financial situation when answering

Current user profile context will be provided with each question.`;

export function setApiKey(apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

export function hasApiKey() {
    return model !== null;
}

export async function generateResponse(question, userData) {
    if (!model) {
        return { error: 'API key not configured. Please set your Gemini API key.' };
    }

    const context = buildContext(userData);
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${context}\n\nUser Question: ${question}`;

    try {
        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        return { text: response.text() };
    } catch (error) {
        return { error: error.message };
    }
}

function buildContext(data) {
    const remaining = (data.profile?.amount || 0) - (data.spending?.reduce((a, b) => a + b.amount, 0) || 0);
    const daysLeft = data.profile?.daysRemaining || 0;
    const riskLevel = getRiskLevel(data);

    return `
User's Current Financial Context:
- Total Allowance: RM${data.profile?.amount || 0}
- Remaining Balance: RM${remaining.toFixed(2)}
- Days Remaining: ${daysLeft}
- Risk Level: ${riskLevel}
- Allowance Source: ${data.profile?.source || 'N/A'}
${data.profile?.cgpa ? `- CGPA: ${data.profile.cgpa}` : ''}
${data.profile?.loanTotal ? `- Total PTPTN Loan: RM${data.profile.loanTotal}` : ''}
    `.trim();
}

function getRiskLevel(data) {
    const total = data.profile?.amount || 0;
    const spent = data.spending?.reduce((a, b) => a + b.amount, 0) || 0;
    const pct = total > 0 ? (spent / total) * 100 : 0;

    if (pct >= 90) return 'CRITICAL';
    if (pct >= 70) return 'RISKY';
    return 'SAFE';
}
