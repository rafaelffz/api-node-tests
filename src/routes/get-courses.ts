import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { courses, enrollments } from "../database/schema.ts";
import z from "zod";
import { and, asc, count, eq, ilike, SQL } from "drizzle-orm";
import { checkRequestJwt } from "./hooks/check-request-jwt.ts";
import { checkUserRole } from "./hooks/check-user-role.ts";
import { makeAuthenticatedUser } from "../tests/factories/make-user.ts";

export const getCoursesRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/courses",
    {
      preHandler: [checkRequestJwt, checkUserRole("manager")],
      schema: {
        tags: ["courses"],
        summary: "Get all courses",
        querystring: z.object({
          search: z.string().optional(),
          orderBy: z.enum(["id", "title"]).optional().default("id"),
          page: z.coerce.number().optional().default(1),
          size: z.coerce.number().optional().default(2),
        }),
        response: {
          200: z
            .object({
              courses: z.array(
                z.object({
                  id: z.uuid(),
                  title: z.string(),
                  enrollments: z.number(),
                })
              ),
              total: z.number(),
            })
            .describe("Courses retrieved successfully"),
          404: z.object({ message: z.string() }).describe("No courses found"),
        },
      },
    },
    async (request, reply) => {
      const { search, orderBy, page, size } = request.query;

      const conditions: SQL[] = [];

      if (search) {
        conditions.push(ilike(courses.title, `%${search}%`));
      }

      const [result, total] = await Promise.all([
        db
          .select({
            id: courses.id,
            title: courses.title,
            enrollments: count(enrollments.id),
          })
          .from(courses)
          .leftJoin(enrollments, eq(enrollments.courseId, courses.id))
          .where(and(...conditions))
          .limit(size)
          .offset((page - 1) * size)
          .orderBy(asc(courses[orderBy]))
          .groupBy(courses.id),
        db.$count(courses, and(...conditions)),
      ]);

      makeAuthenticatedUser("manager");

      if (result.length === 0) {
        return reply.status(404).send({ message: "No courses found" });
      }

      return reply.status(200).send({ courses: result, total });
    }
  );
};
