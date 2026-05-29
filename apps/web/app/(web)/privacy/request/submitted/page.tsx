import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Link } from "~/components/common/link"
import { Prose } from "~/components/common/prose"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { getServerSession } from "~/lib/auth"
import { getPageData, getPageMetadata } from "~/lib/pages"

const PAGE_URL = "/privacy/request/submitted"
const PAGE_TITLE = "Request received"
const PAGE_DESCRIPTION = "Your data subject request has been queued for review."

const getData = async () =>
  await getPageData(PAGE_URL, PAGE_TITLE, PAGE_DESCRIPTION, {
    breadcrumbs: [
      { url: "/privacy", title: "Privacy Policy" },
      { url: "/privacy/request", title: "Submit a Data Subject Request" },
      { url: PAGE_URL, title: PAGE_TITLE },
    ],
  })

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

type SubmittedPageProps = {
  searchParams: Promise<{ id?: string }>
}

export default async function DataSubjectRequestSubmittedPage({
  searchParams,
}: SubmittedPageProps) {
  const session = await getServerSession()
  if (!session?.user) {
    redirect(`/auth/login?next=${encodeURIComponent(PAGE_URL)}`)
  }

  const { id } = await searchParams
  const { metadata } = await getData()

  return (
    <>
      <Intro>
        <IntroTitle>{metadata.title}</IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      <Prose>
        <p>
          We've recorded your request
          {id ? (
            <>
              {" "}
              (reference <code>{id}</code>)
            </>
          ) : null}
          . Our team will review it and follow up at <strong>{session.user.email}</strong> within
          thirty (30) days.
        </p>
        <p>
          Need to add more context, submit another request, or check our policy? Visit the{" "}
          <Link href="/privacy/request">request form</Link> or the{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </Prose>
    </>
  )
}
