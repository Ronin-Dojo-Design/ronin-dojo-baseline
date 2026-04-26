import { useClipboard } from "@mantine/hooks"
import { CheckIcon, ClipboardIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import type { Dispatch, SetStateAction } from "react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { Input } from "~/components/common/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { TextArea } from "~/components/common/textarea"
import { siteConfig } from "~/config/site"
import { cx } from "~/lib/utils"
import type { ToolOne } from "~/server/web/tools/payloads"

const THEMES = ["light", "dark"] as const

type Theme = (typeof THEMES)[number]

type EmbedForm = {
  theme: Theme
  width: number
  height: number
}

type ToolEmbedDialogProps = {
  tool: ToolOne
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export const ToolEmbedDialog = ({ tool, isOpen, setIsOpen }: ToolEmbedDialogProps) => {
  const { resolvedTheme } = useTheme()
  const clipboard = useClipboard({ timeout: 2000 })
  const t = useTranslations("dialogs.embed")
  const tCommon = useTranslations("common")

  const form = useForm<EmbedForm>({
    defaultValues: { theme: resolvedTheme as Theme, width: 200, height: 50 },
    mode: "onChange",
  })

  const [theme, width, height] = form.watch(["theme", "width", "height"])

  const toolLink = useMemo(() => `${siteConfig.url}/${tool.slug}`, [tool.slug])

  const badgeUrl = useMemo(() => {
    const params = new URLSearchParams({ theme, width: String(width), height: String(height) })
    return `${toolLink}/badge.svg?${params.toString()}`
  }, [theme, width, height, toolLink])

  const utm = new URLSearchParams({
    utm_source: siteConfig.slug,
    utm_medium: "badge",
    utm_campaign: "embed",
    utm_content: `tool-${tool.slug}`,
  })

  const embedCode = useMemo(
    () =>
      `<a href="${toolLink}?${utm.toString()}" target="_blank"><img src="${badgeUrl}" width="${width}" height="${height}" alt="${tool.name} badge" loading="lazy" /></a>`,
    [badgeUrl, width, height, tool.name, toolLink, utm],
  )

  const previewBg = theme === "dark" ? "bg-black" : "bg-white"

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title", { toolName: tool.name })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="grid w-full gap-x-3 gap-y-5 sm:grid-cols-3"
            autoComplete="off"
            onSubmit={e => e.preventDefault()}
          >
            <FormField
              control={form.control}
              name="theme"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>{t("theme_label")}</FormLabel>
                  <FormControl>
                    <Select value={value} onValueChange={onChange} {...field}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {THEMES.map(theme => (
                          <SelectItem key={theme} value={theme}>
                            {tCommon(`themes.${theme}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("width_label")}</FormLabel>
                  <FormControl>
                    <Input type="number" min={100} max={600} step={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("height_label")}</FormLabel>
                  <FormControl>
                    <Input type="number" min={30} max={200} step={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-full">
              <div className="text-xs mb-1 text-foreground/60">{t("preview_label")}</div>
              <Card
                className={cx(
                  "flex items-center justify-center min-h-20 bg-background overflow-clip",
                  previewBg,
                )}
                hover={false}
              >
                <img
                  src={badgeUrl}
                  width={width}
                  height={height}
                  alt={`${tool.name} badge preview`}
                  className="block"
                  draggable={false}
                />
              </Card>
            </div>

            <div className="col-span-full">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-xs text-foreground/60">{t("code_label")}</div>

                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => clipboard.copy(embedCode)}
                  prefix={clipboard.copied ? <CheckIcon /> : <ClipboardIcon />}
                  className={cx(clipboard.copied && "text-green-600")}
                >
                  {clipboard.copied ? t("copied") : t("copy_button")}
                </Button>
              </div>

              <TextArea
                value={embedCode}
                readOnly
                className="block font-mono text-xs cursor-pointer"
                onFocus={e => e.target.select()}
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
