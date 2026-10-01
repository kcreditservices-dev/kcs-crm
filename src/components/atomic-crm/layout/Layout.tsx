import { Suspense, useState, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Notification } from "@/components/admin/notification";
import { Error } from "@/components/admin/error";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { DataImportProvider } from "../dataImport/DataImportProvider";
import { useConfigurationLoader } from "../root/useConfigurationLoader";
import { AppSidebar } from "./AppSidebar";
import { AgentPanel } from "./AgentPanel";
import Header from "./Header";

type AgentName = "Kay" | "Eric" | "Sue" | "Sam" | "Des";

export const Layout = ({ children }: { children: ReactNode }) => {
  useConfigurationLoader();
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentName>("Kay");

  const handleOpenAgentPanel = (agentName: string) => {
    setActiveAgent(agentName as AgentName);
    setAgentPanelOpen(true);
  };

  return (
    <DataImportProvider>
      <SidebarProvider>
        <AppSidebar onOpenAgentPanel={handleOpenAgentPanel} />
        <SidebarInset
          className="transition-[margin] duration-200"
          style={{
            marginRight: agentPanelOpen ? "380px" : undefined,
          }}
        >
          <Header
            onToggleAgentPanel={() => setAgentPanelOpen((prev) => !prev)}
            isAgentPanelOpen={agentPanelOpen}
          />
          <main className="p-4" id="main-content">
            <ErrorBoundary FallbackComponent={Error}>
              <Suspense
                fallback={<Skeleton className="h-12 w-12 rounded-full" />}
              >
                {children}
              </Suspense>
            </ErrorBoundary>
          </main>
        </SidebarInset>

        <AgentPanel
          isOpen={agentPanelOpen}
          onClose={() => setAgentPanelOpen(false)}
          activeAgent={activeAgent}
          onChangeAgent={setActiveAgent}
        />
      </SidebarProvider>
      <Notification />
    </DataImportProvider>
  );
};
