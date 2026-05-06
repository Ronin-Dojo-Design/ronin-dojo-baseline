// @ts-expect-error - bun:test is a Bun runtime module
import { describe, expect, it } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { getRegistrationNotice, RegistrationNotice } from "./registration-notice"

describe("registration notice", () => {
  it("shows refunded rejection copy instead of success copy", () => {
    const props = {
      registered: "true",
      existingRegistration: {
        status: "CANCELLED",
        paymentStatus: "REFUNDED",
      },
    }

    const notice = getRegistrationNotice(props)
    const html = renderToStaticMarkup(<RegistrationNotice {...props} />)

    expect(notice?.title).toBe("Registration could not be completed")
    expect(notice?.body).toContain("payment was refunded")
    expect(notice?.body).toContain("no tournament slot was taken")
    expect(html).toContain("Registration could not be completed")
    expect(html).toContain("payment was refunded")
    expect(html).not.toContain("Registration confirmed!")
  })

  it("keeps success copy for a submitted paid registration", () => {
    const props = {
      registered: true,
      existingRegistration: {
        status: "SUBMITTED",
        paymentStatus: "PAID",
      },
    }

    const notice = getRegistrationNotice(props)
    const html = renderToStaticMarkup(<RegistrationNotice {...props} />)

    expect(notice?.title).toBe("Registration confirmed!")
    expect(notice?.body).toBe("You have been successfully registered for this tournament.")
    expect(html).toContain("Registration confirmed!")
  })

  it("shows neutral processing copy when no registration is found yet", () => {
    const notice = getRegistrationNotice({
      registered: "true",
      existingRegistration: null,
    })

    expect(notice?.title).toBe("Registration processing")
    expect(notice?.body).toContain("still confirming")
  })
})
