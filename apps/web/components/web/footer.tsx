"use client"

import { formatNumber } from "@dirstack/utils"
import { AtSignIcon, RssIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { H5, H6 } from "~/components/common/heading"
import { BrandGitHubIcon } from "~/components/common/icons/brand-github"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import { BuiltWith } from "~/components/web/built-with"
import { CTAForm } from "~/components/web/cta-form"
import { ExternalLink } from "~/components/web/external-link"
import { ThemeSwitcher } from "~/components/web/theme-switcher"
import { NavLink, navLinkVariants } from "~/components/web/ui/nav-link"
import { type BrandFeature, brandHasFeature, brandHasMinimalChrome } from "~/config/brand-features"
import { linksConfig } from "~/config/links"
import { siteConfig } from "~/config/site"
import { useBrand } from "~/contexts/brand-context"
import { cx } from "~/lib/utils"

type FooterProps = ComponentProps<"div"> & {
  hideCTA?: boolean
}

export const Footer = ({ children, className, hideCTA, ...props }: FooterProps) => {
  const t = useTranslations()
  const { brand } = useBrand()
  const has = (feature: BrandFeature) => brandHasFeature(brand, feature)
  // Minimal chrome: no Browse column — primary nav lives in the slide-in.
  const minimal = brandHasMinimalChrome(brand)

  return (
    <footer className="flex flex-col gap-y-8 mt-auto pt-fluid-md border-t border-foreground/10">
      <div
        className={cx("grid grid-cols-3 gap-y-8 gap-x-4 md:gap-x-6 md:grid-cols-16", className)}
        {...props}
      >
        <Stack
          direction="column"
          className="flex flex-col items-start gap-4 col-span-full md:col-span-6"
        >
          <Stack size="lg" direction="column" className="min-w-0 max-w-64">
            <H5 render={props => <strong {...props}>{props.children}</strong>} className="px-0.5">
              {t("components.footer.cta_title")}
            </H5>

            <Note className="-mt-2 px-0.5 first:mt-0">
              {t(
                minimal
                  ? "components.footer.cta_description_minimal"
                  : "components.footer.cta_description",
                { count: formatNumber(5000, "standard") },
              )}
            </Note>

            <CTAForm />
          </Stack>

          <Stack className="text-lg opacity-75">
            <Tooltip>
              <TooltipTrigger render={<ThemeSwitcher />} />
              <TooltipContent>{t("navigation.toggle_theme")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <ExternalLink href={linksConfig.feed} className={navLinkVariants().base()}>
                    <RssIcon />
                  </ExternalLink>
                }
              />
              <TooltipContent>{t("navigation.rss_feed")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <ExternalLink
                    href={`mailto:${siteConfig.email}`}
                    className={navLinkVariants().base()}
                  >
                    <AtSignIcon />
                  </ExternalLink>
                }
              />
              <TooltipContent>{t("navigation.contact_us")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <ExternalLink href={linksConfig.github} className={navLinkVariants().base()}>
                    <BrandGitHubIcon />
                  </ExternalLink>
                }
              />
              <TooltipContent>{t("navigation.source_code")}</TooltipContent>
            </Tooltip>
          </Stack>
        </Stack>

        {!minimal && (
          <Stack direction="column" className="text-sm md:col-span-3 md:col-start-8">
            <H6 render={props => <strong {...props}>{props.children}</strong>}>
              {t("navigation.browse")}:
            </H6>

            {has("programs") && <NavLink href="/programs">{t("navigation.programs")}</NavLink>}
            {has("tournaments") && (
              <NavLink href="/tournaments">{t("navigation.tournaments")}</NavLink>
            )}
            {has("disciplines") && (
              <NavLink href="/disciplines">{t("navigation.disciplines")}</NavLink>
            )}
            {has("schools") && <NavLink href="/schools">{t("navigation.schools")}</NavLink>}
            {has("organizations") && (
              <NavLink href="/organizations">{t("navigation.organizations")}</NavLink>
            )}
            {has("courses") && <NavLink href="/courses">{t("navigation.courses")}</NavLink>}
            {has("techniques") && (
              <NavLink href="/techniques">{t("navigation.techniques")}</NavLink>
            )}
            {has("lineage") && <NavLink href="/lineage">{t("navigation.lineage")}</NavLink>}
            {has("directory") && <NavLink href="/directory">{t("navigation.directory")}</NavLink>}
            {has("members") && <NavLink href="/members">{t("navigation.members")}</NavLink>}
            {has("gear") && <NavLink href="/gear">{t("navigation.gear")}</NavLink>}
            {has("merch") && <NavLink href="/merch">{t("navigation.merch")}</NavLink>}
          </Stack>
        )}

        <Stack
          direction="column"
          className={cx("text-sm md:col-span-3", minimal && "md:col-start-8")}
        >
          <H6 render={props => <strong {...props}>{props.children}</strong>}>
            {t("navigation.quick_links")}:
          </H6>

          {has("posts") && <NavLink href="/posts">{t("navigation.posts")}</NavLink>}
          {has("blog") && <NavLink href="/blog">{t("navigation.blog")}</NavLink>}
          <NavLink href="/about">{t("navigation.about")}</NavLink>
          <NavLink href="/privacy">{t("navigation.privacy")}</NavLink>
          <NavLink href="/terms">{t("navigation.terms")}</NavLink>
          <NavLink href="/cookies">{t("navigation.cookies")}</NavLink>
        </Stack>
      </div>

      <BuiltWith medium="footer" className="self-start" />

      {children}
    </footer>
  )
}
