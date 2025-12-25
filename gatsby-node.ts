import type { CreatePagesArgs } from "gatsby"
import * as dotenv from "dotenv"

// Cargar variables de entorno al inicio
dotenv.config({
  path: `.env`,
})

export const createPages = async ({ actions, graphql }: CreatePagesArgs) => {
  // Add your programmatic page creation here if needed
}