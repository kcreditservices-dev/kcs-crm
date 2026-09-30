import { useGetList } from "ra-core";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Contact } from "../types";
import { PipelineColumn } from "./PipelineColumn";

export const PipelinePage = () => {
  const { noteStatuses } = useConfigurationContext();
  const { data: contacts, isPending } = useGetList<Contact>("contacts", {
    pagination: { page: 1, perPage: 500 },
    sort: { field: "last_seen", order: "DESC" },
  });

  if (isPending) {
    return (
      <div className="flex gap-4 p-6 overflow-x-auto">
        {noteStatuses.map((stage) => (
          <div
            key={stage.value}
            className="min-w-[260px] max-w-[300px] flex-1"
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <span
                className="inline-block w-3 h-3 rounded-full shrink-0 animate-pulse bg-muted"
              />
              <span className="h-4 w-20 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-2 px-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted/50 animate-pulse rounded-lg"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const contactsByStage = new Map<string, Contact[]>();
  for (const stage of noteStatuses) {
    contactsByStage.set(stage.value, []);
  }
  // Unassigned bucket for contacts with no status
  const unassigned: Contact[] = [];

  for (const contact of contacts ?? []) {
    const status = contact.status;
    if (!status || !contactsByStage.has(status)) {
      unassigned.push(contact);
    } else {
      contactsByStage.get(status)!.push(contact);
    }
  }

  return (
    <div className="flex gap-4 p-6 overflow-x-auto">
      {noteStatuses.map((stage) => (
        <PipelineColumn
          key={stage.value}
          stage={stage}
          contacts={contactsByStage.get(stage.value) ?? []}
        />
      ))}
      {unassigned.length > 0 && (
        <PipelineColumn
          stage={{ value: "unassigned", label: "Unassigned", color: "#888888" }}
          contacts={unassigned}
        />
      )}
    </div>
  );
};

PipelinePage.path = "/pipeline";
