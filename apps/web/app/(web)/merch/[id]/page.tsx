import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { MerchProductDetail } from "~/components/web/tuffbuffs/merch-product-detail"
import { Intro, IntroTitle } from "~/components/web/ui/intro"
import {
  findMerchProductById,
  getMerchMetadata,
} from "~/server/web/merch/queries"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await findMerchProductById(id)
  if (!product) return { title: "Product Not Found" }
  const meta = getMerchMetadata(product)
  return {
    title: product.name,
    description: meta?.description ?? product.name,
  }
}

export default async function MerchProductPage({ params }: Props) {
  const { id } = await params
  const product = await findMerchProductById(id)

  if (!product) {
    notFound()
  }

  const metadata = getMerchMetadata(product)
  if (!metadata) {
    notFound()
  }

  return (
    <Wrapper gap="lg">
      <Intro>
        <Stack size="sm">
          <Link href="/merch" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Merch Store
          </Link>
        </Stack>
        <Stack size="sm">
          <Badge variant="outline">TuffBuffs</Badge>
        </Stack>
        <IntroTitle>{product.name}</IntroTitle>
      </Intro>

      <MerchProductDetail product={product} metadata={metadata} />
    </Wrapper>
  )
}
