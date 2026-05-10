import { Router } from "express";
import { db } from "@workspace/db";
import { aiMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

const kumbhKnowledge: Record<string, string[]> = {
  temple: ["Sangam Ghat", "Triveni Sangam", "Hanuman Mandir", "Bade Hanuman Temple", "Alopi Devi Mandir"],
  bathing: ["Makar Sankranti", "Mauni Amavasya", "Basant Panchami", "Maghi Purnima", "Maha Shivaratri"],
  emergency: ["Police: 100", "Ambulance: 108", "Fire: 101", "Kumbh Helpline: 1800-180-5000"],
  safety: ["Stay with your group", "Carry ID at all times", "Note your camp location", "Keep emergency numbers saved", "Wear bright clothing"],
};

function generateResponse(message: string, language: string): { reply: string; suggestions: string[] } {
  const msg = message.toLowerCase();

  if (msg.includes("temple") || msg.includes("mandir") || msg.includes("मंदिर")) {
    return {
      reply: language === "hi"
        ? "कुंभ मेला में प्रमुख मंदिर हैं: त्रिवेणी संगम, हनुमान मंदिर, अलोपी देवी मंदिर। संगम पर पवित्र स्नान करना सबसे महत्वपूर्ण है।"
        : "Key temples at Kumbh: Triveni Sangam, Hanuman Mandir, Alopi Devi Mandir. The holy dip at Sangam is considered most sacred.",
      suggestions: ["Tell me more about Sangam Ghat", "What are the bathing dates?", "How to reach the temples?"],
    };
  }
  if (msg.includes("sos") || msg.includes("emergency") || msg.includes("help") || msg.includes("मदद")) {
    return {
      reply: language === "hi"
        ? "आपातकाल में तुरंत SOS बटन दबाएं! पुलिस: 100, एम्बुलेंस: 108, अग्नि शमन: 101, कुंभ हेल्पलाइन: 1800-180-5000। शांत रहें और अपनी लोकेशन शेयर करें।"
        : "In emergency, press SOS immediately! Police: 100, Ambulance: 108, Fire: 101, Kumbh Helpline: 1800-180-5000. Stay calm and share your location.",
      suggestions: ["Find nearest hospital", "How to use SOS button?", "Safety tips at Kumbh"],
    };
  }
  if (msg.includes("lost") || msg.includes("missing") || msg.includes("खोया") || msg.includes("गुम")) {
    return {
      reply: language === "hi"
        ? "यदि कोई खो गया है: 1) Lost & Found केंद्र पर जाएं 2) हेल्पलाइन 1800-180-5000 पर कॉल करें 3) ऐप में Lost & Found रिपोर्ट करें। बच्चों के लिए चाइल्ड हेल्पलाइन: 1098"
        : "If someone is lost: 1) Go to Lost & Found center 2) Call helpline 1800-180-5000 3) Report in Lost & Found section. For children: Child Helpline 1098",
      suggestions: ["Report a missing person", "Find nearest lost & found center", "Child safety tips"],
    };
  }
  if (msg.includes("crowd") || msg.includes("bheed") || msg.includes("भीड़")) {
    return {
      reply: language === "hi"
        ? "वर्तमान में मध्यम भीड़ है। मुख्य स्नान तिथियों पर भीड़ अधिक होती है। शाही स्नान से 2 घंटे पहले और बाद में भीड़ से बचें।"
        : "Currently moderate crowd levels. Crowd is highest on Shahi Snan dates. Avoid 2 hours before and after major bathing events.",
      suggestions: ["Check crowd zone map", "Best time to visit Sangam", "Crowd alert notifications"],
    };
  }
  if (msg.includes("food") || msg.includes("khana") || msg.includes("खाना")) {
    return {
      reply: language === "hi"
        ? "कुंभ मेला में भोजन के लिए: विभिन्न अखाड़ों के लंगर, सरकारी भोजन केंद्र और अनेक दुकानें उपलब्ध हैं। बाहरी खाना खाते समय सफाई का ध्यान रखें।"
        : "For food at Kumbh: Akharas' free langar, government food centers, and various stalls are available. Be careful about hygiene when eating outside.",
      suggestions: ["Find food areas near me", "Healthy eating tips at Kumbh", "Free langar locations"],
    };
  }
  if (msg.includes("route") || msg.includes("navigate") || msg.includes("direction") || msg.includes("रास्ता")) {
    return {
      reply: language === "hi"
        ? "नेविगेशन के लिए मैप सेक्शन का उपयोग करें। प्रमुख घाटों के लिए: संगम घाट सबसे महत्वपूर्ण है। मेट्रो और बस सेवाएं उपलब्ध हैं।"
        : "Use the Map section for navigation. Key ghats: Sangam Ghat is most important. Metro and bus services are available throughout.",
      suggestions: ["Open Map", "Bus routes to Sangam", "Walking route to nearest ghat"],
    };
  }
  if (msg.includes("bathing") || msg.includes("snan") || msg.includes("स्नान")) {
    return {
      reply: language === "hi"
        ? "2027 कुंभ मेला के प्रमुख स्नान तिथियां: मकर संक्रांति, मौनी अमावस्या (सबसे महत्वपूर्ण), बसंत पंचमी, माघी पूर्णिमा और महाशिवरात्रि।"
        : "Key bathing dates for Kumbh 2027: Makar Sankranti, Mauni Amavasya (most important), Basant Panchami, Maghi Purnima, and Maha Shivaratri.",
      suggestions: ["View full bathing schedule", "Safety tips for bathing", "Best bathing spots"],
    };
  }

  return {
    reply: language === "hi"
      ? `नमस्ते! मैं कुंभ एआई गाइड हूं। मैं आपकी सहायता करने के लिए यहां हूं। आप मुझसे मंदिरों, घाटों, आपातकालीन सेवाओं, भीड़ की स्थिति, या स्नान तिथियों के बारे में पूछ सकते हैं।`
      : `Namaste! I am Kumbh AI Guide. I'm here to help you navigate Kumbh Mela 2027 safely. You can ask me about temples, ghats, emergency services, crowd conditions, or bathing dates.`,
    suggestions: language === "hi"
      ? ["मंदिरों की जानकारी", "आपातकालीन नंबर", "स्नान तिथियां", "भीड़ की स्थिति"]
      : ["Temple information", "Emergency numbers", "Bathing dates", "Crowd conditions"],
  };
}

router.post("/ai/chat", async (req, res) => {
  try {
    const { message, sessionId, language = "hi", context } = req.body;
    if (!message || !sessionId) return res.status(400).json({ error: "Message and sessionId required" });

    const userMsgId = randomUUID();
    await db.insert(aiMessagesTable).values({
      id: userMsgId,
      sessionId,
      role: "user",
      content: message,
    });

    const { reply, suggestions } = generateResponse(message, language);

    const aiMsgId = randomUUID();
    await db.insert(aiMessagesTable).values({
      id: aiMsgId,
      sessionId,
      role: "assistant",
      content: reply,
    });

    return res.json({ reply, sessionId, suggestions, relatedType: null });
  } catch (err) {
    req.log.error({ err }, "AI chat error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/ai/conversations/:sessionId", async (req, res) => {
  try {
    const messages = await db.select().from(aiMessagesTable)
      .where(eq(aiMessagesTable.sessionId, req.params.sessionId));
    return res.json(messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Get conversation error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/ai/conversations/:sessionId", async (req, res) => {
  try {
    await db.delete(aiMessagesTable).where(eq(aiMessagesTable.sessionId, req.params.sessionId));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Clear conversation error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
