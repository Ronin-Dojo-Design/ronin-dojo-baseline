import {
  Body,
  Button,
  type ButtonProps,
  Container,
  type ContainerProps,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  pixelBasedPreset,
  Tailwind,
  Text,
} from "@react-email/components"
import { Brand } from "~/.generated/prisma/client"
import { getBrandSiteConfig } from "~/config/site"

/**
 * Black Belt Legacy branded email shell (SESSION_0403).
 *
 * Matches the BBL landing language: a cinematic near-black header with the
 * white BBL mark, a brand-red accent rule, a clean light body for
 * deliverability/readability, and the "Honor the Lineage" footer voice.
 *
 * Web fonts don't load in most mail clients, so headings lean on weight +
 * uppercase + tracking (a Poppins-evoking treatment) over a real font load.
 * The logo is an absolute URL (relative paths don't render in mail clients).
 */

const bbl = getBrandSiteConfig(Brand.BBL)
// Brand-canonical asset base — hardcoded to the live BBL domain so the logo + links
// resolve in mail clients regardless of the deploy/dev NEXT_PUBLIC_SITE_URL (which is
// localhost in dev, breaking the email logo). Single-brand BBL.
const ASSET_BASE = "https://blackbeltlegacy.com"
const LOGO_WHITE = `${ASSET_BASE}/brand/blackbeltlegacy/bbl-logo-white.png`

export type BblEmailWrapperProps = ContainerProps & {
  to: string
  preview?: string
  /**
   * Overrides the "This email was intended for …" footer text. Use when the
   * displayed intended recipient differs from the delivery address (e.g. the
   * founder letter, addressed to both of Bob's known inboxes). Defaults to `to`.
   */
  intendedFor?: string
}

export const BblEmailWrapper = ({
  to,
  preview,
  intendedFor,
  children,
  ...props
}: BblEmailWrapperProps) => {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}

      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="m-0 bg-neutral-100 py-8 font-sans text-neutral-800">
          <Container
            className="mx-auto w-full max-w-[600px] overflow-hidden rounded-2xl border border-solid border-neutral-200 bg-white"
            {...props}
          >
            {/* Cinematic header band */}
            <Section className="bg-neutral-950 px-8 py-8 text-center">
              <Link href={ASSET_BASE} className="inline-block">
                <Img
                  src={LOGO_WHITE}
                  alt="Black Belt Legacy"
                  width="112"
                  height="64"
                  className="mx-auto h-16 w-auto"
                />
              </Link>
            </Section>
            {/* Brand-red accent rule */}
            <Section className="h-[3px] bg-red-600 leading-[3px]">&nbsp;</Section>

            <Section className="px-8 py-7 text-[15px] leading-relaxed text-neutral-800">
              {children}
            </Section>

            <Section className="px-8 pb-8">
              <Hr className="my-0 border-neutral-200" />
              <Text className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-red-700">
                {bbl.tagline}
              </Text>
              <Text className="my-1 text-xs/normal text-neutral-500">
                This email was intended for{" "}
                <span className="text-neutral-800">{intendedFor ?? to}</span>. If you weren&apos;t
                expecting it, you can safely ignore it.
              </Text>
              <Text className="my-1 text-xs/normal text-neutral-500">
                Questions? Reply to this email or reach us at {bbl.email}.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

/** Brand heading — Poppins-evoking (weight + uppercase + tracking) for mail clients. */
export const BblEmailHeading = ({ children }: { children: React.ReactNode }) => (
  <Heading
    as="h1"
    className="mb-4 mt-0 text-[22px] font-extrabold uppercase italic tracking-tight text-neutral-950"
  >
    {children}
  </Heading>
)

/** Brand-red call-to-action button. */
export const BblEmailButton = ({ className, ...props }: ButtonProps) => (
  <Button
    className={`my-5 rounded-md bg-red-600 px-6 py-3 text-center text-sm font-bold text-white no-underline ${className ?? ""}`}
    {...props}
  />
)
