import { useState } from "react";
import { useGetList, type Identifier } from "ra-core";
import { MessageSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contact } from "../types";
import { ConversationThread } from "./ConversationThread";

interface Conversation {
  id: Identifier;
  contact_id: Identifier;
  channel: string;
  created_at?: string;
}

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

export const ConversationsPage = () => {
  const [selectedContactId, setSelectedContactId] =
    useState<Identifier | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get all conversations
  const { data: conversations, isPending: convLoading } =
    useGetList<Conversation>("conversations", {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "created_at", order: "DESC" },
    });

  // Get all contacts (to show names)
  const { data: contacts } = useGetList<Contact>("contacts", {
    pagination: { page: 1, perPage: 500 },
    sort: { field: "last_seen", order: "DESC" },
  });

  // Get latest message per conversation for previews
  const { data: allMessages } = useGetList<Message>("messages", {
    pagination: { page: 1, perPage: 500 },
    sort: { field: "created_at", order: "DESC" },
  });

  // Build a map of contact_id -> contact for name lookups
  const contactMap = new Map(contacts?.map((c) => [c.id, c]) ?? []);

  // Build a map of contact_id -> latest message
  const latestMessageMap = new Map<Identifier, Message>();
  allMessages?.forEach((msg) => {
    if (!latestMessageMap.has(msg.contact_id)) {
      latestMessageMap.set(msg.contact_id, msg);
    }
  });

  // Build conversation list with contact info
  const conversationList = (conversations ?? [])
    .map((conv) => {
      const contact = contactMap.get(conv.contact_id);
      const latestMsg = latestMessageMap.get(conv.contact_id);
      return { ...conv, contact, latestMsg };
    })
    .filter((conv) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name =
        `${conv.contact?.first_name ?? ""} ${conv.contact?.last_name ?? ""}`.toLowerCase();
      return (
        name.includes(q) || conv.latestMsg?.body?.toLowerCase().includes(q)
      );
    });

  const selectedContact = selectedContactId
    ? contactMap.get(selectedContactId)
    : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4">
      {/* Conversation List */}
      <div className="w-80 border-r flex flex-col shrink-0">
        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {convLoading && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          )}

          {!convLoading && conversationList.length === 0 && (
            <EmptyConversations />
          )}

          {conversationList.map((conv) => {
            const name = conv.contact
              ? `${conv.contact.first_name} ${conv.contact.last_name}`
              : `Contact #${conv.contact_id}`;
            const preview = conv.latestMsg?.body ?? "No messages yet";
            const time = conv.latestMsg
              ? formatRelativeTime(conv.latestMsg.created_at)
              : "";
            const isSelected = selectedContactId === conv.contact_id;
            const isInbound = conv.latestMsg?.direction === "inbound";

            return (
              <button
                key={String(conv.id)}
                onClick={() => setSelectedContactId(conv.contact_id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b transition-colors hover:bg-accent/50",
                  isSelected && "bg-accent",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {name}
                      </span>
                      <span className="text-[10px] uppercase text-muted-foreground shrink-0">
                        {conv.channel}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {isInbound ? "" : "You: "}
                      {preview}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                    {time}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thread Panel */}
      <div className="flex-1 flex flex-col">
        {selectedContactId && selectedContact ? (
          <>
            {/* Thread Header */}
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-medium">
                {selectedContact.first_name?.[0]}
                {selectedContact.last_name?.[0]}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {selectedContact.first_name} {selectedContact.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedContact.phone_jsonb?.[0]?.number ?? "No phone"}
                </p>
              </div>
            </div>

            {/* Thread */}
            <div className="flex-1 overflow-hidden">
              <ConversationThread
                contactId={selectedContactId}
                phone={selectedContact.phone_jsonb?.[0]?.number}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs mt-1">
                Choose a contact from the list to view their messages.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ConversationsPage.path = "/conversations";

const EmptyConversations = () => (
  <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-6 py-12">
    <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
    <p className="text-sm font-medium">No conversations yet</p>
    <p className="text-xs mt-1 text-center">
      Conversations appear here when you send or receive SMS messages through a
      contact's profile.
    </p>
  </div>
);

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
