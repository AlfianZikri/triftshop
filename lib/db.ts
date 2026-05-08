import { neon } from "@neondatabase/serverless"

let client: ReturnType<typeof neon> | null = null

function getClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to use database routes")
  }

  if (!client) {
    client = neon(process.env.DATABASE_URL)
  }

  return client
}

const sql = ((strings: TemplateStringsArray, ...values: any[]) => getClient()(strings, ...values)) as any

export { sql }
