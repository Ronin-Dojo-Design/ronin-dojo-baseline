"use client"

import type { JoinWizardOptions } from "~/server/web/lineage/join-options"
import { JoinLegacyWizard } from "./join-legacy-wizard"
import type { JoinLegacyFormValues } from "./join-legacy-wizard/schema"

type JoinLegacyFormProps = {
  claimableTree?: {
    id: string
    name: string
    members: Array<{ nodeId: string; displayName: string }>
  } | null
  /** Node to preselect in the claim picker (from `?node=` — e.g. a View A card "Claim"). */
  initialNodeId?: string
  /** Path to preselect when a pricing card opens the intake first. */
  initialMembershipPath?: JoinLegacyFormValues["membershipPath"]
  /** Claim-link arrival only: claimed node is Dirty Dozen → lifetime (vs first-year) Elite comp. */
  compIsLifetime?: boolean
  /** Registered option lists for the creatable comboboxes (BBL-scoped, public). */
  joinOptions: JoinWizardOptions
}

export function JoinLegacyForm(props: JoinLegacyFormProps) {
  return <JoinLegacyWizard {...props} />
}
