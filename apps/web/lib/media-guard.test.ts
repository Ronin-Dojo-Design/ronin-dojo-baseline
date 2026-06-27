// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import { sniffUploadBuffer } from "~/lib/media-guard"

// Real JPEG magic bytes (FF D8 FF E0) — `file-type` sniffs `image/jpeg` from these.
const jpegFile = (type = "image/jpeg") =>
  new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "upload.jpg", { type })

const textFile = (body: string, type: string) => new File([body], "upload", { type })

// Real MP4 `ftyp` box (isom) — `file-type` sniffs `video/mp4` from these bytes.
const mp4File = (type = "video/mp4") =>
  new File(
    [
      new Uint8Array([
        0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02,
        0x00, 0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32, 0x61, 0x76, 0x63, 0x31, 0x6d, 0x70,
        0x34, 0x31,
      ]),
    ],
    "upload.mp4",
    { type },
  )

describe("sniffUploadBuffer", () => {
  it("accepts a real JPEG and reports IMAGE + the sniffed mime (declared type ignored)", async () => {
    const result = await sniffUploadBuffer(jpegFile("application/octet-stream"), {
      maxBytes: 1024 * 1024,
    })
    expect(result.kind).toBe("IMAGE")
    expect(result.mime).toBe("image/jpeg")
  })

  it("rejects an SVG declared as image/svg+xml (stored-XSS guard)", async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    await expect(
      sniffUploadBuffer(textFile(svg, "image/svg+xml"), { maxBytes: 1024 * 1024 }),
    ).rejects.toThrow(/image/i)
  })

  it("rejects an SVG even when the client LIES and declares image/png", async () => {
    const svg = "<svg><script>alert(document.cookie)</script></svg>"
    await expect(
      sniffUploadBuffer(textFile(svg, "image/png"), { maxBytes: 1024 * 1024 }),
    ).rejects.toThrow()
  })

  it("enforces the byte ceiling on the actual buffer, not the client File.size", async () => {
    await expect(sniffUploadBuffer(jpegFile(), { maxBytes: 2 })).rejects.toThrow(/size limit/i)
  })

  it("rejects an empty file", async () => {
    await expect(sniffUploadBuffer(textFile("", "image/png"), { maxBytes: 1024 })).rejects.toThrow(
      /empty/i,
    )
  })

  it("rejects a non-media payload regardless of the declared type", async () => {
    await expect(
      sniffUploadBuffer(textFile("just some text, not an image", "image/png"), { maxBytes: 1024 }),
    ).rejects.toThrow()
  })

  it("rejects a real video when allowVideo is omitted (default-closed)", async () => {
    await expect(sniffUploadBuffer(mp4File(), { maxBytes: 1024 * 1024 })).rejects.toThrow(
      /valid image/i,
    )
  })

  it("accepts a real video only when allowVideo is opted in", async () => {
    const result = await sniffUploadBuffer(mp4File(), { maxBytes: 1024 * 1024, allowVideo: true })
    expect(result.kind).toBe("VIDEO")
    expect(result.mime).toBe("video/mp4")
  })
})
