// ========================================
// AI Engine — Rule-based + Gemini API
// ========================================

import * as Store from './store.js';

// --- Rule-based AI Advisor ---

export function getAIAdvice(data, context = 'general') {
    const remaining = Store.getRemainingBalance(data);
    const dailyBudget = Store.getDailyBudget(data);
    const todaySpent = Store.getTodaySpent(data);
    const safeSpend = Store.getSafeDailySpend(data);
    const risk = Store.getRiskLevel(data);
    const daysLeft = Store.getDaysRemaining(data);
    const totalSpent = Store.getTotalSpent(data);
    const pctUsed = (totalSpent / data.profile.amount) * 100;

    const advice = [];

    // Daily limit check
    if (todaySpent > dailyBudget) {
        const over = todaySpent - dailyBudget;
        advice.push({
            type: 'warning',
            icon: '⚠️',
            title: 'Exceeded Daily Limit!',
            text: `You spent RM${todaySpent.toFixed(2)} today — that's RM${over.toFixed(2)} over your daily limit of RM${dailyBudget.toFixed(2)}. If this continues, you'll run out of money ${Math.floor(over / safeSpend)} days before semester ends.`
        });
    }

    // Risk level warnings
    if (risk === 'critical') {
        advice.push({
            type: 'danger',
            icon: '🔴',
            title: 'CRITICAL: Budget Almost Depleted!',
            text: `You only have RM${remaining.toFixed(2)} left with ${daysLeft} days remaining. Your safe daily spend is now only RM${safeSpend.toFixed(2)}. Consider activating Emergency Mode.`
        });
    } else if (risk === 'risky') {
        advice.push({
            type: 'warning',
            icon: '🟡',
            title: 'Budget Getting Tight',
            text: `You've used ${pctUsed.toFixed(0)}% of your semester allowance. Try to reduce spending on non-essentials. Your safe daily spend is RM${safeSpend.toFixed(2)}.`
        });
    }

    // Category overspend
    const catSpending = Store.getSpendingByCategory(data);
    for (const cat of data.categories) {
        const allocated = (cat.pct / 100) * data.profile.amount;
        const spent = catSpending[cat.id] || 0;
        if (spent > allocated * 0.9) {
            advice.push({
                type: spent > allocated ? 'warning' : 'info',
                icon: spent > allocated ? '⚠️' : '💡',
                title: `${cat.label} Budget ${spent > allocated ? 'Exceeded' : 'Almost Full'}`,
                text: `You've spent RM${spent.toFixed(2)} out of RM${allocated.toFixed(2)} allocated for ${cat.label.split(' ').slice(1).join(' ')}.${spent > allocated ? ' Reduce spending in this category!' : ''}`
            });
        }
    }

    // MARA CGPA warning
    if (data.profile.source === 'mara' && data.profile.cgpa < 2.75) {
        advice.push({
            type: data.profile.cgpa < 2.5 ? 'danger' : 'warning',
            icon: '🎓',
            title: 'MARA Allowance at Risk!',
            text: data.profile.cgpa < 2.5
                ? `Your CGPA (${data.profile.cgpa}) is below 2.50 — risk of allowance termination! Focus on studies and reduce part-time work hours.`
                : `Your CGPA (${data.profile.cgpa}) is approaching the danger zone (2.50). Make sure to prioritize academic performance.`
        });
    }

    // Positive reinforcement
    if (risk === 'safe' && advice.length === 0) {
        advice.push({
            type: 'success',
            icon: '🟢',
            title: 'You\'re Doing Great! 👏',
            text: `Budget is on track! You have RM${remaining.toFixed(2)} left for ${daysLeft} days. Keep it up and you might even save some money! 💪`
        });
    }

    return advice;
}

// --- AI Chat Response Generator ---

export function generateChatResponse(data, question) {
    const q = question.toLowerCase();
    const remaining = Store.getRemainingBalance(data);
    const dailyBudget = Store.getDailyBudget(data);
    const safeSpend = Store.getSafeDailySpend(data);
    const todaySpent = Store.getTodaySpent(data);
    const daysLeft = Store.getDaysRemaining(data);
    const totalSpent = Store.getTotalSpent(data);
    const risk = Store.getRiskLevel(data);
    const monthlyBudget = Store.getMonthlyBudget(data);

    // Daily limit questions
    if (q.includes('daily') || q.includes('spend today') || q.includes('limit')) {
        const todayLeft = Math.max(0, safeSpend - todaySpent);
        return `📊 **Daily Budget Analysis:**\n\n` +
            `• Original daily budget: **RM${dailyBudget.toFixed(2)}**\n` +
            `• Safe daily spend (adjusted): **RM${safeSpend.toFixed(2)}**\n` +
            `• Already spent today: **RM${todaySpent.toFixed(2)}**\n` +
            `• You can still spend: **RM${todayLeft.toFixed(2)}** today\n\n` +
            (todaySpent > dailyBudget
                ? `⚠️ You've exceeded your daily limit! Try to compensate tomorrow by spending less.`
                : `✅ You're within budget. ${todayLeft > 15 ? 'You could treat yourself to something small! 😊' : 'Be careful with remaining amount.'}`);
    }

    // Spending analysis
    if (q.includes('spending') || q.includes('analys') || q.includes('pattern') || q.includes('corak')) {
        const catSpend = Store.getSpendingByCategory(data);
        let catBreakdown = '';
        for (const cat of data.categories) {
            const spent = catSpend[cat.id] || 0;
            const allocated = (cat.pct / 100) * data.profile.amount;
            const pct = allocated > 0 ? ((spent / allocated) * 100).toFixed(0) : 0;
            const bar = spent > allocated ? '🔴' : spent > allocated * 0.7 ? '🟡' : '🟢';
            catBreakdown += `${bar} ${cat.label}: RM${spent.toFixed(2)} / RM${allocated.toFixed(2)} (${pct}%)\n`;
        }
        return `📊 **Spending Pattern Analysis:**\n\n` +
            `Total spent: **RM${totalSpent.toFixed(2)}** out of **RM${data.profile.amount.toFixed(2)}**\n\n` +
            `**Category Breakdown:**\n${catBreakdown}\n` +
            `**Risk Level:** ${risk === 'safe' ? '🟢 Safe' : risk === 'risky' ? '🟡 Risky' : '🔴 Critical'}\n\n` +
            `💡 *Tip: Focus on reducing spending in categories marked 🔴 or 🟡.*`;
    }

    // Saving tips
    if (q.includes('save') || q.includes('jimat') || q.includes('tip')) {
        return `💰 **Smart Saving Tips for UTHM Students:**\n\n` +
            `1. **Masak sendiri** — Home cooking saves 40-60% compared to eating out daily\n` +
            `2. **Bawa bekal** — Pack lunch from home instead of buying at cafe\n` +
            `3. **Kongsi Grab** — Share rides with classmates, split the cost\n` +
            `4. **Library over cafe** — Study at library (free WiFi & aircon) instead of cafes\n` +
            `5. **Beli bundle** — Buy groceries in bulk at Mydin/Econsave\n` +
            `6. **Avoid Shopee impuls** — Add to cart, wait 24 hours. Still want it?\n` +
            `7. **Part-time smart** — Consider weekend tutoring (RM15-25/hr)\n` +
            `8. **Student discounts** — Always ask! Many places give student price\n\n` +
            `🎯 **Your saving target:** If you save RM${(dailyBudget * 0.1).toFixed(2)}/day, you'll have an extra RM${(dailyBudget * 0.1 * daysLeft).toFixed(2)} by semester end!`;
    }

    // Money projection
    if (q.includes('run out') || q.includes('habis') || q.includes('projection') || q.includes('when')) {
        const projDate = Store.getProjectedRunOutDate(data);
        const avgDaily = Store.getRecentDailyAvg(data);
        const semEnd = new Date();
        semEnd.setDate(semEnd.getDate() + daysLeft);

        return `📅 **Money Projection:**\n\n` +
            `• Balance remaining: **RM${remaining.toFixed(2)}**\n` +
            `• Average daily spend: **RM${avgDaily.toFixed(2)}**\n` +
            `• Days remaining: **${daysLeft} days**\n` +
            `• Semester ends: **${semEnd.toLocaleDateString('ms-MY')}**\n` +
            (projDate
                ? `• At current rate, money runs out: **${projDate.toLocaleDateString('ms-MY')}**\n\n`
                : '\n') +
            (projDate && projDate < semEnd
                ? `⚠️ **Warning:** You'll run out **${Math.floor((semEnd - projDate) / (1000 * 60 * 60 * 24))} days** before semester ends!\n\n💡 Reduce daily spending to **RM${safeSpend.toFixed(2)}** to survive the full semester.`
                : `✅ At your current spending rate, you should make it to semester end. Keep it up! 🎉`);
    }

    // PTPTN questions
    if (q.includes('ptptn') || q.includes('loan') || q.includes('pinjaman') || q.includes('repay')) {
        const loan = data.profile.loanTotal;
        const y100 = Store.getRepaymentYears(loan, 100);
        const y250 = Store.getRepaymentYears(loan, 250);
        const y500 = Store.getRepaymentYears(loan, 500);
        return `🏦 **PTPTN Loan Analysis:**\n\n` +
            `Total loan: **RM${loan.toLocaleString()}**\n\n` +
            `**Repayment Scenarios:**\n` +
            `• RM100/month → **${y100.toFixed(1)} years**\n` +
            `• RM250/month → **${y250.toFixed(1)} years**\n` +
            `• RM500/month → **${y500.toFixed(1)} years**\n\n` +
            `💡 **Pro tip:** PTPTN offers discounts for early/full settlement (10-15% off). If you save RM3/day starting now, that's RM${(3 * 365).toLocaleString()}/year towards early settlement!\n\n` +
            `📌 Even small extra payments make a big difference over time.`;
    }

    // Default
    return `🤖 I can help you with:\n\n` +
        `• **"How much can I spend today?"** — Daily budget check\n` +
        `• **"Analyze my spending"** — Pattern analysis\n` +
        `• **"Tips to save money"** — Malaysian student saving tips\n` +
        `• **"When will my money run out?"** — Projection\n` +
        `• **"PTPTN repayment"** — Loan analysis\n` +
        `• **"Emergency fund"** — Emergency planning\n\n` +
        `Current status: ${risk === 'safe' ? '🟢 Budget on track' : risk === 'risky' ? '🟡 Be careful with spending' : '🔴 Critical — take action!'}\n` +
        `Balance: **RM${remaining.toFixed(2)}** remaining for **${daysLeft} days**`;
}
