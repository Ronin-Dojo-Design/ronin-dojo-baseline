import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Note } from "~/components/common/note"
import { ListingCard } from "~/components/web/listing/listing-card"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import { Favicon } from "~/components/web/ui/favicon"
import { Grid } from "~/components/web/ui/grid"
import { getServerSession } from "~/lib/auth"
import type { SavedListing } from "~/lib/bookmarks/saved-listing"
import { getSavedListings } from "~/server/web/bookmarks/saved"

/**
 * DashboardSavedTab — SESSION_0397. The "Saved" tab on `/app/profile`: a mixed-entity `ListingCard`
 * grid of everything the user has bookmarked (tools, people, schools, techniques, posts, lineage
 * trees), each with a live Save toggle. This is the view surface for the polymorphic Bookmark that
 * never existed before (the actions revalidated a non-existent `/dashboard/bookmarks` — D-DRIFT-0397-2).
 */

function SavedMedia({ listing }: { listing: SavedListing }) {
  if (listing.media === "favicon") {
    return <Favicon src={listing.imageUrl} title={listing.name} className="size-9" />
  }

  if (listing.media === "avatar") {
    return (
      <Avatar className="size-9 shrink-0">
        {listing.imageUrl && <AvatarImage src={listing.imageUrl} alt={listing.name} />}
        <AvatarFallback>{listing.initials}</AvatarFallback>
      </Avatar>
    )
  }

  return null
}

export async function DashboardSavedTab() {
  const session = await getServerSession()

  if (!session?.user) {
    return <Note>Sign in to see your saved listings.</Note>
  }

  const listings = await getSavedListings(session.user.id)

  if (listings.length === 0) {
    return (
      <Note>
        You haven't saved anything yet. Tap <strong>Save</strong> on any tool, person, school,
        technique, post, or lineage tree to keep it here.
      </Note>
    )
  }

  return (
    <Grid>
      {listings.map(listing => (
        <ListingCard
          key={listing.key}
          href={listing.href}
          name={listing.name}
          media={listing.media === "none" ? undefined : <SavedMedia listing={listing} />}
          tagline={listing.tagline}
          description={listing.description}
          save={
            <ListingSaveButton subjectType={listing.subjectType} subjectId={listing.subjectId} />
          }
        />
      ))}
    </Grid>
  )
}
