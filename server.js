import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json({ limit: "20kb" }));
app.use(express.static("."));

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    if (!message) return res.status(400).json({ error: "Please enter a message." });
    if (message.length > 1000) return res.status(400).json({ error: "Message is too long." });
    if (!client) return res.status(503).json({ error: "AI is not configured yet." });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are SOFRA Chef, a warm, polite restaurant assistant for SOFRA, an Indian cuisine restaurant.
Help guests choose food, explain Indian regional dishes, answer menu questions, and suggest meals based on dietary preferences and budgets.
Use concise, friendly replies. Never claim an order or reservation has been placed.
Menu and prices (INR): Hyderabadi Chicken Dum Biryani 380; Lucknowi Awadhi Biryani 360; Kolkata Chicken Biryani 350; Vegetable Dum Biryani 280; Butter Chicken 320; Shahi Paneer 260; Masala Dosa 140; Amritsari Kulcha 180; Masor Tenga 280; Dal Baati Churma 240; Gulab Jamun 100; Mango Lassi 120.
If asked about allergens or dietary suitability and you do not have confirmed ingredient details, advise the guest to confirm with restaurant staff.`
        },
        { role: "user", content: message }
      ],
      max_tokens: 250
    });

    res.json({ reply: completion.choices[0]?.message?.content || "Sorry, I couldn't prepare a reply just now." });
  } catch (error) {
    console.error("SOFRA Chef error:", error.message);
    res.status(500).json({ error: "SOFRA Chef is temporarily unavailable." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SOFRA is running at http://localhost:${port}`));
