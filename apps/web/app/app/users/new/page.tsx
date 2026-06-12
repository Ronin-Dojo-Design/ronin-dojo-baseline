import { PersonForm } from "~/app/admin/users/_components/person-form"
import { Wrapper } from "~/components/common/wrapper"
import { findAddPersonOptions } from "~/server/admin/users/queries"

export default () => {
  return (
    <Wrapper size="md" gap="sm">
      <PersonForm title="Add person" optionsPromise={findAddPersonOptions()} />
    </Wrapper>
  )
}
