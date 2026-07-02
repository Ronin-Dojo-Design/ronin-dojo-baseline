import {
  Body,
  Container,
  type ContainerProps,
  Head,
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
import { siteConfig } from "~/config/site"

export type EmailWrapperProps = ContainerProps & {
  to: string
  preview?: string
}

// FI-011: brand-canonical asset base + the WHITE BBL mark, matching `bbl-wrapper.tsx`.
// The generic wrapper previously pointed at `${siteConfig.url}/logo.png` — the generic
// Dirstarter mark (and a localhost URL in dev), which rendered wrong/broken on the white
// body. Absolute URL (relative paths don't resolve in mail clients).
const BBL_ASSET_BASE = "https://blackbeltlegacy.com"
const BBL_LOGO_WHITE = `${BBL_ASSET_BASE}/brand/blackbeltlegacy/bbl-logo-white.png`

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
          <Container className="w-full max-w-[560px] mx-auto px-8 pb-4" {...props}>
            {/* Dark header band so the WHITE BBL mark reads (FI-011). Inline bg survives
                clients that drop class-based backgrounds. */}
            <Section
              className="-mx-8 mb-4 bg-neutral-950 px-8 py-6 text-center"
              style={{ backgroundColor: "#0a0a0a" }}
            >
              <Link href={BBL_ASSET_BASE} className="inline-block">
                <Img
                  src={BBL_LOGO_WHITE}
                  alt="Black Belt Legacy"
                  width="112"
                  height="64"
                  className="mx-auto h-12 w-auto"
                />
              </Link>
            </Section>

            {children}

            <Hr />

            <Text className="text-xs/normal text-gray-500">
              This email was intended for <span className="text-black">{to}</span>. If you were not
              expecting this email, you can ignore it. If you are concerned about your accounts
              safety, please reply to this email to get in touch with us.
            </Text>

            <Text className="text-xs/normal text-gray-500">
              Any questions? Please feel free to reach us at {siteConfig.email}.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
