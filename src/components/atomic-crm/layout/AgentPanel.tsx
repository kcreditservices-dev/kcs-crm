import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Mic, MicOff, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AGENT_HUB_ENDPOINT =
  import.meta.env.VITE_AGENT_HUB_ENDPOINT ?? "";

const AGENT_CONFIG = {
  Kay: {
    label: "KAY",
    role: "Executive Assistant",
    avatar: "/avatars/kay.png",
  },
  Eric: {
    label: "Eric",
    role: "KCS Agent",
    avatar: "/avatars/eric.png",
  },
  Sue: {
    label: "Sue",
    role: "Legal",
    avatar: "/avatars/sue.png",
  },
  Sam: {
    label: "Sam",
    role: "Social Media",
    avatar: "/avatars/sam.png",
  },
  Des: {
    label: "Des",
    role: "Dispute Engine",
    avatar: "/avatars/des.png",
  },
} as const;

type AgentName = keyof typeof AGENT_CONFIG;

interface AgentMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  agent: AgentName;
  timestamp: Date;
}

interface AgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeAgent: AgentName;
  onChangeAgent: (agent: AgentName) => void;
}

export const AgentPanel = ({
  isOpen,
  onClose,
  activeAgent,
  onChangeAgent,
}: AgentPanelProps) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen, activeAgent]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMsg: AgentMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      agent: activeAgent,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setSending(true);

    try {
      const response = await fetch(AGENT_HUB_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          agent: activeAgent.toLowerCase(),
          source: "crm-dashboard",
        }),
      });

      const data = await response.json();
      const agentReply =
        data?.output ?? data?.message ?? data?.reply ?? "No response received.";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          content: agentReply,
          agent: activeAgent,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          content: "Failed to reach the agent. Check VPS or n8n.",
          agent: activeAgent,
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

  const agentMessages = messages.filter((m) => m.agent === activeAgent);
  const config = AGENT_CONFIG[activeAgent];

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-svh w-[380px] border-l bg-background z-30 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="relative">
          <button
            onClick={() => setShowAgentPicker(!showAgentPicker)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src={config.avatar}
              alt={config.label}
              className="w-7 h-7 rounded-full object-cover"
            />
            <div className="text-left">
              <span className="font-semibold text-sm block leading-tight">
                {config.label}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {config.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {showAgentPicker && (
            <div className="absolute top-full left-0 mt-1 bg-popover border rounded-lg shadow-lg py-1 z-50 w-56">
              {(Object.keys(AGENT_CONFIG) as AgentName[]).map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    onChangeAgent(name);
                    setShowAgentPicker(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left",
                    name === activeAgent && "bg-accent",
                  )}
                >
                  <img
                    src={AGENT_CONFIG[name].avatar}
                    alt={name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div>
                    <span className="block font-medium leading-tight">
                      {AGENT_CONFIG[name].label}
                    </span>
                    <span className="block text-[10px] text-muted-foreground leading-tight">
                      {AGENT_CONFIG[name].role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {agentMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center px-6">
            <img
              src={config.avatar}
              alt={activeAgent}
              className="w-20 h-20 rounded-full object-cover mb-4 opacity-80"
            />
            <p className="text-sm font-medium text-foreground">
              Talk to {activeAgent}
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              {config.role}
            </p>
            <p className="text-xs mt-3 max-w-[240px]">
              Send a command or ask a question. Messages route directly to{" "}
              {activeAgent}'s brain.
            </p>
          </div>
        )}

        {agentMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md",
              )}
            >
              {msg.role === "agent" && (
                <div className="flex items-center gap-1.5 mb-1">
                  <img
                    src={config.avatar}
                    alt={msg.agent}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium opacity-70">
                    {msg.agent}
                  </span>
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
                <img
                  src={config.avatar}
                  alt={activeAgent}
                  className="w-4 h-4 rounded-full object-cover animate-pulse"
                />
                <span className="text-xs text-muted-foreground">
                  {activeAgent} is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <Button
            variant={isListening ? "destructive" : "ghost"}
            size="icon"
            onClick={toggleVoice}
            className="shrink-0 h-9 w-9"
            title={isListening ? "Stop listening" : "Voice input"}
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
            placeholder={
              isListening
                ? "Listening..."
                : `Message ${activeAgent}...`
            }
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
