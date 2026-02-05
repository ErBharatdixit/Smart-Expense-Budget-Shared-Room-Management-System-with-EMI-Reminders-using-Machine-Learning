const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Reminder = require('../models/Reminder');
const axios = require('axios');

// @desc    Get AI Chat response with financial context
// @route   POST /api/chat
// @access  Private
const getChatResponse = asyncHandler(async (req, res) => {
      const { message } = req.body;

      if (!message) {
            res.status(400);
            throw new Error('Please provide a message');
      }

      // 1. Gather Financial Context for the AI
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const today = new Date();

      // Fetch Expenses, Budgets, and Reminders in parallel
      const [expenses, budgets, reminders] = await Promise.all([
            Expense.find({
                  user: req.user.id,
                  date: {
                        $gte: new Date(currentYear, currentMonth - 1, 1),
                        $lte: new Date(currentYear, currentMonth, 0)
                  }
            }),
            Budget.find({ user: req.user.id, month: currentMonth, year: currentYear }),
            Reminder.find({ user: req.user.id, isPaid: false })
      ]);

      // Aggregate Data
      const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      const totalBudget = budgets.reduce((acc, curr) => acc + curr.amount, 0);
      const categoryBreakdown = expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
      }, {});

      const upcomingEMIs = reminders
            .filter(r => new Date(r.dueDate) >= today)
            .map(r => `${r.title}: ₹${r.amount} on ${new Date(r.dueDate).toLocaleDateString()}`);

      const daysLeft = new Date(currentYear, currentMonth, 0).getDate() - today.getDate();

      // 2. Construct System Prompt
      const systemPrompt = `
You are a friendly, smart, and proactive personal finance assistant named "ExpenseML Buddy".
Your goal is to help ${req.user.name} manage their money with practical advice.

CURRENT FINANCIAL CONTEXT:
- Monthly Budget: ₹${totalBudget}
- Total Spent so far: ₹${totalSpent}
- Budget Remaining: ₹${totalBudget - totalSpent}
- Days left in month: ${daysLeft}
- Top Expense Categories: ${JSON.stringify(categoryBreakdown)}
- Upcoming EMIs/Bills: ${upcomingEMIs.length > 0 ? upcomingEMIs.join(', ') : 'None'}

GUIDELINES:
1. Speak in a friendly, "Bhai/Dost" tone. 
2. Use "Hinglish" (mixture of Hindi and English) where appropriate to feel localized and natural.
3. Be honest but encouraging. If they are overspending, tell them clearly but suggest a fix (e.g., "Food orders kam kar do").
4. Keep replies concise and actionable.
5. If someone asks generic questions, always relate it back to their real numbers provided above.

User says: "${message}"
Response:`;

      // 3. Call AI Service
      try {
            let aiResponse = "";

            if (process.env.GEMINI_API_KEY) {
                  const response = await axios.post(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                        {
                              contents: [{ parts: [{ text: systemPrompt }] }]
                        }
                  );
                  aiResponse = response.data.candidates[0].content.parts[0].text;
            } else if (process.env.OPENAI_API_KEY) {
                  const response = await axios.post(
                        'https://api.openai.com/v1/chat/completions',
                        {
                              model: "gpt-3.5-turbo",
                              messages: [
                                    { role: "system", content: "You are a helpful finance buddy." },
                                    { role: "user", content: systemPrompt }
                              ]
                        },
                        { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
                  );
                  aiResponse = response.data.choices[0].message.content;
            } else {
                  aiResponse = `Bhai, main abhi "Offline Mode" mein hoon (No API Key). \n\nLekin tumhaara data mere paas hai: \n- Abhi tak ₹${totalSpent} kharch ho chuke hain. \n- ${totalBudget > 0 ? `Budget ₹${totalBudget} hai.` : 'Abhi budget set nahi kiya tune.'} \n\nAPI key daalo toh main aur dhang se salaah de paunga! 🚀`;
            }

            res.status(200).json({ reply: aiResponse });
      } catch (error) {
            console.error("Chat AI Error:", error.response?.data || error.message);

            let userMessage = "Sorry bhai, network thoda down hai. Baad mein try karein?";

            if (error.response?.status === 429) {
                  userMessage = "Bhai, OpenAI (AI Service) ka monthly limit khatam ho gaya hai. 🛑\n\nBalance check karein ya API Key change karein!";
            } else if (error.response?.status === 401) {
                  userMessage = "Bhai, aapka API Key galat hai. .env file check kijiye! 🔑";
            } else if (error.response?.status === 404) {
                  userMessage = "Bhai, AI model nahi mil raha. Model name check karein!";
            }

            res.status(200).json({
                  reply: userMessage,
                  info: "Handled by ExpenseML Buddy"
            });
      }
});

module.exports = { getChatResponse };
