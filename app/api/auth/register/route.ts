import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { setSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const result = await sql`
      INSERT INTO users (email, password_hash, full_name) 
      VALUES (${email}, ${passwordHash}, ${fullName}) 
      RETURNING id, email, full_name
    `

    const user = result[0]

    // Set session
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
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
