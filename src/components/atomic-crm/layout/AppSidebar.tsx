import {
  LayoutDashboard,
  Users,
  Kanban,
  Settings,
  UserCircle,
  UserCheck,
  Target,
  BarChart3,
  Mail,
  ClipboardList,
  GraduationCap,
  HelpCircle,
} from "lucide-react";
import { CanAccess, useTranslate } from "ra-core";
import { Link, matchPath, useLocation } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useConfigurationContext } from "../root/ConfigurationContext";

const AGENTS = [
  { name: "Kay", color: "bg-cyan-400" },
  { name: "Eric", color: "bg-emerald-400" },
  { name: "Sue", color: "bg-purple-400" },
  { name: "Sam", color: "bg-orange-400" },
  { name: "Dez", color: "bg-rose-400" },
] as const;

interface AppSidebarProps {
  onOpenAgentPanel?: (agentName: string) => void;
}

export const AppSidebar = ({ onOpenAgentPanel }: AppSidebarProps) => {
  const { darkModeLogo, lightModeLogo, title } = useConfigurationContext();
  const location = useLocation();
  const translate = useTranslate();

  const isActive = (path: string) => {
    if (path === "/") return !!matchPath("/", location.pathname);
    return !!matchPath(`${path}/*`, location.pathname);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-sidebar-foreground no-underline"
        >
          <img
            className="[.light_&]:hidden h-6 shrink-0"
            src={darkModeLogo}
            alt={title}
          />
          <img
            className="[.dark_&]:hidden h-6 shrink-0"
            src={lightModeLogo}
            alt={title}
          />
          <span className="text-lg font-semibold truncate group-data-[collapsible=icon]:hidden">
            {title}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/")}
                  tooltip={translate("ra.page.dashboard")}
                >
                  <Link to="/">
                    <LayoutDashboard className="shrink-0" />
                    <span>{translate("ra.page.dashboard")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/contacts")}
                  tooltip={translate("resources.contacts.name", {
                    smart_count: 2,
                  })}
                >
                  <Link to="/contacts">
                    <Users className="shrink-0" />
                    <span>
                      {translate("resources.contacts.name", {
                        smart_count: 2,
                      })}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/pipeline")}
                  tooltip="Pipeline"
                >
                  <Link to="/pipeline">
                    <Kanban className="shrink-0" />
                    <span>Pipeline</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Modules */}
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Clients">
                  <UserCheck className="shrink-0" />
                  <span>Clients</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Opportunities">
                  <Target className="shrink-0" />
                  <span>Opportunities</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Analytics">
                  <BarChart3 className="shrink-0" />
                  <span>Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Email">
                  <Mail className="shrink-0" />
                  <span>Email</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Forms">
                  <ClipboardList className="shrink-0" />
                  <span>Forms</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Academy">
                  <GraduationCap className="shrink-0" />
                  <span>Academy</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Agents */}
        <SidebarGroup>
          <SidebarGroupLabel>AI Agents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {AGENTS.map((agent) => (
                <SidebarMenuItem key={agent.name}>
                  <SidebarMenuButton
                    tooltip={agent.name}
                    onClick={() => onOpenAgentPanel?.(agent.name)}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${agent.color} shrink-0`}
                    />
                    <span>{agent.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <CanAccess resource="configuration" action="edit">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/settings")}
                tooltip="Settings"
              >
                <Link to="/settings">
                  <Settings className="shrink-0" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </CanAccess>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/profile")}
              tooltip="Profile"
            >
              <Link to="/profile">
                <UserCircle className="shrink-0" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Help">
              <HelpCircle className="shrink-0" />
              <span>Manual & Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
