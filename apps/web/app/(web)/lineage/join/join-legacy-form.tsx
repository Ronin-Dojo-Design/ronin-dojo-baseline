"use client"

import type { JoinWizardOptions } from "~/server/web/lineage/join-options"
import { JoinLegacyWizard } from "./join-legacy-wizard"

type JoinLegacyFormProps = {
  claimableTree?: {
    id: string
    name: string
    members: Array<{ nodeId: string; displayName: string }>
  } | null
  /** Node to preselect in the claim picker (from `?node=` — e.g. a View A card "Claim"). */
  initialNodeId?: string
  /** Claim-link arrival only: claimed node is Dirty Dozen → lifetime (vs first-year) Elite comp. */
  compIsLifetime?: boolean
  /** Registered option lists for the creatable comboboxes (BBL-scoped, public). */
  joinOptions: JoinWizardOptions
}

export function JoinLegacyForm(props: JoinLegacyFormProps) {
  return <JoinLegacyWizard {...props} />
}
