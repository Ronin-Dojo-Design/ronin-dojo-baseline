"use client"

import { CopyIcon, DownloadIcon, QrCodeIcon } from "lucide-react"
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react"
import { type Ref, useRef, useState } from "react"
import { toast } from "sonner"
import { Button, type ButtonProps } from "~/components/common/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/common/dialog"
import { Input } from "~/components/common/input"
import { Stack } from "~/components/common/stack"

type QrShareButtonProps = {
  url: string
  title: string
  description?: string
  fileName?: string
  triggerLabel?: string
  triggerVariant?: ButtonProps["variant"]
  triggerSize?: ButtonProps["size"]
}

type QrSharePanelProps = {
  url: string
  title: string
  canvasRef?: Ref<HTMLCanvasElement>
}

function fallbackCopy(value: string) {
  const textarea = document.createElement("textarea")
  textarea.value = value
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.left = "-9999px"
  document.body.appendChild(textarea)
  textarea.select()

  try {
    return document.execCommand("copy")
  } finally {
    document.body.removeChild(textarea)
  }
}

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      return fallbackCopy(value)
    }
  }

  return fallbackCopy(value)
}

function normalizedPngName(value: string) {
  const clean = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${clean || "qr-code"}.png`
}

export function QrShareButton({
  url,
  title,
  description,
  fileName,
  triggerLabel = "QR code",
  triggerVariant = "secondary",
  triggerSize = "sm",
}: QrShareButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const downloadName = normalizedPngName(fileName ?? title)

  async function handleCopy() {
    const copied = await copyToClipboard(url)
    if (copied) {
      toast.success("Link copied.")
    } else {
      toast.error("Copy failed.")
    }
  }

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) {
      toast.error("QR code is not ready.")
      return
    }

    setIsDownloading(true)
    canvas.toBlob(blob => {
      setIsDownloading(false)
      if (!blob) {
        toast.error("QR download failed.")
        return
      }

      const href = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = href
      link.download = downloadName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(href)
    }, "image/png")
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button type="button" variant={triggerVariant} size={triggerSize} prefix={<QrCodeIcon />}>
            {triggerLabel}
          </Button>
        }
      />

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <QrSharePanel url={url} title={title} canvasRef={canvasRef} />

        <DialogFooter>
          <Button type="button" variant="secondary" prefix={<CopyIcon />} onClick={handleCopy}>
            Copy link
          </Button>
          <Button
            type="button"
            variant="primary"
            prefix={<DownloadIcon />}
            onClick={handleDownload}
            isPending={isDownloading}
          >
            PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function QrSharePanel({ url, title, canvasRef }: QrSharePanelProps) {
  return (
    <Stack direction="column" size="md" className="items-center" data-qr-value={url}>
      <div className="rounded-md border bg-white p-3 shadow-sm">
        <QRCodeSVG
          value={url}
          size={220}
          level="H"
          marginSize={4}
          title={title}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>

      <QRCodeCanvas
        ref={canvasRef}
        value={url}
        size={512}
        level="H"
        marginSize={4}
        className="sr-only"
      />

      <Input readOnly value={url} aria-label="QR code URL" className="font-mono text-xs" />
    </Stack>
  )
}
