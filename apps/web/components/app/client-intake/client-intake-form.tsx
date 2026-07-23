"use client"

import { CheckIcon, CopyIcon, DownloadIcon, Trash2Icon } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Heading } from "~/components/common/heading"
import { Hint } from "~/components/common/hint"
import { Input } from "~/components/common/input"
import { Label } from "~/components/common/label"
import { Note } from "~/components/common/note"
import { Separator } from "~/components/common/separator"
import { Switch } from "~/components/common/switch"
import { TextArea } from "~/components/common/textarea"
import {
  answeredCount,
  clientSlug,
  INTAKE_QUESTIONS,
  INTAKE_SECTIONS,
  type IntakeHeader,
  toMarkdown,
} from "./questions"

/**
 * ClientIntakeForm — the live, in-meeting capture front-end for the **Client_Meeting_Intake**
 * recipe (SESSION_0625). The operator types the client's answers in as they talk, or hands the
 * screen over and the client writes them in themselves; the output is the capture-note Markdown the
 * recipe's grill → synthesize → route flow already consumes.
 *
 * ── Why this stores nothing server-side ──────────────────────────────────────────────────────────
 * A filled intake carries a real client's name, terms, and problems. `docs/product/rdd/assets/README.md`
 * is explicit that filled/executed instances must NOT be committed and belong in the gated
 * uploader/R2 seam — so this form deliberately has **no server action, no DB model, and no network
 * call**. Answers live in component state, are mirrored to this browser's `localStorage` purely so an
 * accidental reload mid-meeting doesn't lose the conversation, and leave only by the operator's own
 * hand (copy to clipboard / download `.md`). A durable, gated store is the follow-on (G-028), not a
 * silent side effect of a capture form.
 *
 * Reuse-first: every control is an existing L1 primitive (`Card`/`Input`/`TextArea`/`Switch`/
 * `Button`) — no new form component was introduced for this surface.
 */

/** Bumped if the answer shape ever changes, so a stale draft can't half-restore. */
const DRAFT_KEY = "rdd.client-intake.draft.v1"

type Draft = { header: IntakeHeader; answers: Record<string, string> }

const emptyDraft = (): Draft => ({
  header: { client: "", contact: "", meetingDate: "", containsRealData: false },
  answers: {},
})

/** Today as `YYYY-MM-DD` in the operator's own timezone (not UTC — a late-evening meeting must not
 * date itself tomorrow). */
function todayLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function ClientIntakeForm() {
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [copied, setCopied] = useState(false)
  const fieldId = useId()

  // Restore on mount only — reading localStorage during render would break SSR hydration, and the
  // date default has to be client-derived for the same reason.
  useEffect(() => {
    const stored = window.localStorage.getItem(DRAFT_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Draft
        setDraft({ ...emptyDraft(), ...parsed })
        return
      } catch {
        // A corrupt draft is not worth a crash mid-meeting — start clean.
        window.localStorage.removeItem(DRAFT_KEY)
      }
    }
    setDraft(d => ({ ...d, header: { ...d.header, meetingDate: todayLocal() } }))
  }, [])

  // Mirror every keystroke so a reload can't cost the operator the conversation.
  useEffect(() => {
    if (draft.header.meetingDate) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [draft])

  const setHeader = <K extends keyof IntakeHeader>(key: K, value: IntakeHeader[K]) =>
    setDraft(d => ({ ...d, header: { ...d.header, [key]: value } }))

  const setAnswer = (id: string, value: string) =>
    setDraft(d => ({ ...d, answers: { ...d.answers, [id]: value } }))

  const answered = answeredCount(draft.answers)
  const markdown = () => toMarkdown(draft.header, draft.answers)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Capture copied — paste it into the vault note.")
    } catch {
      toast.error("Clipboard blocked by the browser. Use Download instead.")
    }
  }

  const download = () => {
    const name = `${clientSlug(draft.header.client) || "client"}-intake-${draft.header.meetingDate || todayLocal()}.md`
    const url = URL.createObjectURL(new Blob([markdown()], { type: "text/markdown" }))
    const a = document.createElement("a")
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${name}`)
  }

  const clear = () => {
    window.localStorage.removeItem(DRAFT_KEY)
    setDraft({ ...emptyDraft(), header: { ...emptyDraft().header, meetingDate: todayLocal() } })
    toast.success("Draft cleared from this browser.")
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <Heading size="h2">Initial client meeting</Heading>
          <Badge variant={answered === INTAKE_QUESTIONS.length ? "success" : "soft"}>
            {answered} of {INTAKE_QUESTIONS.length} answered
          </Badge>
        </div>
        <Note>
          Fill this in live during the call — or hand the screen over and let the client write it
          themselves. Nothing is sent anywhere: answers stay in this browser until you copy or
          download them.
        </Note>
      </div>

      <Card hover={false} className="gap-4">
        <div className="grid w-full gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${fieldId}-client`}>Client / company</Label>
            <Input
              id={`${fieldId}-client`}
              value={draft.header.client}
              onChange={e => setHeader("client", e.target.value)}
              placeholder="Mammoth Build Co."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${fieldId}-contact`}>Primary contact</Label>
            <Input
              id={`${fieldId}-contact`}
              value={draft.header.contact}
              onChange={e => setHeader("contact", e.target.value)}
              placeholder="Michael Flores"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${fieldId}-date`}>Meeting date</Label>
            <Input
              id={`${fieldId}-date`}
              type="date"
              value={draft.header.meetingDate}
              onChange={e => setHeader("meetingDate", e.target.value)}
            />
          </div>
        </div>

        <Separator />

        <div className="flex w-full flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Switch
              id={`${fieldId}-real`}
              checked={draft.header.containsRealData}
              onCheckedChange={checked => setHeader("containsRealData", checked)}
            />
            <Label htmlFor={`${fieldId}-real`}>These answers contain real client information</Label>
          </div>
          <Hint>
            {draft.header.containsRealData
              ? "The export will be stamped contains_real_data: true and carry a do-not-commit banner. Keep it in the private vault or the gated uploader — never in git."
              : "Leave off for a demo or dry run. The export is stamped demo-safe."}
          </Hint>
        </div>
      </Card>

      {INTAKE_SECTIONS.map(section => (
        <section key={section.title} className="flex flex-col gap-3">
          <Heading size="h3">{section.title}</Heading>
          {section.questions.map(q => (
            <Card key={q.id} hover={false} className="gap-2">
              <Label htmlFor={`${fieldId}-${q.id}`}>{q.prompt}</Label>
              <Hint>{q.why}</Hint>
              <TextArea
                id={`${fieldId}-${q.id}`}
                value={draft.answers[q.id] ?? ""}
                onChange={e => setAnswer(q.id, e.target.value)}
                className="min-h-24"
                placeholder="Their answer, in their words…"
              />
            </Card>
          ))}
        </section>
      ))}

      <div className="sticky bottom-4 flex flex-wrap gap-2 rounded-lg border bg-card p-3 shadow-lg">
        <Button type="button" onClick={copy} prefix={copied ? <CheckIcon /> : <CopyIcon />}>
          {copied ? "Copied" : "Copy as Markdown"}
        </Button>
        <Button type="button" variant="secondary" onClick={download} prefix={<DownloadIcon />}>
          Download .md
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={clear}
          prefix={<Trash2Icon />}
          className="ml-auto"
        >
          Clear draft
        </Button>
      </div>
    </div>
  )
}
