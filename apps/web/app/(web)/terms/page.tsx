import type { Metadata } from "next"
import { Link } from "~/components/common/link"
import { PolicyLayout } from "~/components/web/ui/policy-layout"
import { getBrandSiteConfig, siteConfig } from "~/config/site"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"

const PAGE_URL = "/terms"
const PAGE_TITLE = "Terms of Service"
const LAST_UPDATED = "2026-05-25"

const getData = async () => {
  const brand = await getRequestBrand()
  const brandConfig = getBrandSiteConfig(brand)
  const description = `The rules and conditions that govern use of ${brandConfig.name}.`
  return await getPageData(PAGE_URL, PAGE_TITLE, description, {
    breadcrumbs: [{ url: PAGE_URL, title: PAGE_TITLE }],
  })
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function TermsOfServicePage() {
  const { metadata } = await getData()
  const brand = await getRequestBrand()
  const { name: siteName } = getBrandSiteConfig(brand)

  return (
    <PolicyLayout brand={brand} title={metadata.title} description={metadata.description}>
      <p>
        <em>Last updated: {LAST_UPDATED}</em>
      </p>

      <h2>1. Agreement</h2>
      <p>
        By creating an account, accessing, or using {siteName} (the "Service") you agree to be bound
        by these Terms of Service ("Terms"). If you do not agree, do not use the Service.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 13 years old to use the Service. If you are using the Service on behalf
        of an organization, school, or minor athlete, you represent that you have the authority to
        bind that party to these Terms.
      </p>

      <h2>3. Accounts and security</h2>
      <ul>
        <li>You are responsible for the accuracy of the information you provide.</li>
        <li>You are responsible for keeping your credentials secret and your session secure.</li>
        <li>
          You must notify us immediately at{" "}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> if you suspect unauthorized
          account access.
        </li>
        <li>We may suspend or terminate accounts that violate these Terms.</li>
      </ul>

      <h2>4. User content</h2>
      <p>
        You retain ownership of the content you submit. By submitting content you grant {siteName}
        a worldwide, non-exclusive, royalty-free license to host, store, reproduce, modify (for
        example to generate thumbnails), publicly display, and distribute that content for the
        purpose of operating and promoting the Service. You represent that you have the rights
        necessary to grant this license.
      </p>

      <h2>5. Prohibited conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Submit false rank, lineage, instructor, or certification claims.</li>
        <li>Use the Service to harass, threaten, or harm any person.</li>
        <li>Scrape, mirror, or otherwise extract content beyond what our public APIs permit.</li>
        <li>Interfere with the Service, circumvent rate limits, or attempt unauthorized access.</li>
        <li>Reverse engineer or attempt to derive source code or secrets from the Service.</li>
      </ul>

      <h2>6. Subscriptions, courses, and merchandise</h2>
      <p>
        Paid features are billed through Stripe. Subscription terms (recurring cadence, trial
        period, refund window) are disclosed at checkout. Course access and digital entitlements
        remain active for the duration described on the purchase page. Physical merchandise is
        subject to our fulfillment partner's shipping and returns policies, which are linked from
        each product page.
      </p>

      <h2>7. Lineage, rank, and certification disclaimers</h2>
      <p>
        {siteName} provides community-submitted information about lineage relationships, rank
        awards, certifications, and tournament results. We do not independently verify every
        submission. Information is provided "as is" and should not be relied upon as the sole
        authority for credentialing, licensure, or competitive eligibility decisions.
      </p>

      <h2>8. Third-party services</h2>
      <p>
        The Service integrates with third parties including Stripe (payments), Plausible Analytics
        (traffic measurement), and external content providers. Your use of those services is
        governed by their own terms and privacy policies.
      </p>

      <h2>9. Termination</h2>
      <p>
        You may close your account at any time. We may suspend or terminate your access at any time
        for violation of these Terms or for any other reason. Sections that by their nature should
        survive termination (intellectual property, disclaimers, limitation of liability, governing
        law) will survive.
      </p>

      <h2>10. Warranty disclaimer</h2>
      <p>
        THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY
        KIND, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, {siteName.toUpperCase()} SHALL NOT BE LIABLE FOR ANY
        INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
        DATA, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may revise these Terms from time to time. Material changes will be announced on the site;
        continued use after a revision is effective constitutes acceptance.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. See also our{" "}
        <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookies">Cookies Policy</Link>.
      </p>
    </PolicyLayout>
  )
}
