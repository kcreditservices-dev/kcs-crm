import { useResourceDefinitions } from "ra-core";

import type { ContactImportSchema } from "../contacts/useContactImport";
import { useContactImport } from "../contacts/useContactImport";
import contactsSampleCsv from "../contacts/contacts_export.csv?raw";
import type { ImportableResource } from "./types";

/** Every resource a CSV can be imported into, in the order the dialog offers them. */
export const IMPORTABLE_RESOURCES = ["contacts"] as const;

export type ImportableResourceName = (typeof IMPORTABLE_RESOURCES)[number];

/**
 * The importable resources, restricted to those the running Admin registers.
 */
export function useImportableResources(): ImportableResource[] {
  const processContacts = useContactImport();
  const definitions = useResourceDefinitions();

  const resources: ImportableResource[] = [
    {
      name: "contacts",
      sampleCsv: contactsSampleCsv,
      textColumns: ["phone_work", "phone_home", "phone_other"],
      // The contact importer predates the shared ImportRow type and declares
      // its own all-string schema; it reads the same parsed cells.
      processBatch: (batch) => processContacts(batch as ContactImportSchema[]),
    },
  ];

  return resources.filter(({ name }) => name in definitions);
}
