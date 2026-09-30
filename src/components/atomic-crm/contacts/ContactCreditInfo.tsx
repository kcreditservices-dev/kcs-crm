import { useRecordContext } from "ra-core";
import { Badge } from "@/components/ui/badge";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Contact } from "../types";

export const ContactCreditInfo = () => {
  const record = useRecordContext<Contact>();
  const { noteStatuses } = useConfigurationContext();

  if (!record) return null;

  const currentStage = noteStatuses.find((s) => s.value === record.status);

  return (
    <div className="space-y-3">
      {currentStage && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Dispute Round</span>
          <Badge
            className="text-xs font-medium"
            style={{
              backgroundColor: currentStage.color,
              color: "#fff",
            }}
          >
            {currentStage.label}
          </Badge>
        </div>
      )}
      {record.title && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Plan</span>
          <span className="text-sm font-medium">{record.title}</span>
        </div>
      )}
    </div>
  );
};
