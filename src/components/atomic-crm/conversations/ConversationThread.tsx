import { useEffect, useRef, useState } from "react";
import {
  useCreate,
  useGetList,
  useGetOne,
  useRecordContext,
  useRefresh,
  type Identifier,
} from "ra-core";
import type { Contact } from "../types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

interface Message {
  id: Identifier;
  conversation_id: Identifier;
  contact_id: Identifier;
  direction: "inbound" | "outbound";
  channel: string;
  body: string;
  from_number: string;
  to_number: string;
  sent_by: string;
  status: string;
  created_at: string;
}

interface Conversation {
  id: Identifier;
  contact_id: Identifier;
  channel: string;
}

const N8N_SMS_WEBHOOK = "https://kingcredit.app.n8n.cloud/webhook/crm-send-sms";

export const ConversationThread = ({
  contactId,
}: {
  contactId: Identifier;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const refresh = useRefresh();
  const contact = useRecordContext<Contact>();
  const contactPhone = contact?.phone_jsonb?.[0]?.number || "";

  // Get or create conversation for this contact
  const { data: conversations, isPending: convLoading } =
    useGetList<Conversation>("conversations", {
      filter: { contact_id: contactId },
      pagination: { page: 1, perPage: 1 },
      sort: { field: "created_at", order: "DESC" },
    });

  const conversationId = conversations?.[0]?.id;

  // Get messages for the conversation
  const { data: messages, isPending: msgsLoading } = useGetList<Message>(
    "messages",
    {
      filter: { contact_id: contactId },
      pagination: { page: 1, perPage: 100 },
      sort: { field: "created_at", order: "ASC" },
    },
    { enabled: !!contactId },
  );

  const [create] = useCreate();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId) return;

    const messageText = newMessage.trim();
    setSending(true);

    try {
      // Send real SMS via RingCentral through n8n
      if (contactPhone) {
        await fetch(N8N_SMS_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: contactPhone, message: messageText }),
        });
      }

      // Save to database
      await create(
        "messages",
        {
          data: {
            conversation_id: conversationId,
            contact_id: contactId,
            direction: "outbound",
            channel: "sms",
            body: messageText,
            from_number: "+12094974337",
            to_number: contactPhone,
            sent_by: "Louis",
            status: "delivered",
          },
        },
        {
          onSuccess: () => {
            setNewMessage("");
            refresh();
          },
        },
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (convLoading || msgsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Loading conversations...
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="mb-2">No conversation yet</p>
          <p className="text-xs">
            Messages will appear here once a conversation starts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages?.map((msg) => (
          <MessageBubble key={String(msg.id)} message={msg} />
        ))}
        {(!messages || messages.length === 0) && (
          <div className="text-center text-muted-foreground text-sm py-8">
            No messages yet
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }: { message: Message }) => {
  const isOutbound = message.direction === "outbound";
  const d = new Date(message.created_at);
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className={cn("flex", isOutbound ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5",
          isOutbound
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md",
        )}
      >
        {!isOutbound && (
          <div className="text-xs font-medium mb-0.5 opacity-70">
            {message.sent_by}
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
        <div
          className={cn(
            "text-[10px] mt-1",
            isOutbound ? "text-primary-foreground/60" : "text-muted-foreground",
          )}
        >
          {time}
          {isOutbound && (
            <span className="ml-1.5">
              {message.sent_by && message.sent_by !== "You"
                ? `· ${message.sent_by}`
                : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
