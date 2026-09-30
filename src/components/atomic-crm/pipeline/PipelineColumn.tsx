import { Link } from "react-router";
import {
  AvatarFallback,
  AvatarImage,
  Avatar as ShadcnAvatar,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Contact } from "../types";
import type { NoteStatus } from "../types";

interface PipelineColumnProps {
  stage: NoteStatus;
  contacts: Contact[];
}

export const PipelineColumn = ({ stage, contacts }: PipelineColumnProps) => {
  return (
    <div className="flex flex-col min-w-[260px] max-w-[300px] flex-1">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span
          className="inline-block w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: stage.color }}
        />
        <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
        <Badge variant="secondary" className="text-xs ml-auto">
          {contacts.length}
        </Badge>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-200px)] px-1 pb-4">
        {contacts.map((contact) => (
          <PipelineCard key={String(contact.id)} contact={contact} />
        ))}
        {contacts.length === 0 && (
          <div className="text-center text-muted-foreground text-xs py-8 border border-dashed rounded-lg">
            No clients
          </div>
        )}
      </div>
    </div>
  );
};

const PipelineCard = ({ contact }: { contact: Contact }) => {
  return (
    <Link to={`/contacts/${contact.id}/show`} className="no-underline">
      <Card className="hover:border-primary/40 transition-colors cursor-pointer">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <ShadcnAvatar className="w-8 h-8">
              <AvatarImage src={contact.avatar?.src ?? undefined} />
              <AvatarFallback className="text-xs">
                {contact.first_name?.charAt(0).toUpperCase()}
                {contact.last_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </ShadcnAvatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {contact.first_name} {contact.last_name}
              </span>
              {contact.email_jsonb?.[0]?.email && (
                <span className="text-xs text-muted-foreground truncate">
                  {contact.email_jsonb[0].email}
                </span>
              )}
            </div>
          </div>
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {contact.tags.length} tag{contact.tags.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
