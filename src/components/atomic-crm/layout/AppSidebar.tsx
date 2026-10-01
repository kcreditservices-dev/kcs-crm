import {
  LayoutDashboard,
  Users,
  Kanban,
  Settings,
  UserCircle,
  BarChart3,
  Mail,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  Share2,
  CreditCard,
  Zap,
  UserPlus,
  FolderOpen,
  CalendarDays,
  FileBarChart,
  ShieldCheck,
  Bot,
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
  { name: "Kay", avatar: "/avatars/kay.png" },
  { name: "Eric", avatar: "/avatars/eric.png" },
  { name: "Sue", avatar: "/avatars/sue.png" },
  { name: "Sam", avatar: "/avatars/sam.png" },
  { name: "Des", avatar: "/avatars/des.png" },
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
        {/* Core Navigation */}
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

        {/* Communication */}
        <SidebarGroup>
          <SidebarGroupLabel>Communication</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/conversations")}
                  tooltip="Conversations"
                >
                  <Link to="/conversations">
                    <MessageSquare className="shrink-0" />
                    <span>Conversations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Email">
                  <Mail className="shrink-0" />
                  <span>Email</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/social")}
                  tooltip="Social Media"
                >
                  <Link to="/social">
                    <Share2 className="shrink-0" />
                    <span>Social Media</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Operations */}
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/payments")}
                  tooltip="Payments"
                >
                  <Link to="/payments">
                    <CreditCard className="shrink-0" />
                    <span>Payments</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Automations">
                  <Zap className="shrink-0" />
                  <span>Automations</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Affiliates">
                  <UserPlus className="shrink-0" />
                  <span>Affiliates</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Documents">
                  <FolderOpen className="shrink-0" />
                  <span>Documents</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Calendar">
                  <CalendarDays className="shrink-0" />
                  <span>Calendar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/kcb")}
                  tooltip="KCB"
                >
                  <Link to="/kcb">
                    <Bot className="shrink-0" />
                    <span>KCB</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="MyScoreIQ">
                  <a
                    href="https://member.myscoreiq.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ShieldCheck className="shrink-0" />
                    <span>MyScoreIQ</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Insights */}
        <SidebarGroup>
          <SidebarGroupLabel>Insights</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Analytics">
                  <BarChart3 className="shrink-0" />
                  <span>Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Reports">
                  <FileBarChart className="shrink-0" />
                  <span>Reports</span>
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

        {/* AI Agents */}
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
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
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
