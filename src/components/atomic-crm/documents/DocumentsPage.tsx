import { ExternalLink, FolderOpen, FileText, Upload } from "lucide-react";

const DRIVE_LINKS = [
  {
    label: "Client Folders",
    description: "Credit reports, letters, agreements by client name",
    url: "https://drive.google.com/drive/folders/",
    icon: FolderOpen,
  },
  {
    label: "Letter Templates",
    description: "R1, R2, MOV, CFPB, RTP, ITS letter templates",
    url: "https://drive.google.com/drive/folders/",
    icon: FileText,
  },
  {
    label: "Onboarding Documents",
    description: "Chargeback waivers, AOC agreements, intake forms",
    url: "https://drive.google.com/drive/folders/",
    icon: Upload,
  },
];

export const DocumentsPage = () => {
  return (
    <div className="space-y-6 mt-1">
      <div>
        <h1 className="text-2xl font-bold glow-text">Documents</h1>
        <p className="text-sm text-muted-foreground">
          Client files, templates, and agreements stored in Google Drive.
        </p>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DRIVE_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-card glow-border p-5 flex items-start gap-4 hover:bg-accent/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{link.label}</p>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {link.description}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {/* Info */}
      <div className="glow-card glow-border p-6 text-center">
        <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-15" />
        <p className="text-sm font-medium">
          Documents are managed in Google Drive
        </p>
        <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
          Each client has a dedicated folder with credit reports, dispute
          letters, and legal documents. Des auto-uploads generated letters
          directly to the client's folder.
        </p>
      </div>
    </div>
  );
};

DocumentsPage.path = "/documents";
