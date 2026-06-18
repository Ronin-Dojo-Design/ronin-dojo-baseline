import type { Metadata } from "next"
import { Link } from "~/components/common/link"
import { PolicyLayout } from "~/components/web/ui/policy-layout"
import { getBrandSiteConfig, siteConfig } from "~/config/site"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"

const PAGE_URL = "/cookies"
const PAGE_TITLE = "Cookies Policy"
const LAST_UPDATED = "2026-05-25"

const getData = async () => {
  const brand = await getRequestBrand()
  const brandConfig = getBrandSiteConfig(brand)
  const description = `What cookies ${brandConfig.name} sets, why, and how long they last.`
  return await getPageData(PAGE_URL, PAGE_TITLE, description, {
    breadcrumbs: [{ url: PAGE_URL, title: PAGE_TITLE }],
  })
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function CookiesPolicyPage() {
  const { metadata } = await getData()
  const brand = await getRequestBrand()
  const { name: siteName } = getBrandSiteConfig(brand)

  return (
    <PolicyLayout brand={brand} title={metadata.title} description={metadata.description}>
      <p>
        <em>Last updated: {LAST_UPDATED}</em>
      </p>

      <h2>1. What cookies are</h2>
      <p>
        Cookies are small text files stored on your device by your browser. They let a site remember
        things across requests — for example, that you are logged in, or that you have a checkout in
        progress.
      </p>

      <h2>2. What we use today</h2>
      <p>
        {siteName} currently sets <strong>only strictly-necessary cookies</strong>. We do not use
        analytics, advertising, retargeting, or social-network cookies. Because everything below is
        strictly necessary to deliver functionality you have explicitly requested (logging in,
        paying), no consent banner is shown.
      </p>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Lifetime</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>better-auth.session_token</code>
            </td>
            <td>{siteName} (Better Auth)</td>
            <td>Holds your signed authentication session. Without it you cannot stay logged in.</td>
            <td>~24 hours, refreshed on activity</td>
            <td>Strictly necessary</td>
          </tr>
          <tr>
            <td>
              Stripe Checkout cookies (e.g. <code>__stripe_mid</code>, <code>__stripe_sid</code>)
            </td>
            <td>Stripe</td>
            <td>
              Set only on the Stripe-hosted Checkout page when you start a purchase. Required for
              Stripe fraud prevention and to complete the transaction.
            </td>
            <td>Session to ~1 year (see Stripe docs)</td>
            <td>Strictly necessary</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Analytics: Plausible</h2>
      <p>
        We use{" "}
        <a href="https://plausible.io/data-policy" rel="noopener noreferrer" target="_blank">
          Plausible Analytics
        </a>{" "}
        for aggregate page-view measurement. Plausible is intentionally cookieless. It does not set
        any first- or third-party cookies, does not store cross-site identifiers, and anonymizes IP
        addresses before any data is recorded. Because no personal data is collected, no consent is
        required and no entry appears in the table above.
      </p>

      <h2>4. Payments: Stripe</h2>
      <p>
        When you visit a payment page hosted by Stripe Checkout, Stripe sets its own
        strictly-necessary cookies to operate that page (fraud prevention, session continuity, and
        load distribution). Those cookies are governed by Stripe's{" "}
        <a href="https://stripe.com/privacy" rel="noopener noreferrer" target="_blank">
          privacy policy
        </a>
        .
      </p>

      <h2>5. If we add non-essential cookies later</h2>
      <p>
        If we ever introduce a non-essential cookie (for example a marketing pixel, A/B-testing
        identifier, or a third-party analytics tracker that sets cookies), we will publish a cookie
        consent notice before it is set and you will be able to accept or decline before it loads.
      </p>

      <h2>6. Browser controls</h2>
      <p>
        You can clear or block cookies through your browser settings. Blocking the strictly
        necessary cookies above will break login and checkout. Browser-level settings always take
        precedence over anything we configure.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about this Cookies Policy can be sent to{" "}
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. See also our{" "}
        <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms of Service</Link>.
      </p>
    </PolicyLayout>
  )
}
