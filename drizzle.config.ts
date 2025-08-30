import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  out: "./src/database/migrations",
  schema: "./src/database/schema.ts",
  casing: "snake_case",
});
