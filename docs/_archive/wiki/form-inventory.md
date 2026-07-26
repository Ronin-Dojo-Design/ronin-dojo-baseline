---
title: "Form Inventory"
slug: form-inventory
type: reference
status: active
created: 2026-05-29
updated: 2026-05-29
last_agent: copilot-session-0294
sprint: S6
pairs_with:
  - docs/knowledge/wiki/dirstarter-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Form Inventory

> Every form component in the project, its server action, Zod schema, and location.
> Consult before building a new form — reuse patterns, avoid duplication.

---

## Admin Forms

| Form | File | Action | Notes |
|---|---|---|---|
| `AgeGroupForm` | `app/admin/age-groups/_components/age-group-form.tsx` | — | Age group CRUD |
| `BrandSettingsForm` | `app/admin/brand-settings/_components/brand-settings-form.tsx` | `upsertBrandSettings` | Brand-level theme colors + asset URLs |
| `CategoryForm` | `app/admin/categories/_components/category-form.tsx` | — | Category CRUD |
| `CertificateTemplateForm` | `app/admin/certificates/_components/certificate-template-form.tsx` | — | Certificate template CRUD |
| `ContentAtomForm` | `app/admin/content/_components/content-atom-form.tsx` | — | Content atom CRUD |
| `ContentVariantForm` | `app/admin/content/_components/content-variant-form.tsx` | — | Content variant CRUD |
| `CourseForm` | `app/admin/courses/_components/course-form.tsx` | — | Course CRUD |
| `EntitlementForm` | `app/admin/entitlements/_components/entitlement-form.tsx` | — | Entitlement CRUD |
| `InviteForm` | `app/admin/invites/_components/invite-form.tsx` | — | Invite code management |
| `LeadForm` | `app/admin/leads/_components/lead-form.tsx` | — | Lead CRUD |
| `OrgThemeForm` | `app/admin/organizations/[id]/theme/_components/org-theme-form.tsx` | `updateOrgTheme` | Super-admin org theme override (SESSION_0293) |
| `PostForm` | `app/admin/posts/_components/post-form.tsx` | — | Blog post CRUD |
| `PricingPlanForm` | `app/admin/pricing-plans/_components/pricing-plan-form.tsx` | — | Pricing plan CRUD |
| `ProgramForm` | `app/admin/programs/_components/program-form.tsx` | — | Program CRUD |
| `ReportForm` | `app/admin/reports/_components/report-form.tsx` | — | Report CRUD |
| `RoleForm` | `app/admin/roles/_components/role-form.tsx` | — | Role CRUD |
| `SkillLevelForm` | `app/admin/skill-levels/_components/skill-level-form.tsx` | — | Skill level CRUD |
| `SubscriptionForm` | `app/admin/subscriptions/_components/subscription-form.tsx` | — | Subscription CRUD |
| `SubscriptionTierForm` | `app/admin/subscription-tiers/_components/subscription-tier-form.tsx` | — | Subscription tier CRUD |
| `TagForm` | `app/admin/tags/_components/tag-form.tsx` | — | Tag CRUD |
| `ToolForm` | `app/admin/tools/_components/tool-form.tsx` | — | Tool/listing CRUD |
| `TournamentForm` | `app/admin/tournaments/_components/tournament-form.tsx` | — | Tournament CRUD |
| `TournamentRoleForm` | `app/admin/tournaments/roles/_components/tournament-role-form.tsx` | — | Tournament role CRUD |
| `RuleSetForm` | `app/admin/tournaments/rule-sets/_components/rule-set-form.tsx` | — | Rule set CRUD |
| `StaffAssignmentForm` | `app/admin/tournaments/_components/staff-assignment-form.tsx` | — | Staff assignment |
| `TenPointMustForm` | `app/admin/tournaments/_components/score-forms.tsx` | — | 10-point-must scoring |
| `PointsScoreForm` | `app/admin/tournaments/_components/score-forms.tsx` | — | Points-based scoring |
| `UserForm` | `app/admin/users/_components/user-form.tsx` | — | User CRUD |

## Web (Public / Authenticated) Forms

| Form | File | Action | Notes |
|---|---|---|---|
| `AdForm` | `app/(web)/advertise/success/ad-form.tsx` | — | Ad submission |
| `ProfileForm` | `app/(web)/dashboard/profile-form.tsx` | — | Passport profile edit |
| `SchoolForm` | `app/(web)/dashboard/school-form.tsx` | — | Org owner school edit |
| `TechniqueForm` | `app/(web)/dashboard/technique-form.tsx` | — | Technique submission |
| `ClaimForm` | `app/(web)/invite/[code]/claim-form.tsx` | — | Invite code claim |
| `LineageClaimForm` | `app/(web)/lineage/[treeSlug]/claim/claim-form.tsx` | — | Lineage node claim |
| `LineageNodeProfileForm` | `app/(web)/lineage/[treeSlug]/edit/[nodeId]/_components/lineage-node-profile-form.tsx` | — | Lineage node profile edit |
| `JoinLegacyForm` | `app/(web)/lineage/join/join-legacy-form.tsx` | — | Legacy tree join |
| `SelfServiceThemeForm` | `app/(web)/organizations/[slug]/settings/theme/_components/self-service-theme-form.tsx` | `updateOrgThemeSelfService` | Org owner/admin theme edit (SESSION_0294) |
| `DsrForm` | `app/(web)/privacy/request/_components/dsr-form.tsx` | — | Data subject request |
| `SubmitForm` | `app/(web)/submit/form.tsx` | — | Tool submission |
| `LoginForm` | `components/web/auth/login-form.tsx` | — | Magic link login |
| `CTAForm` | `components/web/cta-form.tsx` | — | Newsletter CTA |
| `LeadCaptureForm` | `components/web/lead-capture-form.tsx` | — | Lead capture |
| `LineageGroupHeaderForm` | `components/web/lineage/lineage-group-header-form.tsx` | — | Lineage group header edit |
| `CreateOrganizationForm` | `components/web/organizations/create-organization-form.tsx` | — | Org creation |
| `InviteJoinForm` | `components/web/organizations/invite-join-form.tsx` | — | Join org via invite |
| `CreateProgramForm` | `components/web/programs/create-program-form.tsx` | — | Program creation |
| `CreateScheduleForm` | `components/web/schedules/create-schedule-form.tsx` | — | Schedule creation |

## Shared Primitives

| Component | File | Notes |
|---|---|---|
| `FormMedia` | `components/common/form-media.tsx` | Image upload with preview — use inside any form |

---

## Conventions

- All forms use `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` from `~/components/common/form` (React Hook Form + Zod)
- Admin forms use `adminActionClient` actions; web forms use `userActionClient` or `publicActionClient`
- Form schemas are co-located with the form component file
- Actions are in `server/admin/*/actions.ts` or `server/web/*/actions.ts`
