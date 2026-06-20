"use client"

import { getRandomDigits } from "@dirstack/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useHotkeys, useLocalStorage } from "@mantine/hooks"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { millisecondsInSecond } from "date-fns/constants"
import debounce from "debounce"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Form, FormControl, FormField, FormItem } from "~/components/common/form"
import { Input } from "~/components/common/input"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { feedbackConfig } from "~/config/feedback"
import { useBrand } from "~/contexts/brand-context"
import { useSession } from "~/lib/auth-client"
import { cx } from "~/lib/utils"
import { reportFeedback } from "~/server/web/actions/report"
import { createFeedbackSchema } from "~/server/web/shared/schema"

type FeedbackWidgetFormProps = {
  toastId: string
  setDismissed: (dismissed: boolean) => void
}

const FeedbackWidgetForm = ({ toastId, setDismissed }: FeedbackWidgetFormProps) => {
  const { data: session } = useSession()
  const t = useTranslations("forms.feedback")
  const tSchema = useTranslations("schema")
  const { name: siteName } = useBrand()

  const schema = createFeedbackSchema(tSchema)
  const resolver = zodResolver(schema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(reportFeedback, resolver, {
    formProps: {
      defaultValues: {
        email: session?.user.email || "",
        message: "",
      },
    },

    actionProps: {
      onSuccess: () => {
        toast.success(t("success_message"), {
          id: toastId,
          duration: 3000,
        })

        setDismissed(true)
        form.reset()
      },

      onError: ({ error }) => {
        toast.error(error.serverError, {
          id: toastId,
          duration: 3000,
        })
      },
    },
  })

  // A hotkey to submit the form
  useHotkeys([["mod+enter", () => handleSubmitWithAction()]], [], true)

  return (
    <Form {...form}>
      <Stack
        direction="column"
        className="items-stretch w-full"
        render={<form onSubmit={handleSubmitWithAction} noValidate />}
      >
        <p className="mb-1 text-xs">{t("question", { siteName })}</p>

        {!session?.user && (
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    size="sm"
                    placeholder={t("email_placeholder")}
                    className={cx("text-xs", fieldState.error ? "bg-destructive/5!" : "")}
                    data-1p-ignore
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="message"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <TextArea
                  size="sm"
                  placeholder={t("feedback_placeholder")}
                  className={cx("h-20 text-xs", fieldState.error ? "bg-destructive/5!" : "")}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Stack size="sm">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="text-xs flex-1"
            onClick={() => {
              toast.dismiss()
              setDismissed(true)
            }}
          >
            {t("dismiss_button")}
          </Button>

          <Button size="sm" className="text-xs flex-1" isPending={action.isPending}>
            {t("send_button")}
          </Button>
        </Stack>
      </Stack>
    </Form>
  )
}

export const FeedbackWidget = () => {
  const toastId = useMemo(() => getRandomDigits(10), [])
  const startTime = useRef(Date.now())
  const [shouldShow, setShouldShow] = useState(false)
  const maxScrollRef = useRef(0)
  const pathname = usePathname()
  const { slug } = useBrand()

  // Routes with a fixed full-width bottom CTA on mobile — the bottom-corner toast
  // would cover the primary CTA on a ~390px viewport, so it never opens there.
  const suppressedHere = feedbackConfig.suppressOnPathPrefixes.some(prefix =>
    pathname.startsWith(prefix),
  )
  const feedbackKey = `${slug}-feedback-dismissed`
  const pageViewsKey = `${slug}-page-views`
  const { minTimeSpent, minPageView, minScroll, timeCheckInterval } = feedbackConfig.thresholds

  const [dismissed, setDismissed] = useLocalStorage({
    key: feedbackKey,
    defaultValue: false,
    getInitialValueInEffect: false,
  })

  // Initialize page views once
  const pageViews = useMemo(() => {
    if (typeof sessionStorage === "undefined") {
      return 1
    }

    const storedViews = Number.parseInt(sessionStorage.getItem(pageViewsKey) || "1", 10)
    sessionStorage.setItem(pageViewsKey, (storedViews + 1).toString())
    return storedViews + 1
  }, [])

  // Debounced scroll handler
  const handleScroll = useMemo(
    () =>
      debounce(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrolled = (window.scrollY / scrollHeight) * 100
        maxScrollRef.current = Math.max(maxScrollRef.current, scrolled)
      }, 150),
    [],
  )

  // Check engagement criteria
  const checkEngagement = useCallback(() => {
    if (dismissed || shouldShow) return

    const timeSpent = (Date.now() - startTime.current) / 1000

    if (
      timeSpent >= minTimeSpent &&
      pageViews >= minPageView &&
      maxScrollRef.current >= minScroll
    ) {
      setShouldShow(true)

      toast(<FeedbackWidgetForm toastId={toastId} setDismissed={setDismissed} />, {
        id: toastId,
        duration: Number.POSITIVE_INFINITY,
        className: "max-w-54 py-3",
        onDismiss: () => setDismissed(true),
      })
    }
  }, [dismissed, shouldShow, pageViews, toastId, setDismissed])

  // Setup scroll listener and engagement checker
  useEffect(() => {
    if (dismissed || !feedbackConfig.enabled || suppressedHere) return

    window.addEventListener("scroll", handleScroll)
    const interval = setInterval(checkEngagement, timeCheckInterval * millisecondsInSecond)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      handleScroll.clear() // Using clear() instead of cancel() for debounce
      clearInterval(interval)
    }
  }, [dismissed, handleScroll, checkEngagement, suppressedHere])

  return null
}
