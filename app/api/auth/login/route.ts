import { type NextRequest, NextResponse } from "next/server"
import { verifyPassword } from "@/lib/auth"
import { setSession } from "@/lib/session"
import { findUserByEmail } from "@/lib/store"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const user = await findUserByEmail(cleanEmail)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const passwordMatch = await verifyPassword(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    await setSession({
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
    })

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, fullName: user.full_name },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
