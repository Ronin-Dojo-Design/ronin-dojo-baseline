"use client"

import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { NavLink } from "~/components/web/ui/nav-link"

type ThemeSwitcherProps = { className?: string }

export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const t = useTranslations("common")
  const { themes, theme, setTheme, resolvedTheme, forcedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || forcedTheme) return null

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "light":
        return <SunIcon />
      case "dark":
        return <MoonIcon />
      default:
        return <LaptopIcon />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<NavLink className={className} />}>
        {getThemeIcon(resolvedTheme ?? "system")}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        {themes.map(k => (
          <NavLink
            key={k}
            isActive={theme === k}
            isPadded={false}
            prefix={getThemeIcon(k)}
            render={<DropdownMenuItem onClick={() => setTheme(k)} />}
          >
            {t(`themes.${k}`)}
          </NavLink>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
