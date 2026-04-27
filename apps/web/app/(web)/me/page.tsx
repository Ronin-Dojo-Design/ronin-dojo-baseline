import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "~/lib/auth"
import { getDirectoryProfileByUserId, getPassportByUserId } from "~/server/web/passport/queries"
import { PassportEditor } from "./passport-editor"

export const metadata: Metadata = {
  title: "My Passport",
  description: "Manage your martial arts identity and directory profile.",
}

export default async function MePage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const [passport, directoryProfile] = await Promise.all([
    getPassportByUserId(session.user.id),
    getDirectoryProfileByUserId(session.user.id),
  ])

  if (!passport || !directoryProfile) {
    // Shouldn't happen post-S2 sign-up hook, but guard defensively
    redirect("/auth/login")
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">My Passport</h1>
        <p className="text-muted-foreground mt-1">
          Manage your identity and control what others see in the directory.
        </p>
      </div>

      <PassportEditor passport={passport} directoryProfile={directoryProfile} />
    </div>
  )
}
