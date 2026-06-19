"use client"

import { JoinLegacyWizard } from "./join-legacy-wizard"

type JoinLegacyFormProps = {
  claimableTree?: {
    id: string
    name: string
    members: Array<{ nodeId: string; displayName: string }>
  } | null
  /** Node to preselect in the claim picker (from `?node=` — e.g. a View A card "Claim"). */
  initialNodeId?: string
}

export function JoinLegacyForm(props: JoinLegacyFormProps) {
  return <JoinLegacyWizard {...props} />
}
