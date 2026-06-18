import { Link } from "~/components/common/link"
import { ExternalLink } from "~/components/web/external-link"
import { linksConfig } from "~/config/links"

/**
 * The /about body copy. Moved here VERBATIM from the route during the component
 * launch sweep — the brand name is interpolated via `siteName`, everything else
 * is static.
 *
 * ⚠️ CONTENT DEBT (route to the supervised content lane): this is leftover
 * dirstarter boilerplate ("a community driven list of tools and resources for
 * developers", a 15-year "software developer" author block, "Brian Scott"). It is
 * NOT BBL / martial-arts product voice. A token sweep only RELOCATES it; it does
 * not invent brand copy. Replace with product/brand voice in the content lane.
 */
export const AboutBody = ({ siteName }: { siteName: string }) => {
  return (
    <>
      <h2>What is {siteName}?</h2>

      <p>
        <Link href="/">{siteName}</Link> is a community driven list of{" "}
        <strong>tools and resources for developers</strong>. The goal of the site is to be your
        first stop when researching for a new tool or resource to help you grow your business. It
        will help you find alternatives and reviews of the products you already use.
      </p>

      <h2>About the Author</h2>

      <p>
        I'm a software developer and entrepreneur. I've been building web applications for over 15
        years. I'm passionate about software development and I love to contribute to the community
        in any way I can.
      </p>

      <p>
        I'm always looking for new projects to work on and new people to collaborate with. Feel free
        to reach out to me if you have any questions or suggestions.
      </p>

      <p>
        –{" "}
        <ExternalLink href={linksConfig.author} doFollow>
          Brian Scott
        </ExternalLink>
      </p>
    </>
  )
}
