import { PostForm } from "~/app/app/posts/_components/post-form"
import { Wrapper } from "~/components/common/wrapper"
import { findToolList } from "~/server/admin/tools/queries"

export default () => {
  return (
    <Wrapper size="md" gap="sm">
      <PostForm title="Create post" toolsPromise={findToolList()} />
    </Wrapper>
  )
}
