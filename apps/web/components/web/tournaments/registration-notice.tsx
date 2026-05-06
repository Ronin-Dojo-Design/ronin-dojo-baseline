export type RegistrationNoticeRegistration = {
  status: string
  paymentStatus: string
}

type RegisteredQueryState = boolean | string | null | undefined

type RegistrationNoticeInput = {
  registered?: RegisteredQueryState
  existingRegistration?: RegistrationNoticeRegistration | null
}

type RegistrationNoticeTone = "success" | "warning" | "info"

type RegistrationNoticeContent = {
  tone: RegistrationNoticeTone
  title: string
  body: string
}

const noticeStyles: Record<RegistrationNoticeTone, string> = {
  success: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  warning: "border-orange-500/30 bg-orange-500/10 text-orange-800 dark:text-orange-300",
  info: "border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-300",
}

export function isCancelledRegistration(registration?: RegistrationNoticeRegistration | null) {
  return registration?.status === "CANCELLED"
}

export function isRefundedRegistration(registration?: RegistrationNoticeRegistration | null) {
  return isCancelledRegistration(registration) && registration?.paymentStatus === "REFUNDED"
}

export function getRegistrationNotice({
  registered,
  existingRegistration,
}: RegistrationNoticeInput): RegistrationNoticeContent | null {
  if (registered !== true && registered !== "true") {
    return null
  }

  if (isRefundedRegistration(existingRegistration)) {
    return {
      tone: "warning",
      title: "Registration could not be completed",
      body:
        "The selected division filled before your payment was confirmed. " +
        "Your payment was refunded, and no tournament slot was taken.",
    }
  }

  if (isCancelledRegistration(existingRegistration)) {
    return {
      tone: "warning",
      title: "Registration is cancelled",
      body: "This tournament registration has been cancelled and no tournament slot was taken.",
    }
  }

  if (existingRegistration) {
    return {
      tone: "success",
      title: "Registration confirmed!",
      body: "You have been successfully registered for this tournament.",
    }
  }

  return {
    tone: "info",
    title: "Registration processing",
    body:
      "We are still confirming your tournament registration. " +
      "Refresh this page in a moment or check your email for the final status.",
  }
}

export function RegistrationNotice(props: RegistrationNoticeInput) {
  const notice = getRegistrationNotice(props)

  if (!notice) {
    return null
  }

  return (
    <div aria-live="polite" className={`rounded-lg border p-4 ${noticeStyles[notice.tone]}`}>
      <p className="font-semibold">{notice.title}</p>
      <p className="mt-1 text-sm">{notice.body}</p>
    </div>
  )
}
