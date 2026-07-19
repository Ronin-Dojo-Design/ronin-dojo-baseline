export const CONTACT_ATTEMPT_CHANNELS = ["call", "email", "meeting"] as const;
export type ContactAttemptChannel = (typeof CONTACT_ATTEMPT_CHANNELS)[number];

export const CONTACT_ATTEMPT_OUTCOMES = [
  "connected",
  "left_message",
  "no_answer",
  "invalid_contact",
  "follow_up_requested",
] as const;
export type ContactAttemptOutcome = (typeof CONTACT_ATTEMPT_OUTCOMES)[number];

export const CONTACT_ATTEMPT_OUTCOME_LABELS: Record<ContactAttemptOutcome, string> = {
  connected: "Connected",
  left_message: "Left message",
  no_answer: "No answer",
  invalid_contact: "Invalid contact details",
  follow_up_requested: "Follow-up requested",
};

export const CONTACT_ATTEMPT_CHANNEL_LABELS: Record<ContactAttemptChannel, string> = {
  call: "Manual call",
  email: "Manual email",
  meeting: "Meeting",
};

export type ContactAttemptInput = {
  channel: ContactAttemptChannel;
  nextAction: string;
  nextActionDueAt: string;
  notes?: string;
  outcome: ContactAttemptOutcome;
  projectId: string;
};

export type ValidContactAttemptInput = Omit<ContactAttemptInput, "nextActionDueAt" | "notes"> & {
  nextActionDueAt: Date;
  notes: string;
};

export type SalesQueueItem = {
  activityId: string;
  contactName: string;
  dueAt: string;
  projectId: string;
  projectName: string;
  title: string;
};

export type SalesQueueBuckets = {
  overdue: SalesQueueItem[];
  today: SalesQueueItem[];
  upcoming: SalesQueueItem[];
};

export type SalesCockpitActivity = {
  body: string;
  completedAt: string | null;
  createdAt: string;
  dueAt: string | null;
  id: string;
  status: string;
  title: string;
  type: string;
};

export type SalesCockpitProject = {
  activities: SalesCockpitActivity[];
  attempts: AttemptLogEntry[];
  contact: {
    companyName: string | null;
    email: string;
    id: string;
    name: string;
    phone: string | null;
  };
  id: string;
  name: string;
  nextTask: string;
  /** The Opportunity's Lead Source (`LeadSource` enum value, brief §3a #1). */
  source: string;
  stage: string;
};

export type SalesCockpitReadModel = {
  asOf: string;
  queue: SalesQueueBuckets;
  roster: SalesCockpitProject[];
};

const MAX_NOTES_LENGTH = 500;
const MAX_NEXT_ACTION_LENGTH = 160;
const OPERATING_TIME_ZONE = "America/Denver";

function calendarDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: OPERATING_TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function validateContactAttemptInput(input: ContactAttemptInput): ValidContactAttemptInput {
  if (!input.projectId.trim()) throw new Error("Choose an Opportunity before recording an attempt.");
  if (!CONTACT_ATTEMPT_CHANNELS.includes(input.channel)) {
    throw new Error("Choose a supported manual Contact Attempt channel.");
  }
  if (!CONTACT_ATTEMPT_OUTCOMES.includes(input.outcome)) {
    throw new Error("Choose a supported provisional outcome.");
  }

  const nextAction = input.nextAction.trim();
  if (!nextAction) throw new Error("Exactly one Next Action is required.");
  if (nextAction.length > MAX_NEXT_ACTION_LENGTH) {
    throw new Error(`Next Action must be ${MAX_NEXT_ACTION_LENGTH} characters or fewer.`);
  }

  const nextActionDueAt = new Date(input.nextActionDueAt);
  if (!input.nextActionDueAt || Number.isNaN(nextActionDueAt.getTime())) {
    throw new Error("The Next Action needs a valid due date.");
  }

  const notes = input.notes?.trim() ?? "";
  if (notes.length > MAX_NOTES_LENGTH) {
    throw new Error(`Attempt notes must be ${MAX_NOTES_LENGTH} characters or fewer.`);
  }

  return { ...input, nextAction, nextActionDueAt, notes };
}

// ---------------------------------------------------------------------------
// Contact-attempt log (SESSION_0577 slice C) — Attempt 1/2/3 cadence
// ---------------------------------------------------------------------------

/** The manual follow-up cadence target: three attempts before re-triage. */
export const ATTEMPT_CADENCE_TARGET = 3;

export type AttemptLogEntry = {
  activityId: string;
  /** 1-based, chronological: Attempt 1 = the earliest recorded attempt. */
  attemptNumber: number;
  channel: ContactAttemptChannel;
  occurredAt: string;
  /** Human line without the "Contact Attempt — " prefix (e.g. "Manual call: Left message"). */
  summary: string;
};

export type AttemptProgress = {
  cadenceMet: boolean;
  count: number;
  label: string;
};

const ATTEMPT_TITLE_PREFIX = "Contact Attempt — ";

type AttemptSourceActivity = Pick<
  SalesCockpitActivity,
  "completedAt" | "createdAt" | "id" | "status" | "title" | "type"
>;

function isRecordedAttempt(activity: AttemptSourceActivity): boolean {
  return (
    activity.status === "completed" &&
    CONTACT_ATTEMPT_CHANNELS.includes(activity.type as ContactAttemptChannel)
  );
}

/**
 * Number a project's recorded Contact Attempts chronologically (Attempt 1 =
 * earliest). Pass the FULL attempt history — numbering a truncated "recent"
 * slice would renumber old attempts as new ones age out.
 */
export function buildAttemptLog(activities: AttemptSourceActivity[]): AttemptLogEntry[] {
  return activities
    .filter(isRecordedAttempt)
    .map((activity) => ({
      activityId: activity.id,
      channel: activity.type as ContactAttemptChannel,
      occurredAt: activity.completedAt ?? activity.createdAt,
      summary: activity.title.startsWith(ATTEMPT_TITLE_PREFIX)
        ? activity.title.slice(ATTEMPT_TITLE_PREFIX.length)
        : activity.title,
    }))
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    .map((entry, index) => ({ ...entry, attemptNumber: index + 1 }));
}

/** The "Attempt N of 3" cadence readout for a project's attempt count. */
export function attemptProgress(count: number): AttemptProgress {
  if (count === 0) {
    return { cadenceMet: false, count, label: `No attempts yet — target ${ATTEMPT_CADENCE_TARGET}` };
  }
  if (count <= ATTEMPT_CADENCE_TARGET) {
    return {
      cadenceMet: count === ATTEMPT_CADENCE_TARGET,
      count,
      label: `Attempt ${count} of ${ATTEMPT_CADENCE_TARGET}`,
    };
  }
  return {
    cadenceMet: true,
    count,
    label: `${count} attempts — ${ATTEMPT_CADENCE_TARGET}-attempt cadence complete`,
  };
}

export function bucketDueActivities(
  activities: SalesQueueItem[],
  now: Date,
): SalesQueueBuckets {
  const today = calendarDateKey(now);
  const buckets: SalesQueueBuckets = { overdue: [], today: [], upcoming: [] };
  const sorted = [...activities].sort((a, b) => {
    const dueDifference = new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    return dueDifference || a.projectName.localeCompare(b.projectName);
  });

  for (const activity of sorted) {
    const due = calendarDateKey(new Date(activity.dueAt));
    if (due < today) buckets.overdue.push(activity);
    else if (due === today) buckets.today.push(activity);
    else buckets.upcoming.push(activity);
  }
  return buckets;
}
