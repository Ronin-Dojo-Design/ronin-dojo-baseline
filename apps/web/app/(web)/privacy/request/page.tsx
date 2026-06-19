import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Prose } from "~/components/common/prose"
import {
  bblHeadingFontClass,
  bblProseHeadingFontClass,
  BrandTypography,
} from "~/components/web/ui/brand-typography"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { DsrForm } from "./_components/dsr-form"

const PAGE_URL = "/privacy/request"
const PAGE_TITLE = "Submit a Data Subject Request"
const PAGE_DESCRIPTION =
  "Request access to, correction of, export of, or deletion of the personal data we hold about you."

const getData = async () =>
  await getPageData(PAGE_URL, PAGE_TITLE, PAGE_DESCRIPTION, {
    breadcrumbs: [
      { url: "/privacy", title: "Privacy Policy" },
      { url: PAGE_URL, title: PAGE_TITLE },
    ],
  })

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function DataSubjectRequestPage() {
  const session = await getServerSession()
  if (!session?.user) {
    redirect(`/auth/login?next=${encodeURIComponent(PAGE_URL)}`)
  }

  const { metadata } = await getData()
  const brand = await getRequestBrand()

  return (
    <BrandTypography brand={brand}>
      <Intro>
        <IntroTitle className={bblHeadingFontClass}>{metadata.title}</IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      <Prose className={bblProseHeadingFontClass}>
        <p>
          You are signed in as <strong>{session.user.email}</strong>. Submissions on this form are
          tied to that account.
        </p>
        <p>
          We acknowledge requests promptly and aim to fulfill them within thirty (30) days. See our{" "}
          <Link href="/privacy">Privacy Policy</Link> for the scope of rights we honor and how we
          handle deletion exceptions required by law (for example, tax-mandated financial records).
        </p>
      </Prose>

      <Note>
        Need general help instead of a formal request? Email us using the contact link in the footer
        — that's faster for most questions.
      </Note>

      <DsrForm />
    </BrandTypography>
  )
}
