import { useCallback, useEffect, useRef, useState } from "react";
import { useGetIdentity } from "ra-core";
import { Bot, Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const KCB_ENDPOINT = import.meta.env.VITE_AGENT_HUB_ENDPOINT ?? "";

interface KcbMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const KcbPage = () => {
  const { identity } = useGetIdentity();
  const firstName = identity?.first_name ?? identity?.fullName ?? "Team";

  const [messages, setMessages] = useState<KcbMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].text)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMsg: KcbMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch(KCB_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          agent: "kcb",
          source: "crm-kcb",
          user: firstName,
        }),
      });

      const data = await response.json();
      const reply =
        data?.output ?? data?.message ?? data?.reply ?? "No response.";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Could not reach KCB. Check the n8n webhook.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">KCB</h1>
            <p className="text-xs text-muted-foreground">
              King Credit Brain. Ask about clients, disputes, processes, or
              anything KCS.
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
            <Bot className="w-16 h-16 mb-4 opacity-15" />
            <p className="text-base font-medium text-foreground">
              Hey {firstName}, what do you need?
            </p>
            <p className="text-sm mt-2 max-w-md">
              Ask KCB about a client's dispute status, how to write a letter,
              what round someone is on, or anything about the KCS process.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="px-3 py-1.5 text-xs border rounded-full hover:bg-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[70%] rounded-2xl px-4 py-2.5",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md",
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Bot className="w-3.5 h-3.5 opacity-60" />
                  <span className="text-xs font-medium opacity-70">KCB</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap break-words">
                {msg.content}
              </p>
              <div
                className={cn(
                  "text-[10px] mt-1",
                  msg.role === "user"
                    ? "text-primary-foreground/60"
                    : "text-muted-foreground",
                )}
              >
                {msg.timestamp.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 animate-pulse opacity-60" />
                <span className="text-xs text-muted-foreground">
                  KCB is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t px-6 py-3">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Button
            variant={isListening ? "destructive" : "ghost"}
            size="icon"
            onClick={toggleVoice}
            className="shrink-0 h-9 w-9"
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Ask KCB anything..."}
            rows={1}
            className={cn(
              "flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20",
              isListening && "border-destructive/50 ring-1 ring-destructive/20",
            )}
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

KcbPage.path = "/kcb";

const SUGGESTIONS = [
  "What round is John Doe on?",
  "How do I write a MOV letter?",
  "What's the dispute priority order?",
  "Explain charge-off balance violations",
];
