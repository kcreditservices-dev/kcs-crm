import { FileBarChart, ExternalLink } from "lucide-react";

const REPORTS = [
  {
    title: "Client Update (CU)",
    description:
      "Round-to-round comparison showing what changed between dispute rounds. Used in the client portal.",
    endpoint: "VPS /cu-data",
  },
  {
    title: "Before & After (B&A)",
    description:
      "First vs last credit report comparison. Used for refund analysis and attorney referrals.",
    endpoint: "VPS /ba-data",
  },
  {
    title: "Dispute Letters",
    description:
      "R1, R2, MOV, CFPB, RTP, ITS letters generated per client. All rendered as PDF via Des.",
    endpoint: "VPS /letter",
  },
  {
    title: "Intent to Sue (ITS)",
    description:
      "Full ITS pipeline: CR analysis, DOCX letter, draft federal complaint, PDF upload to Drive.",
    endpoint: "VPS /sue-its",
  },
  {
    title: "Attorney Packet",
    description:
      "Complete packet for attorney referral. Adams (main), Gorr (CA), Harvey (FDCPA).",
    endpoint: "n8n workflow",
  },
  {
    title: "Payment History",
    description:
      "Transaction history from Noomerik and Commas. Available in the Payments tab.",
    endpoint: "Supabase kcs_payments",
  },
];

export const ReportsPage = () => {
  return (
    <div className="space-y-6 mt-1">
      <div>
        <h1 className="text-2xl font-bold glow-text">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Generated reports and analysis tools available across the system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORTS.map((report) => (
          <div key={report.title} className="glow-card glow-border p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <FileBarChart className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{report.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {report.description}
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Source: {report.endpoint}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ReportsPage.path = "/reports";
