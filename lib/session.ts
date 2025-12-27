import { cookies } from "next/headers"

const SESSION_COOKIE_NAME = "thriftshop_session"
const SESSION_EXPIRY_HOURS = 24

export interface Session {
  userId: number
  email: string
  fullName: string
  isAdmin?: boolean
}

export async function setSession(session: Session): Promise<void> {
  const cookieStore = await cookies()
  const sessionData = JSON.stringify(session)

  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
    path: "/",
  })
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionData = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionData) return null

  try {
    return JSON.parse(sessionData)
  } catch {
    return null
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
