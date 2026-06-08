// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { QrSharePanel } from "~/components/common/qr-share-button"

describe("QrSharePanel", () => {
  it("renders a high-correction QR panel with the supplied URL value", () => {
    const url = "https://baseline.test/invite/session-0347"
    const html = renderToStaticMarkup(<QrSharePanel url={url} title="Invite QR Code" />)

    expect(html).toContain('data-qr-value="https://baseline.test/invite/session-0347"')
    expect(html).toContain('value="https://baseline.test/invite/session-0347"')
    expect(html).toContain("<svg")
    expect(html).toContain("<canvas")
    expect(html).toContain("Invite QR Code")
  })
})
