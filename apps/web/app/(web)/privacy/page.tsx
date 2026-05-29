import type { Metadata } from "next"
import { Link } from "~/components/common/link"
import { Prose } from "~/components/common/prose"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { getBrandSiteConfig, siteConfig } from "~/config/site"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"

const PAGE_URL = "/privacy"
const PAGE_TITLE = "Privacy Policy"
const LAST_UPDATED = "2026-05-25"

const getData = async () => {
  const brand = await getRequestBrand()
  const brandConfig = getBrandSiteConfig(brand)
  const description = `How ${brandConfig.name} collects, uses, and safeguards information you provide.`
  return await getPageData(PAGE_URL, PAGE_TITLE, description, {
    breadcrumbs: [{ url: PAGE_URL, title: PAGE_TITLE }],
  })
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function PrivacyPolicyPage() {
  const { metadata } = await getData()
  const brand = await getRequestBrand()
  const { name: siteName } = getBrandSiteConfig(brand)

  return (
    <>
      <Intro>
        <IntroTitle>{metadata.title}</IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      <Prose>
        <p>
          <em>Last updated: {LAST_UPDATED}</em>
        </p>

        <h2>1. Introduction</h2>
        <p>
          {siteName} ("we", "us", or "our") respects your privacy and is committed to handling your
          personal information transparently. This Privacy Policy explains what we collect, how we
          use it, who we share it with, and the rights you have over your data.
        </p>

        <h2>2. Information we collect</h2>
        <h3>2.1 Information you provide</h3>
        <ul>
          <li>Account details when you register (name, email address).</li>
          <li>
            Profile information you choose to add (display name, biography, location, avatar image,
            rank history, lineage and instructor relationships).
          </li>
          <li>
            Membership and registration data for the organizations, schools, and tournaments you
            join.
          </li>
          <li>
            Payment-method tokens and order history when you purchase a subscription, course, or
            merchandise. Card numbers themselves are handled by Stripe and are never stored on our
            servers.
          </li>
          <li>Content you submit (listings, posts, comments, support inquiries).</li>
        </ul>

        <h3>2.2 Information we collect automatically</h3>
        <ul>
          <li>
            Authenticated session activity (login events, session expiry) recorded against your
            account via the Better Auth session cookie described in our{" "}
            <Link href="/cookies">Cookies Policy</Link>.
          </li>
          <li>
            Aggregate page-view statistics collected by Plausible Analytics. Plausible is a
            privacy-focused, cookieless analytics provider that does not set tracking cookies, does
            not collect cross-site identifiers, and anonymizes the source IP address before storing
            any data.
          </li>
          <li>
            Server access logs (timestamps, requested paths, status codes) retained for operational
            troubleshooting and abuse prevention.
          </li>
        </ul>

        <h2>3. How we use information</h2>
        <ul>
          <li>To create and maintain your account, profile, and memberships.</li>
          <li>To process payments, deliver entitlements, and fulfill merchandise orders.</li>
          <li>To verify rank, lineage, and certification claims you submit.</li>
          <li>To communicate operational notices (password resets, receipts, policy updates).</li>
          <li>To detect and prevent fraud, abuse, and security incidents.</li>
          <li>To comply with our legal obligations.</li>
        </ul>

        <h2>4. Sharing and disclosure</h2>
        <p>
          We do not sell your personal information. We share information in only these
          circumstances:
        </p>
        <ul>
          <li>
            <strong>Service providers we rely on</strong> to operate {siteName}: Stripe (payments
            and subscription billing), Plausible Analytics (aggregate traffic measurement), Neon
            (managed PostgreSQL database), Vercel (hosting and edge delivery), and Resend or a
            comparable provider for transactional email. Each provider is bound by its own data
            processing terms.
          </li>
          <li>
            <strong>Publicly displayed profile content</strong> you have chosen to make public on
            your directory profile, school listing, or lineage entry.
          </li>
          <li>
            <strong>Legal compliance</strong> when required by law, regulation, court order, or to
            protect the rights, property, or safety of {siteName}, our users, or the public.
          </li>
          <li>
            <strong>Successor entities</strong> in connection with a merger, acquisition, or sale of
            all or substantially all of our assets, subject to this Privacy Policy.
          </li>
        </ul>

        <h2>5. Cookies and similar technologies</h2>
        <p>
          We currently use only strictly-necessary cookies (Better Auth session cookies and Stripe
          Checkout transit cookies). Full details, lifetimes, and purposes are documented on the{" "}
          <Link href="/cookies">Cookies Policy</Link> page. We do not currently set any analytics or
          marketing cookies; if that changes in the future we will publish a cookie consent notice
          before any non-essential tracker is enabled.
        </p>

        <h2>6. Your rights</h2>
        <p>
          You may request access to, correction of, export of, or deletion of your personal data at
          any time. Use the <Link href="/privacy/request">Data Subject Request</Link> form (you must
          be signed in) to submit a request. We acknowledge requests promptly and aim to fulfill
          them within thirty (30) days. We may verify the request by relying on your authenticated
          session.
        </p>

        <h2>7. Data retention</h2>
        <p>
          We retain personal data for as long as your account is active and for a reasonable period
          afterward to satisfy our legal, accounting, or reporting obligations. When you request
          deletion we remove personal identifiers, with the limited exceptions required to preserve
          audit history (for example: financial transaction records mandated by tax law).
        </p>

        <h2>8. Children</h2>
        <p>
          {siteName} is not directed at children under 13. We do not knowingly collect personal
          information from children under 13. Parents and guardians who believe their child has
          provided information to us should contact us using the form linked below so we can delete
          it.
        </p>

        <h2>9. International transfers</h2>
        <p>
          Our infrastructure is hosted in the United States. By using {siteName} you understand that
          your information will be processed in the United States and other countries where our
          service providers operate, which may have different data protection rules than your
          country of residence.
        </p>

        <h2>10. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be announced on
          the site and the "Last updated" date above will be revised.
        </p>

        <h2>11. Contact</h2>
        <p>
          Questions about this Privacy Policy or our data handling can be sent to{" "}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. For formal data subject
          requests please use the <Link href="/privacy/request">request form</Link>.
        </p>
      </Prose>
    </>
  )
}
