import { zodResolver } from "@hookform/resolvers/zod"
import type { ErrorContext } from "better-auth/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAuthCallbackUrl } from "~/hooks/use-auth-callback-url"
import { signIn } from "~/lib/auth-client"

type UseMagicLinkProps = {
  onSuccess?: (email: string) => void
  onError?: (error: ErrorContext) => void
}

export const useMagicLink = ({ onSuccess, onError }: UseMagicLinkProps = {}) => {
  const [isPending, setIsPending] = useState(false)
  const callbackURL = useAuthCallbackUrl()

  const schema = z.object({
    email: z.email("Please enter a valid email address"),
  })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  const handleSignIn = ({ email }: z.infer<typeof schema>) => {
    signIn.magicLink({
      email,
      callbackURL,
      fetchOptions: {
        onResponse: () => {
          setIsPending(false)
          form.reset()
        },
        onRequest: () => setIsPending(true),
        onSuccess: () => onSuccess?.(email),
        onError: error => onError?.(error),
      },
    })
  }

  return { form, handleSignIn, isPending }
}
