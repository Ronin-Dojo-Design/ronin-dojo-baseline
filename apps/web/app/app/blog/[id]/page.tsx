import { notFound } from "next/navigation"
import { PostForm } from "~/app/app/blog/_components/post-form"
import { Wrapper } from "~/components/common/wrapper"
import { findPostById } from "~/server/admin/posts/queries"
import { findToolList } from "~/server/admin/tools/queries"

export default async ({ params }: PageProps<"/app/blog/[id]">) => {
  const { id } = await params
  const post = await findPostById(id)

  if (!post) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <PostForm title={`Edit ${post.title}`} post={post} toolsPromise={findToolList()} />
    </Wrapper>
  )
}
