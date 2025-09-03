import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { users } from "../database/schema.ts";
import z from "zod";
import { hash } from "argon2";
import { eq } from "drizzle-orm";

export const createUserRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/users",
    {
      schema: {
        tags: ["users"],
        summary: "Create a new user",
        body: z.object({
          name: z.string().min(3, "Name must be at least 3 characters"),
          email: z.email("Email is required"),
          password: z.string().min(6, "Password must be at least 6 characters"),
          role: z.enum(["student", "manager"]).optional().default("student"),
        }),
        response: {
          201: z.object({
            user: z.object({
              id: z.uuid(),
              name: z.string().min(3),
              email: z.email(),
              role: z.enum(["student", "manager"]),
            }),
          }),
          400: z.object({ message: z.string() }).describe("Invalid request"),
          409: z.object({ message: z.string() }).describe("Email already in use"),
          500: z.object({ message: z.string() }).describe("Internal server error"),
        },
      },
    },
    async (request, reply) => {
      const { name, email, password, role } = request.body;

      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (existingUser[0]) {
        return reply.status(409).send({ message: "Email already in use" });
      }

      const hashedPassword = await hash(password);

      const [createdUser] = await db
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
          role,
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        });

      return reply.status(201).send({ user: createdUser });
    }
  );
};
