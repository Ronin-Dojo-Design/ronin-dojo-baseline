import { Bell, Lock, User } from "lucide-react"
import type { ComponentType } from "react"
import type { MemberSettings } from "~/server/web/settings/member-settings"

/**
 * Field + section metadata for the member settings toggle cards — the single source the live
 * form and the loading skeleton both read, so their row counts never drift. Labels are verbatim
 * from BBLApp's `BBLSettingsPage` `SECTIONS`; the keys map 1:1 onto {@link MemberSettings}.
 */
type ToggleField<G extends keyof MemberSettings> = {
  key: keyof MemberSettings[G]
  label: string
}

type IconType = ComponentType<{ className?: string }>

export const PROFILE_FIELDS = [
  { key: "directory", label: "Show my profile in the member directory" },
  { key: "contact", label: "Allow instructors to view contact details" },
  { key: "lineage", label: "Display belt lineage on my profile" },
] satisfies ToggleField<"profile">[]

export const NOTIFICATION_FIELDS = [
  { key: "approvals", label: "Invite approvals and roster updates" },
  { key: "events", label: "Event and tournament announcements" },
  { key: "posts", label: "Posts and techniques from my lineage" },
] satisfies ToggleField<"notifications">[]

export const SECURITY_FIELDS = [
  { key: "sessions", label: "Email me new login activity" },
  { key: "recovery", label: "Enable recovery alerts" },
] satisfies ToggleField<"security">[]

export const SECTION_META: Record<
  "profile" | "notifications" | "security",
  { title: string; description: string; icon: IconType; fieldCount: number }
> = {
  profile: {
    title: "Profile & Directory",
    description: "Control your public presence and lineage visibility.",
    icon: User,
    fieldCount: PROFILE_FIELDS.length,
  },
  notifications: {
    title: "Notifications",
    description: "Pick the updates that should reach your inbox.",
    icon: Bell,
    fieldCount: NOTIFICATION_FIELDS.length,
  },
  security: {
    title: "Security & Access",
    description: "Protect your account and keep access current.",
    icon: Lock,
    fieldCount: SECURITY_FIELDS.length,
  },
}
