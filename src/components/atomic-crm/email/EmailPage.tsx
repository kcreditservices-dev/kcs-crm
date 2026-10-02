import { useCallback, useMemo, useState } from "react";
import { useGetList } from "ra-core";
import { Eye, Mail, PenLine, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Contact } from "../types";

const GMAIL_WEBHOOK =
  import.meta.env.VITE_EMAIL_WEBHOOK ??
  "https://kingcredit.app.n8n.cloud/webhook/kcs-gmail-v2";

type Tab = "compose" | "preview";

export const EmailPage = () => {
  const [to, setTo] = useState("");
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [tab, setTab] = useState<Tab>("compose");
  const [contactSearch, setContactSearch] = useState("");
  const [showContacts, setShowContacts] = useState(false);

  const { data: contacts } = useGetList<Contact>("contacts", {
    pagination: { page: 1, perPage: 200 },
    sort: { field: "last_seen", order: "DESC" },
  });

  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return contacts?.slice(0, 10) ?? [];
    const q = contactSearch.toLowerCase();
    return (
      contacts?.filter((c) => {
        const name = `${c.first_name} ${c.last_name}`.toLowerCase();
        const email = c.email_jsonb?.[0]?.email?.toLowerCase() ?? "";
        return name.includes(q) || email.includes(q);
      }) ?? []
    ).slice(0, 10);
  }, [contacts, contactSearch]);

  const selectContact = (contact: Contact) => {
    const email = contact.email_jsonb?.[0]?.email ?? "";
    setTo(email);
    setToName(`${contact.first_name} ${contact.last_name}`);
    setContactSearch("");
    setShowContacts(false);
  };

  const htmlEmail = useMemo(
    () => buildV5Email(toName || "Client", subject, body),
    [toName, subject, body],
  );

  const sendEmail = useCallback(async () => {
    if (!to || !subject || !body.trim()) return;
    setSending(true);
    try {
      await fetch(GMAIL_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          mailbox: "support",
          to,
          subject,
          message: htmlEmail,
          html: true,
        }),
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setTo("");
        setToName("");
        setSubject("");
        setBody("");
        setTab("compose");
      }, 3000);
    } catch {
      // fail silently
    } finally {
      setSending(false);
    }
  }, [to, subject, body, htmlEmail]);

  return (
    <div className="space-y-6 mt-1">
      <div>
        <h1 className="text-2xl font-bold glow-text">Email</h1>
        <p className="text-sm text-muted-foreground">
          Compose and preview emails sent from support@kingcreditservices.com
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setTab("compose")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            tab === "compose"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <PenLine className="w-3.5 h-3.5" />
          Compose
        </button>
        <button
          onClick={() => setTab("preview")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            tab === "preview"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
      </div>

      {tab === "compose" && (
        <div className="glow-card glow-border p-6 space-y-4 max-w-2xl">
          {/* To */}
          <div className="relative">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              To
            </label>
            {to ? (
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                <span className="text-sm">
                  {toName} &lt;{to}&gt;
                </span>
                <button
                  onClick={() => {
                    setTo("");
                    setToName("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground ml-auto"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => {
                    setContactSearch(e.target.value);
                    setShowContacts(true);
                  }}
                  onFocus={() => setShowContacts(true)}
                  placeholder="Search contacts by name or email..."
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {showContacts && filteredContacts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg py-1 z-50 max-h-48 overflow-y-auto">
                    {filteredContacts.map((c) => {
                      const email = c.email_jsonb?.[0]?.email;
                      if (!email) return null;
                      return (
                        <button
                          key={String(c.id)}
                          onClick={() => selectContact(c)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                        >
                          <span className="font-medium">
                            {c.first_name} {c.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {email}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email content here. Use blank lines for paragraphs."
              rows={10}
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => setTab("preview")}
              variant="secondary"
              disabled={!body.trim()}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={sendEmail}
              disabled={!to || !subject || !body.trim() || sending}
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? "Sending..." : sent ? "Sent!" : "Send Email"}
            </Button>
            <span className="text-xs text-muted-foreground ml-auto">
              From: support@kingcreditservices.com
            </span>
          </div>
        </div>
      )}

      {tab === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Preview: exactly how the recipient will see this email
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTab("compose")}
              >
                <PenLine className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                onClick={sendEmail}
                disabled={!to || !subject || !body.trim() || sending}
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                {sending ? "Sending..." : sent ? "Sent!" : "Send"}
              </Button>
            </div>
          </div>

          {/* Email Preview */}
          <div className="border rounded-lg overflow-hidden bg-[#f2f0ec]">
            <div
              className="max-w-[640px] mx-auto"
              dangerouslySetInnerHTML={{ __html: htmlEmail }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

EmailPage.path = "/email";

/** Build V5 editorial email template HTML */
function buildV5Email(
  firstName: string,
  subject: string,
  bodyText: string,
): string {
  const paragraphs = bodyText
    .split(/\n\n+/)
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;color:#1a1a1a;line-height:1.7">${p.replace(/\n/g, "<br>")}</p>`,
    )
    .join("");

  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f0ec;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

<!-- Header -->
<tr><td style="background:#1a1a1a;padding:40px 40px 30px;text-align:center;border-left:6px solid #c9a84c">
  <p style="margin:0 0 8px;font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;font-weight:700;color:#ffffff;letter-spacing:2px">KING CREDIT</p>
  <p style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;font-weight:700;color:#c9a84c;letter-spacing:2px">SERVICES</p>
  <p style="margin:16px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#ffffff;text-transform:uppercase;letter-spacing:3px">${escapeHtml(subject)}</p>
</td></tr>

<!-- Body -->
<tr><td style="background:#ffffff;padding:40px;border-left:6px solid #c9a84c">
  <p style="margin:0 0 24px;font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;font-weight:700;color:#c9a84c;letter-spacing:4px;text-transform:uppercase">Hey ${escapeHtml(firstName.split(" ")[0])},</p>
  ${paragraphs || '<p style="margin:0;font-family:Georgia,serif;font-size:16px;color:#999">Start typing your email...</p>'}
</td></tr>

<!-- Footer -->
<tr><td style="background:#1a1a1a;padding:30px 40px;text-align:center;border-left:6px solid #c9a84c">
  <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:15px;color:#ffffff;font-style:italic">We Don't Just Fix Credit. We Build Futures.</p>
  <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:16px;color:#c9a84c;font-weight:700;letter-spacing:3px">DISPUTE. SUE. BUILD LEVERAGE.</p>
  <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:13px;color:#888">King Credit Services, Inc. All Rights Reserved 2026</p>
  <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#ffffff">844.689.0199</p>
</td></tr>

</table>
</td></tr>
</table>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
