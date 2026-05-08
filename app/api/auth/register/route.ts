import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"
import { setSession } from "@/lib/session"
import { createUser, findUserByEmail } from "@/lib/store"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 })
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const cleanFullName = String(fullName).trim()

    if (!cleanEmail || !cleanFullName) {
      return NextResponse.json({ error: "Email and full name cannot be blank" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const existingUser = await findUserByEmail(cleanEmail)

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const user = await createUser(cleanEmail, passwordHash, cleanFullName)

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
