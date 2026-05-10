import { Router } from "express";
import { db } from "@workspace/db";
import { aiMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

function generateResponse(message: string, language: string): { reply: string; suggestions: string[] } {
  const msg = message.toLowerCase();

  if (msg.includes("temple") || msg.includes("mandir") || msg.includes("मंदिर") || msg.includes("मंदिराबद्दल")) {
    return {
      reply: language === "hi"
        ? "नाशिक कुंभ के प्रमुख मंदिर: 1) कालाराम मंदिर - पंचवटी में भगवान राम का प्रसिद्ध मंदिर 2) त्र्यंबकेश्वर - 12 ज्योतिर्लिंगों में से एक (28 किमी) 3) सप्तश्रृंगी देवी - शक्तिपीठ (65 किमी) 4) सुंदरनारायण मंदिर 5) मुक्तिधाम मंदिर। रामकुंड घाट सबसे पवित्र स्नान स्थल है।"
        : language === "mr"
        ? "नाशिक कुंभातील प्रमुख मंदिरे: 1) कालाराम मंदिर - पंचवटीत श्री रामाचे प्रसिद्ध मंदिर 2) त्र्यंबकेश्वर - १२ ज्योतिर्लिंगांपैकी एक 3) सप्तश्रृंगी देवी - शक्तिपीठ 4) सुंदरनारायण मंदिर 5) मुक्तिधाम मंदिर"
        : "Key temples at Nashik Kumbh: 1) Kalaram Mandir - famous Ram temple in Panchavati 2) Trimbakeshwar - one of 12 Jyotirlingas (28km) 3) Saptashrungi Devi - Shaktipeeth (65km) 4) Sundarnarayan Temple 5) Muktidham Temple. Ramkund Ghat is the holiest bathing spot.",
      suggestions: language === "hi"
        ? ["त्र्यंबकेश्वर कैसे जाएं?", "स्नान का समय क्या है?", "कालाराम मंदिर की जानकारी"]
        : ["How to reach Trimbakeshwar?", "Best bathing timings", "Kalaram Mandir details"],
    };
  }

  if (msg.includes("trimbak") || msg.includes("त्र्यंबक") || msg.includes("jyotirlinga") || msg.includes("ज्योतिर्लिंग")) {
    return {
      reply: language === "hi"
        ? "त्र्यंबकेश्वर ज्योतिर्लिंग नाशिक से 28 किमी दूर है। यह 12 ज्योतिर्लिंगों में से एक है और गोदावरी नदी का उद्गम स्थान है। दर्शन समय: सुबह 5:30 बजे से रात 9 बजे तक। बस: नाशिक केंद्रीय बस स्टैंड से हर 30 मिनट। टैक्सी: ₹300-500।"
        : "Trimbakeshwar Jyotirlinga is 28km from Nashik. It's one of the 12 sacred Jyotirlingas and the source of Godavari River. Darshan timings: 5:30 AM - 9:00 PM. Bus from Nashik CBS every 30 mins. Taxi: ₹300-500.",
      suggestions: ["Temple timings", "Bus routes to Trimbakeshwar", "Godavari Kund bathing"],
    };
  }

  if (msg.includes("ramkund") || msg.includes("रामकुंड") || msg.includes("ghat") || msg.includes("घाट") || msg.includes("bathing") || msg.includes("snan") || msg.includes("स्नान")) {
    return {
      reply: language === "hi"
        ? "रामकुंड नाशिक का सबसे पवित्र घाट है। कहा जाता है यहाँ स्नान से पाप धुल जाते हैं। 2027 कुंभ के प्रमुख स्नान: सिंहस्थ शाही स्नान (जुलाई-अगस्त 2027)। अन्य घाट: अहिल्याबाई घाट, गोरेराम घाट, धोबी घाट। स्नान का सर्वोत्तम समय: प्रातःकाल 4-7 बजे।"
        : "Ramkund is Nashik's holiest ghat — a sacred bathing pool on the Godavari River. Key bathing dates for Nashik Kumbh 2027 (Simhastha): Shahi Snan dates in July-August 2027. Other ghats: Ahilyabai Ghat, Goram Ghat. Best bathing time: 4-7 AM.",
      suggestions: language === "hi"
        ? ["रामकुंड कैसे पहुंचें?", "स्नान तिथियां देखें", "सुरक्षा टिप्स"]
        : ["Directions to Ramkund", "View bathing dates", "Safety tips for bathing"],
    };
  }

  if (msg.includes("sos") || msg.includes("emergency") || msg.includes("help") || msg.includes("मदद") || msg.includes("आपात")) {
    return {
      reply: language === "hi"
        ? "आपातकाल में तुरंत SOS बटन दबाएं! पुलिस: 100 | एम्बुलेंस: 108 | अग्नि शमन: 101 | नाशिक कुंभ हेल्पलाइन: 1800-233-1818 | महिला हेल्पलाइन: 1091। शांत रहें, अपनी लोकेशन शेयर करें।"
        : "In emergency, press SOS immediately! Police: 100 | Ambulance: 108 | Fire: 101 | Nashik Kumbh Helpline: 1800-233-1818 | Women: 1091. Stay calm and share your location.",
      suggestions: ["Find nearest hospital", "How to use SOS button?", "Safety tips at Kumbh"],
    };
  }

  if (msg.includes("lost") || msg.includes("missing") || msg.includes("खोया") || msg.includes("गुम") || msg.includes("हरवले")) {
    return {
      reply: language === "hi"
        ? "कोई खो गया है? 1) Lost & Found केंद्र जाएं - रामकुंड के पास 2) हेल्पलाइन: 1800-233-1818 3) ऐप में Lost & Found रिपोर्ट करें 4) बच्चे खो गए हों तो चाइल्ड हेल्पलाइन: 1098। नाशिक पुलिस: 0253-2460101"
        : "Someone lost? 1) Go to Lost & Found center near Ramkund 2) Call helpline: 1800-233-1818 3) Report in Lost & Found section of app 4) For children: Child Helpline 1098. Nashik Police: 0253-2460101",
      suggestions: ["Report a missing person", "Nearest Lost & Found center", "Child safety tips"],
    };
  }

  if (msg.includes("crowd") || msg.includes("bheed") || msg.includes("भीड़") || msg.includes("गर्दी")) {
    return {
      reply: language === "hi"
        ? "वर्तमान भीड़ की स्थिति ऐप में Crowd Monitor सेक्शन में देखें। शाही स्नान के दिन रामकुंड पर सबसे ज्यादा भीड़ होती है। सुबह 4-6 बजे और शाम 6-8 बजे अपेक्षाकृत कम भीड़ होती है।"
        : "Check real-time crowd levels in the Crowd Monitor section. Ramkund has highest density on Shahi Snan dates. 4-6 AM and 6-8 PM are less crowded. Avoid peak hours 8-11 AM.",
      suggestions: ["Open Crowd Monitor", "Best time to visit Ramkund", "Crowd alerts"],
    };
  }

  if (msg.includes("food") || msg.includes("khana") || msg.includes("खाना") || msg.includes("जेवण")) {
    return {
      reply: language === "hi"
        ? "नाशिक में भोजन: 1) अखाड़ों के लंगर (निःशुल्क) 2) पंचवटी के पास अनेक ढाबे 3) मिसल पाव, वड़ा पाव - महाराष्ट्रीय व्यंजन 4) सरकारी भोजन केंद्र। स्वच्छता का ध्यान रखें, खुले में काटा हुआ फल न खाएं।"
        : "Food at Nashik Kumbh: 1) Free langar from akharas 2) Restaurants near Panchavati 3) Local Misal Pav, Vada Pav 4) Government food centers. Drink only packaged/boiled water. Avoid cut fruit from roadside stalls.",
      suggestions: ["Food areas on map", "Free langar locations", "Safe eating tips"],
    };
  }

  if (msg.includes("hotel") || msg.includes("stay") || msg.includes("accommodation") || msg.includes("रुकना") || msg.includes("होटल")) {
    return {
      reply: language === "hi"
        ? "नाशिक में ठहरने के विकल्प: 1) पंचवटी क्षेत्र में अनेक होटल (₹800-₹5000/रात) 2) धर्मशालाएं (₹100-₹500) 3) कुंभ कैंप (सरकारी टेंट) 4) त्र्यंबकेश्वर के पास गेस्ट हाउस। जल्दी बुकिंग करें क्योंकि कुंभ के दौरान कमरे जल्दी भर जाते हैं।"
        : "Accommodation at Nashik: 1) Hotels near Panchavati (₹800-₹5000/night) 2) Dharamshalas (₹100-₹500) 3) Kumbh tent camps (government) 4) Guest houses near Trimbakeshwar. Book early as rooms fill up fast during Kumbh.",
      suggestions: ["View hotels list", "Government camp info", "Dharamshalas near Ramkund"],
    };
  }

  if (msg.includes("route") || msg.includes("navigate") || msg.includes("direction") || msg.includes("रास्ता") || msg.includes("कसे जायचे")) {
    return {
      reply: language === "hi"
        ? "नाशिक पहुंचने के तरीके: ✈️ पुणे एयरपोर्ट (200km) / मुंबई (165km) 🚂 नाशिक रोड रेलवे स्टेशन 🚌 मुंबई, पुणे, औरंगाबाद से बस। नाशिक में: बस, ऑटो, टैक्सी उपलब्ध। ऐप में Map खोलें और नेविगेशन का उपयोग करें।"
        : "Reaching Nashik: ✈️ Pune Airport (200km) / Mumbai (165km) 🚂 Nashik Road Railway Station 🚌 Buses from Mumbai, Pune, Aurangabad. Within Nashik: City buses, auto-rickshaws, taxis. Open Map in app for navigation.",
      suggestions: ["Open Map", "Bus routes in Nashik", "Railway station info"],
    };
  }

  if (msg.includes("panchavati") || msg.includes("पंचवटी")) {
    return {
      reply: language === "hi"
        ? "पंचवटी नाशिक का पवित्र क्षेत्र है जहाँ भगवान राम, सीता और लक्ष्मण ने वनवास के दौरान समय बिताया। यहाँ: कालाराम मंदिर, रामकुंड घाट, सीता गुफा और पाँच पवित्र पीपल के पेड़ हैं। गोदावरी नदी के किनारे स्थित यह क्षेत्र कुंभ का केंद्र है।"
        : "Panchavati is the sacred area in Nashik where Lord Ram, Sita and Lakshman spent time during exile. It has: Kalaram Mandir, Ramkund Ghat, Sita Cave, and five sacred Peepal trees. Located on the banks of Godavari — the center of Kumbh Mela.",
      suggestions: ["Kalaram Mandir timings", "Ramkund ghat details", "Map of Panchavati"],
    };
  }

  return {
    reply: language === "hi"
      ? "नमस्ते! मैं नाशिक कुंभ AI गाइड हूं। 2027 के सिंहस्थ कुंभ के लिए आपकी सहायता करने के लिए यहाँ हूं। मंदिरों, घाटों, आपातकालीन सेवाओं, भीड़ की स्थिति, स्नान तिथियों, होटल या यातायात के बारे में पूछें।"
      : language === "mr"
      ? "नमस्कार! मी नाशिक कुंभ AI गाइड आहे. 2027 च्या सिंहस्थ कुंभासाठी मी तुमची मदत करण्यासाठी येथे आहे. मंदिरे, घाट, आणीबाणी सेवा, गर्दीची स्थिती किंवा राहण्याच्या सुविधांबद्दल विचारा."
      : "Namaste! I am the Nashik Kumbh AI Guide. Here to help you with Simhastha Kumbh 2027. Ask me about temples, ghats, emergency services, crowd conditions, bathing dates, hotels, or transport.",
    suggestions: language === "hi"
      ? ["कालाराम मंदिर", "रामकुंड घाट", "आपातकालीन नंबर", "स्नान तिथियां", "होटल जानकारी"]
      : language === "mr"
      ? ["कालाराम मंदिर", "रामकुंड घाट", "आणीबाणी क्रमांक", "स्नान तारखा"]
      : ["Kalaram Mandir", "Ramkund Ghat", "Emergency numbers", "Bathing dates", "Hotels near Kumbh"],
  };
}

router.post("/ai/chat", async (req, res) => {
  try {
    const { message, sessionId, language = "hi", context } = req.body;
    if (!message || !sessionId) return res.status(400).json({ error: "Message and sessionId required" });

    const userMsgId = randomUUID();
    await db.insert(aiMessagesTable).values({
      id: userMsgId, sessionId, role: "user", content: message,
    });

    const { reply, suggestions } = generateResponse(message, language);

    const assistantMsgId = randomUUID();
    await db.insert(aiMessagesTable).values({
      id: assistantMsgId, sessionId, role: "assistant", content: reply,
    });

    return res.json({ reply, suggestions, sessionId, messageId: assistantMsgId });
  } catch (err) {
    req.log.error({ err }, "AI chat error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/ai/conversation/:sessionId", async (req, res) => {
  try {
    const msgs = await db.select().from(aiMessagesTable)
      .where(eq(aiMessagesTable.sessionId, req.params.sessionId));
    return res.json(msgs.map(m => ({
      id: m.id, role: m.role, content: m.content,
      createdAt: m.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "AI conversation error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/ai/conversation/:sessionId", async (req, res) => {
  try {
    await db.delete(aiMessagesTable)
      .where(eq(aiMessagesTable.sessionId, req.params.sessionId));
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Clear conversation error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
