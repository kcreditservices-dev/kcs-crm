import { useState } from "react";
import {
  InfiniteListBase,
  RecordRepresentation,
  ShowBase,
  useShowContext,
  useTranslate,
} from "ra-core";
import type { ShowBaseProps } from "ra-core";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Pencil, MessageSquare, FileText } from "lucide-react";
import { Link } from "react-router";
import { ReferenceManyField } from "@/components/admin/reference-many-field";

import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import { NoteCreate, NotesIterator, NotesIteratorMobile } from "../notes";
import { NoteCreateSheet } from "../notes/NoteCreateSheet";
import { TagsListEdit } from "./TagsListEdit";
import { ContactEditSheet } from "./ContactEditSheet";
import { ContactStatusSelector } from "./ContactInputs";
import { ContactCreditInfo } from "./ContactCreditInfo";
import { ContactPersonalInfo } from "./ContactPersonalInfo";
import { ContactBackgroundInfo } from "./ContactBackgroundInfo";
import { ContactTasksList } from "./ContactTasksList";
import { AddTask } from "../tasks/AddTask";
import { TasksIterator } from "../tasks/TasksIterator";
import type { Contact } from "../types";
import { Avatar } from "./Avatar";
import { useConfigurationContext } from "../root/ConfigurationContext";
import { ConversationThread } from "../conversations/ConversationThread";
import { MobileBackButton } from "../misc/MobileBackButton";
import { ContactMergeButton } from "./ContactMergeButton";
import { ExportVCardButton } from "./ExportVCardButton";
import { EditButton } from "@/components/admin/edit-button";
import { DeleteButton } from "@/components/admin";

export const ContactShow = (props: ShowBaseProps = {}) => {
  const isMobile = useIsMobile();

  return (
    <ShowBase
      queryOptions={{
        onError: isMobile
          ? () => {
              {
                /** Disable error notification as the content handles offline */
              }
            }
          : undefined,
      }}
      {...props}
    >
      {isMobile ? <ContactShowContentMobile /> : <ContactShowContent />}
    </ShowBase>
  );
};

const ContactShowContentMobile = () => {
  const translate = useTranslate();
  const { defaultTitle, record, isPending } = useShowContext<Contact>();
  const [noteCreateOpen, setNoteCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  if (isPending || !record) return null;

  const taskCount = record.nb_tasks ?? 0;

  return (
    <>
      <NoteCreateSheet
        open={noteCreateOpen}
        onOpenChange={setNoteCreateOpen}
        contact_id={record.id}
      />
      <ContactEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        contactId={record.id}
      />
      <MobileHeader>
        <MobileBackButton />
        <div className="flex flex-1 min-w-0">
          <Link to="/contacts" className="flex-1 min-w-0">
            <h1 className="truncate text-xl font-semibold">{defaultTitle}</h1>
          </Link>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={translate("ra.action.edit")}
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-5" />
        </Button>
      </MobileHeader>
      <MobileContent>
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Avatar />
            <div className="mx-3 flex-1">
              <h2 className="text-2xl font-bold">
                <RecordRepresentation />
              </h2>
              {record.title && (
                <div className="text-sm text-muted-foreground">
                  {record.title}
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="notes">
              {translate("resources.notes.name", { smart_count: 2 })}
            </TabsTrigger>
            <TabsTrigger value="tasks">
              {translate("crm.common.task_count", {
                smart_count: taskCount ?? 0,
              })}
            </TabsTrigger>
            <TabsTrigger value="details">
              {translate("crm.common.details")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-2">
            <InfiniteListBase
              resource="contact_notes"
              filter={{ contact_id: record.id }}
              sort={{ field: "date", order: "DESC" }}
              perPage={25}
              disableSyncWithLocation
              storeKey={false}
              empty={
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    {translate("resources.notes.empty")}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setNoteCreateOpen(true)}
                  >
                    {translate("resources.notes.action.add")}
                  </Button>
                </div>
              }
              loading={false}
              error={false}
              queryOptions={{
                onError: () => {
                  /** override to hide notification as error case is handled by NotesIteratorMobile */
                },
              }}
            >
              <NotesIteratorMobile contactId={record.id} showStatus />
            </InfiniteListBase>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <ContactTasksList />
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">
                  {translate("resources.notes.fields.status")}
                </h3>
                <Separator />
                <div className="mt-3">
                  <ContactStatusSelector />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Credit Info</h3>
                <Separator />
                <div className="mt-3">
                  <ContactCreditInfo />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {translate(
                    "resources.contacts.field_categories.personal_info",
                  )}
                </h3>
                <Separator />
                <div className="mt-3">
                  <ContactPersonalInfo />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {translate(
                    "resources.contacts.field_categories.background_info",
                  )}
                </h3>
                <Separator />
                <div className="mt-3">
                  <ContactBackgroundInfo />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {translate("resources.tags.name", { smart_count: 2 })}
                </h3>
                <Separator />
                <div className="mt-3">
                  <TagsListEdit />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </MobileContent>
    </>
  );
};

const ContactShowContent = () => {
  const translate = useTranslate();
  const { record, isPending } = useShowContext<Contact>();
  const { noteStatuses } = useConfigurationContext();
  if (isPending || !record) return null;

  const currentStage = noteStatuses.find((s) => s.value === record.status);

  return (
    <div className="flex h-[calc(100vh-52px)]">
      {/* LEFT SIDEBAR — Contact Details */}
      <div className="w-72 min-w-72 border-r overflow-y-auto p-4 space-y-5">
        {/* Back link */}
        <Link
          to="/contacts"
          className="text-sm text-muted-foreground hover:text-foreground no-underline"
        >
          ← Contact Details
        </Link>

        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          <Avatar />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">
              <RecordRepresentation />
            </h2>
            {record.title && (
              <div className="text-xs text-muted-foreground">{record.title}</div>
            )}
          </div>
        </div>

        {/* Status badge */}
        {currentStage && (
          <div>
            <Badge
              className="text-xs font-medium"
              style={{ backgroundColor: currentStage.color, color: "#fff" }}
            >
              {currentStage.label}
            </Badge>
          </div>
        )}

        {/* Status selector */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Dispute Round
          </h4>
          <ContactStatusSelector />
        </div>

        {/* Tags */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Tags
          </h4>
          <TagsListEdit />
        </div>

        <Separator />

        {/* Credit Info */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Credit Info
          </h4>
          <ContactCreditInfo />
        </div>

        <Separator />

        {/* Personal Info */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Contact Info
          </h4>
          <ContactPersonalInfo />
        </div>

        <Separator />

        {/* Background */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Background
          </h4>
          <ContactBackgroundInfo />
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-col gap-2 items-start">
          <EditButton label="Edit Contact" />
          <ExportVCardButton />
          <ContactMergeButton />
          <DeleteButton
            className="h-6 cursor-pointer hover:bg-destructive/10! text-destructive! border-destructive! focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
            size="sm"
          />
        </div>
      </div>

      {/* CENTER — Conversations / Notes / Tasks */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Tabs defaultValue="conversations" className="flex flex-col flex-1 overflow-hidden">
          <div className="border-b px-4">
            <TabsList className="h-11 bg-transparent gap-4">
              <TabsTrigger
                value="conversations"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3"
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                Conversations
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3"
              >
                <FileText className="w-4 h-4 mr-1.5" />
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3"
              >
                Tasks
                {(record.nb_tasks ?? 0) > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                    {record.nb_tasks}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="conversations" className="flex-1 overflow-hidden mt-0">
            <ConversationThread contactId={record.id} />
          </TabsContent>

          <TabsContent value="notes" className="flex-1 overflow-y-auto p-4 mt-0">
            <InfiniteListBase
              resource="contact_notes"
              filter={{ contact_id: record.id }}
              sort={{ field: "date", order: "DESC" }}
              perPage={25}
              disableSyncWithLocation
              storeKey={false}
              empty={
                <NoteCreate reference="contacts" showStatus className="mt-4" />
              }
            >
              <NotesIterator reference="contacts" showStatus />
            </InfiniteListBase>
          </TabsContent>

          <TabsContent value="tasks" className="flex-1 overflow-y-auto p-4 mt-0">
            <ReferenceManyField
              target="contact_id"
              reference="tasks"
              sort={{ field: "due_date", order: "ASC" }}
              perPage={1000}
            >
              <TasksIterator />
            </ReferenceManyField>
            <AddTask />
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT SIDEBAR — Activity */}
      <div className="w-72 min-w-72 border-l overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">
          Activity
        </h3>
        <div className="space-y-4">
          {record.first_seen && (
            <ActivityItem
              label="Contact created"
              date={record.first_seen}
            />
          )}
          {record.last_seen && record.last_seen !== record.first_seen && (
            <ActivityItem
              label="Last activity"
              date={record.last_seen}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ label, date }: { label: string; date: string }) => {
  const d = new Date(date);
  const formatted = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex items-start gap-3">
      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
      <div>
        <div className="text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">
          {formatted} at {time}
        </div>
      </div>
    </div>
  );
};
