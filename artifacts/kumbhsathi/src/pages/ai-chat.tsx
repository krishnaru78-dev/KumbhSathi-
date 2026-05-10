import { useState, useEffect, useRef } from "react";
import { useSendAiMessage, useGetAiConversation, useClearAiConversation } from "@workspace/api-client-react";
import { getGetAiConversationQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Trash2, Bot, User, Languages } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const SUGGESTIONS = {
  en: ["Tell me about Ramkund Ghat", "What are the Shahi Snan dates?", "Emergency helplines Nashik", "Crowd status at Ramkund", "How to reach Trimbakeshwar?"],
  hi: ["रामकुंड घाट के बारे में बताएं", "शाही स्नान तिथियां क्या हैं?", "नाशिक आपातकालीन नंबर", "भीड़ की स्थिति", "त्र्यंबकेश्वर कैसे पहुंचें?"],
  mr: ["रामकुंड घाटाबद्दल सांगा", "शाही स्नानाच्या तारखा", "आणीबाणी क्रमांक", "गर्दीची स्थिती", "त्र्यंबकेश्वर मंदिर"],
};

export default function AIChat() {
  const [sessionId] = useState(() => localStorage.getItem("kumbh_session") || (() => {
    const id = `session_${Date.now()}`;
    localStorage.setItem("kumbh_session", id);
    return id;
  })());
  const [language, setLanguage] = useState(() => localStorage.getItem("kumbh_lang") || "hi");
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<{ role: string; content: string; id: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: history, isLoading: histLoading } = useGetAiConversation(sessionId, {
    query: { queryKey: getGetAiConversationQueryKey(sessionId) },
  });

  const sendMutation = useSendAiMessage({
    mutation: {
      onSuccess: (data) => {
        setLocalMessages((prev) => [...prev, { role: "assistant", content: data.reply, id: data.sessionId + "_" + Date.now() }]);
        qc.invalidateQueries({ queryKey: getGetAiConversationQueryKey(sessionId) });
      },
    },
  });

  const clearMutation = useClearAiConversation({
    mutation: {
      onSuccess: () => {
        setLocalMessages([]);
        qc.invalidateQueries({ queryKey: getGetAiConversationQueryKey(sessionId) });
      },
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const allMessages = [
    ...(history || []),
    ...localMessages.filter((m) => !history?.some((h) => h.content === m.content && h.role === m.role)),
  ];

  const handleSend = (text?: string) => {
    const msg = text || message;
    if (!msg.trim()) return;
    setLocalMessages((prev) => [...prev, { role: "user", content: msg, id: `u_${Date.now()}` }]);
    setMessage("");
    sendMutation.mutate({ data: { message: msg, sessionId, language, context: "kumbh_mela_2027" } });
  };

  const langs = [
    { value: "hi", label: "हिं" },
    { value: "en", label: "EN" },
    { value: "mr", label: "मरा" },
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-112px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Kumbh AI Guide</p>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {langs.map((l) => (
              <button key={l.value} onClick={() => { setLanguage(l.value); localStorage.setItem("kumbh_lang", l.value); }}
                className={cn("px-2 py-1 rounded text-xs font-medium transition-all", language === l.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                {l.label}
              </button>
            ))}
          </div>
          <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => clearMutation.mutate({ sessionId })}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {histLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-3/4 rounded-2xl" />
            <Skeleton className="h-12 w-2/3 rounded-2xl ml-auto" />
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <p className="font-semibold">Namaste! Kumbh AI Guide</p>
            <p className="text-sm text-muted-foreground mt-1">Ask me anything about Kumbh Mela 2027</p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {(SUGGESTIONS[language as keyof typeof SUGGESTIONS] || SUGGESTIONS.en).map((s, i) => (
                <button key={i} onClick={() => handleSend(s)}
                  className="px-3 py-1.5 rounded-full border border-primary/30 text-xs text-primary bg-primary/5 hover:bg-primary/10 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          allMessages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={cn(
                "max-w-[78%] rounded-2xl px-4 py-3 text-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              )}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        {sendMutation.isPending && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {allMessages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none">
          {(SUGGESTIONS[language as keyof typeof SUGGESTIONS] || SUGGESTIONS.en).slice(0, 3).map((s, i) => (
            <button key={i} onClick={() => handleSend(s)}
              className="shrink-0 px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t bg-background/80 backdrop-blur-sm">
        <Input
          placeholder={language === "hi" ? "यहाँ टाइप करें..." : "Type your question..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          className="flex-1"
        />
        <Button size="icon" onClick={() => handleSend()} disabled={!message.trim() || sendMutation.isPending}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
