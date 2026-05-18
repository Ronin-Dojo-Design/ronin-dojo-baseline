import { db } from "~/services/db"

export const findIssuancesByTemplate = async (certificateTemplateId: string) => {
  return db.certificateIssuance.findMany({
    where: { certificateTemplateId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      certification: { select: { id: true, type: true, status: true } },
      order: { select: { id: true, paymentStatus: true } },
    },
    orderBy: { issuedAt: "desc" },
  })
}

export const findIssuanceByQrCode = async (qrVerificationCode: string) => {
  return db.certificateIssuance.findUnique({
    where: { qrVerificationCode },
    include: {
      certificateTemplate: {
        select: { id: true, name: true, description: true },
      },
      user: { select: { id: true, name: true } },
      certification: { select: { id: true, type: true, status: true } },
    },
  })
}
