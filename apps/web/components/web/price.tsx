"use client"

import NumberFlow, { continuous, type Format } from "@number-flow/react"
import { formatNumber } from "@primoui/utils"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { useLocale, useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import type Stripe from "stripe"
import { Badge } from "~/components/common/badge"
import { cx } from "~/lib/utils"

const defaultFormat: Format = {
  style: "currency",
  currency: "USD",
  notation: "standard",
  maximumFractionDigits: 2,
  trailingZeroDisplay: "stripIfInteger",
}

type PriceProps = ComponentProps<"div"> & {
  price: number
  fullPrice?: number | null
  interval?: string
  discount?: number | null
  coupon?: Stripe.Coupon
  format?: Format
  priceClassName?: string
}

export const Price = ({
  className,
  price,
  fullPrice,
  interval,
  discount,
  coupon,
  format,
  priceClassName,
  ...props
}: PriceProps) => {
  const locale = useLocale()
  const t = useTranslations("components.price")
  const MotionBadge = motion.create(Badge)
  const maxRedemptions = coupon?.max_redemptions || 0
  const timesRedeemed = coupon?.times_redeemed || 0

  const animationVariants: Variants = {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <div className={cx("relative flex items-center", className)} {...props}>
      {format?.notation === "compact" && <span className="self-start mr-1 text-[0.9em]">$</span>}

      <div className="relative tabular-nums font-display">
        <NumberFlow
          value={price}
          format={{ ...defaultFormat, ...format }}
          locales={locale}
          className={cx(
            "flex items-center pr-1.5 -tracking-wide font-semibold [--number-flow-char-height:0.75em] h-[0.75em]",
            priceClassName,
          )}
          plugins={[continuous]}
        />

        <AnimatePresence>
          {!!fullPrice && fullPrice > price && (
            <motion.div
              className="absolute -top-[1.25em] left-full text-sm"
              variants={animationVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <span className="text-muted-foreground">
                {formatNumber(fullPrice, "standard", locale)}
              </span>

              <span className="absolute -inset-x-0.5 top-1/2 h-[0.1em] -rotate-10 bg-red-500/50" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {price > 0 && interval && (
        <div className="self-end text-muted-foreground text-[0.9em] leading-none">/{interval}</div>
      )}

      <AnimatePresence>
        {!!discount && (
          <MotionBadge
            variant="success"
            className="absolute -top-3.5 right-0"
            variants={animationVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {t("off", { discount })}
            {!!maxRedemptions && (
              <span className="text-foreground/65">
                ({maxRedemptions - timesRedeemed}
                {maxRedemptions > maxRedemptions - timesRedeemed && `/${maxRedemptions}`}{" "}
                {t("left")})
              </span>
            )}
          </MotionBadge>
        )}
      </AnimatePresence>
    </div>
  )
}
