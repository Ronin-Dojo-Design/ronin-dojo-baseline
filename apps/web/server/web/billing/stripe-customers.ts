import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

export const STRIPE_CUSTOMER_ACCOUNT_SCOPE = "platform"

export const findStripeCustomerForCheckout = async ({
  userId,
  brand,
}: {
  userId: string
  brand: Brand
}) => {
  return db.stripeCustomer.findUnique({
    where: {
      userId_brand_accountScope: {
        userId,
        brand,
        accountScope: STRIPE_CUSTOMER_ACCOUNT_SCOPE,
      },
    },
  })
}

export const upsertStripeCustomerMapping = async ({
  userId,
  brand,
  stripeCustomerId,
}: {
  userId: string
  brand: Brand
  stripeCustomerId: string
}) => {
  const existingForUser = await db.stripeCustomer.findUnique({
    where: {
      userId_brand_accountScope: {
        userId,
        brand,
        accountScope: STRIPE_CUSTOMER_ACCOUNT_SCOPE,
      },
    },
  })

  if (existingForUser) {
    if (existingForUser.stripeCustomerId === stripeCustomerId) {
      return existingForUser
    }

    return db.stripeCustomer.update({
      where: { id: existingForUser.id },
      data: { stripeCustomerId },
    })
  }

  return db.stripeCustomer.upsert({
    where: { stripeCustomerId },
    update: {
      userId,
      brand,
      accountScope: STRIPE_CUSTOMER_ACCOUNT_SCOPE,
    },
    create: {
      userId,
      brand,
      stripeCustomerId,
      accountScope: STRIPE_CUSTOMER_ACCOUNT_SCOPE,
    },
  })
}
