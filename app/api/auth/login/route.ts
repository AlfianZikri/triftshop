import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"
import { setSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const users = await sql`SELECT id, email, password_hash, full_name FROM users WHERE email = ${email}`

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const user = users[0]
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
