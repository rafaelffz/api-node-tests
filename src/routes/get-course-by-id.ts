import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { courses } from "../database/schema.ts";
import z from "zod";
import { eq } from "drizzle-orm";
import { checkRequestJwt } from "./hooks/check-request-jwt.ts";
import { getAuthenticatedUser } from "../utils/get-authenticated-user.ts";

export const getCourseByIdRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/courses/:id",
    {
      preHandler: [checkRequestJwt],
      schema: {
        params: z.object({
          id: z.uuid(),
        }),
        tags: ["courses"],
        summary: "Get course by id",
        response: {
          200: z
            .object({
              course: z.object({
                id: z.uuid(),
                title: z.string(),
                description: z.string().nullable(),
              }),
            })
            .describe("Course found"),
          404: z.object({ message: z.string() }).describe("Course not found"),
        },
      },
    },
    async (request, reply) => {
      const user = getAuthenticatedUser(request);

      const { id } = request.params;

      const result = await db.select().from(courses).where(eq(courses.id, id));

      if (result.length === 0) {
        return reply.status(404).send({ message: "Course not found" });
      }

      return reply.status(200).send({ course: result[0] });
    }
  );
};
