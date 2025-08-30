import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { users } from "../database/schema.ts";
import z from "zod";
import { eq } from "drizzle-orm";
import { verify } from "argon2";
import jwt from "jsonwebtoken";

export const loginRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/login",
    {
      schema: {
        tags: ["auth"],
        summary: "Create a new session",
        body: z.object({
          email: z.email("Invalid email address"),
          password: z.string().min(6, "Password must be at least 6 characters"),
        }),
        response: {
          200: z.object({ message: z.string() }),
          400: z.object({ message: z.string() }).describe("Invalid credentials"),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const result = await db.select().from(users).where(eq(users.email, email));

      if (!result.length) {
        return reply.status(400).send({ message: "Invalid credentials" });
      }

      const user = result[0];

      const doesPasswordMatch = await verify(user.password, password);

      if (!doesPasswordMatch) {
        return reply.status(400).send({ message: "Invalid credentials" });
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET must be set.");
      }

      const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

      reply.setCookie("token", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      return reply.status(200).send({ message: "Login successful" });
    }
  );
};
