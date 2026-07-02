import {
  Body,
  Container,
  type ContainerProps,
  Head,
  Hr,
  Html,
  Preview,
  pixelBasedPreset,
  Tailwind,
  Text,
} from "@react-email/components"

export type EmailWrapperProps = ContainerProps & {
  to: string
  preview?: string
}

/**
 * Brand-neutral transactional shell.
 *
 * SESSION_0492 (wrapper consolidation): every BBL / member-facing / system email
 * moved to `bbl-wrapper.tsx` (`BblEmailWrapper`). This generic shell is now used
 * ONLY by the TuffBuffs merch emails (`merch-order-confirmation`,
 * `merch-shipment-notification`) — a SEPARATE product. It must therefore carry NO
 * Black Belt Legacy branding: no BBL logo, no BBL asset base, no BBL name in the
 * footer. The templates that use it (TuffBuffs) supply their own wordmark in the
 * body copy. Keeping it minimal and brand-neutral avoids misbranding TuffBuffs as
 * BBL (the prior FI-011 fix had baked the BBL white mark into this shell).
 */
export const EmailWrapper = ({ to, preview, children, ...props }: EmailWrapperProps) => {
  return (
    <Html>
      <Head>
        {/* Light-scheme email — tell iOS Mail / Apple Mail not to invert our colors. */}
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      {preview && <Preview>{preview}</Preview>}

      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="mx-auto my-auto bg-background font-sans">
          <Container className="mx-auto w-full max-w-[560px] px-8 py-8" {...props}>
            {children}

            <Hr />

            <Text className="text-xs/normal text-gray-500">
              This email was intended for <span className="text-black">{to}</span>. If you were not
              expecting this email, you can ignore it. If you are concerned about your
              account&apos;s safety, please reply to this email to get in touch with us.
            </Text>

            <Text className="text-xs/normal text-gray-500">
              Any questions? Just reply to this email — we&apos;re happy to help.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
