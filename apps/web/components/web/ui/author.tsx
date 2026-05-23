import type { ComponentProps, ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { H6 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { ExternalLink } from "~/components/web/external-link"

export type AuthorProps = ComponentProps<typeof Stack> & {
  name: string
  image?: string | null
  url?: string
  note?: ReactNode
}

export const Author = ({ name, image, title, prefix, url, note, ...props }: AuthorProps) => {
  return (
    <Stack size="sm" wrap={false} {...props}>
      <Avatar className="rounded-full group-hover:[&[href]]:brightness-90">
        {image ? (
          <AvatarImage src={image} alt={`${name}'s profile`} />
        ) : (
          <AvatarFallback>{name.slice(0, 1).toUpperCase()}</AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 text-sm/normal text-secondary-foreground">
        <H6
          render={props => <h3 {...props}>{props.children}</h3>}
          className="truncate *:font-medium *:[[href]]:hover:text-foreground"
        >
          {prefix ? `${prefix} ` : ""}
          {url ? <ExternalLink href={url}>{name}</ExternalLink> : <span>{name}</span>}
        </H6>

        {note && <span className="opacity-50 truncate">{note}</span>}
      </div>
    </Stack>
  )
}
