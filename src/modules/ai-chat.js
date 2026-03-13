// AI Chat Module
import { generateChatResponse } from '../ai-engine.js';
import * as Gemini from '../gemini-service.js';

export let dataRef = null;

export function init(data) {
    dataRef = data;
    
    // Load API key from localStorage if available
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        Gemini.setApiKey(savedKey);
    }

    const panel = document.getElementById('ai-chat-panel');
    const fab = document.getElementById('ai-fab');
    const closeBtn = document.getElementById('ai-chat-close');
    const input = document.getElementById('ai-chat-input-field');
    const sendBtn = document.getElementById('ai-chat-send');
    const messages = document.getElementById('ai-chat-messages');
    const mobileTog = document.getElementById('ai-chat-toggle-mobile');

    function toggle() { panel.classList.toggle('open'); }
    fab.addEventListener('click', toggle);
    closeBtn.addEventListener('click', toggle);
    if (mobileTog) mobileTog.addEventListener('click', toggle);

    // Quick buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => { sendMessage(btn.dataset.q, data); });
    });

    // Send message
    sendBtn.addEventListener('click', () => {
        const q = input.value.trim();
        if (q) { sendMessage(q, data); input.value = ''; }
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const q = input.value.trim();
            if (q) { sendMessage(q, data); input.value = ''; }
        }
    });
}

async function sendMessage(question, data) {
    const messages = document.getElementById('ai-chat-messages');

    // User message
    const userDiv = document.createElement('div');
    userDiv.className = 'ai-message user';
    userDiv.innerHTML = `<div class="ai-message-avatar">👤</div><div class="ai-message-content"><p>${escapeHtml(question)}</p></div>`;
    messages.appendChild(userDiv);

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'ai-message bot';
    typing.innerHTML = `<div class="ai-message-avatar">🤖</div><div class="ai-message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    // Check for API key command
    if (question.toLowerCase().startsWith('/setkey ') || question.toLowerCase().startsWith('set api key')) {
        typing.remove();
        const key = question.replace(/^\/(setkey|set api key)\s*/i, '').trim();
        if (key) {
            localStorage.setItem('gemini_api_key', key);
            Gemini.setApiKey(key);
            const botDiv = document.createElement('div');
            botDiv.className = 'ai-message bot';
            botDiv.innerHTML = `<div class="ai-message-avatar">🤖</div><div class="ai-message-content"><p>✅ API key saved! You can now ask me financial questions and I'll use Gemini AI to answer.</p></div>`;
            messages.appendChild(botDiv);
            messages.scrollTop = messages.scrollHeight;
        }
        return;
    }

    // Try Gemini first, fallback to rule-based
    if (Gemini.hasApiKey()) {
        try {
            typing.remove();
            const response = await Gemini.generateResponse(question, data);
            const botDiv = document.createElement('div');
            botDiv.className = 'ai-message bot';
            botDiv.innerHTML = `<div class="ai-message-avatar">🤖</div><div class="ai-message-content">${response.error ? `<p>❌ ${response.error}</p>` : formatResponse(response.text)}</div>`;
            messages.appendChild(botDiv);
            messages.scrollTop = messages.scrollHeight;
            return;
        } catch (e) {
            console.error('Gemini error, falling back to rule-based:', e);
        }
    }

    // Fallback to rule-based AI
    setTimeout(() => {
        typing.remove();
        const response = generateChatResponse(data, question);
        const botDiv = document.createElement('div');
        botDiv.className = 'ai-message bot';
        botDiv.innerHTML = `<div class="ai-message-avatar">🤖</div><div class="ai-message-content">${formatResponse(response)}</div>`;
        messages.appendChild(botDiv);
        messages.scrollTop = messages.scrollHeight;
    }, 800 + Math.random() * 700);
}

function formatResponse(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/• /g, '&bull; ');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function updateData(newData) {
    dataRef = newData;
}
