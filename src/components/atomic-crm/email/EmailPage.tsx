import { Mail, Send } from "lucide-react";

export const EmailPage = () => {
  return (
    <div className="space-y-6 mt-1">
      <div>
        <h1 className="text-2xl font-bold glow-text">Email</h1>
        <p className="text-sm text-muted-foreground">
          Outbound email campaigns, templates, and delivery tracking.
        </p>
      </div>

      <div className="glow-card glow-border p-6 text-center">
        <Mail className="w-12 h-12 mx-auto mb-3 opacity-15" />
        <p className="text-sm font-medium">Email hub coming soon</p>
        <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
          Send emails from support@kingcreditservices.com, manage templates
          (V5 locked), track re-engagement campaigns, and view delivery
          status. All outbound email will route through n8n via the KCS
          Gmail Proxy.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <div className="text-center">
            <Send className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">
              Campaigns
            </p>
          </div>
          <div className="text-center">
            <Mail className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">
              Templates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

EmailPage.path = "/email";
