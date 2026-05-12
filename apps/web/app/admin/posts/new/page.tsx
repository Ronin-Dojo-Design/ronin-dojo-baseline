import { PostForm } from "~/app/admin/posts/_components/post-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findToolList } from "~/server/admin/tools/queries"

export default withAdminPage(() => {
  return (
    <Wrapper size="md" gap="sm">
      <PostForm title="Create post" toolsPromise={findToolList()} />
    </Wrapper>
  )
})
