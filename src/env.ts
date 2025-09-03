import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string(),
  COOKIE_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
