import { ExternalLink, GraduationCap, PlayCircle, BookOpen } from "lucide-react";

const RESOURCES = [
  {
    title: "King Credit Academy",
    description: "Full credit repair training program for mentees and team members.",
    url: "https://kingcreditacademy.com",
    icon: GraduationCap,
  },
  {
    title: "Money Moves (Skool)",
    description: "Community group with lessons, discussions, and live sessions.",
    url: "https://www.skool.com/money-moves",
    icon: BookOpen,
  },
  {
    title: "King Credit YouTube",
    description: "Credit repair tutorials, client success stories, and industry breakdowns.",
    url: "https://www.youtube.com/@kingcreditservices",
    icon: PlayCircle,
  },
  {
    title: "Knowledge Base",
    description: "Internal KB with dispute playbook, agent docs, and process guides.",
    url: "https://kcs-kb.netlify.app",
    icon: BookOpen,
  },
];

export const AcademyPage = () => {
  return (
    <div className="space-y-6 mt-1">
      <div>
        <h1 className="text-2xl font-bold glow-text">Academy</h1>
        <p className="text-sm text-muted-foreground">
          Training, resources, and knowledge base for the KCS team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RESOURCES.map((resource) => {
          const Icon = resource.icon;
          return (
            <a
              key={resource.title}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-card glow-border p-6 flex items-start gap-4 hover:bg-accent/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{resource.title}</p>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {resource.description}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

AcademyPage.path = "/academy";
