import fastify from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { createCourseRoute } from "./routes/create-course.ts";
import { getCoursesRoute } from "./routes/get-courses.ts";
import { getCourseByIdRoute } from "./routes/get-course-by-id.ts";
import scalarAPIReference from "@scalar/fastify-api-reference";
import { readFileSync } from "node:fs";
import { loginRoute } from "./routes/login.ts";
import { fastifyCookie } from "@fastify/cookie";

const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));

export const server = fastify({
  logger:
    process.env.NODE_ENV === "development"
      ? {
          transport: {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          },
        }
      : false,
}).withTypeProvider<ZodTypeProvider>();

if (process.env.NODE_ENV === "development") {
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Desafio Node.js",
        version,
      },
    },
    transform: jsonSchemaTransform,
  });

  server.register(scalarAPIReference, {
    routePrefix: "/docs",
  });
}

server.register(createCourseRoute);
server.register(getCoursesRoute);
server.register(getCourseByIdRoute);
server.register(loginRoute);
server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
});

server.setSerializerCompiler(serializerCompiler);
server.setValidatorCompiler(validatorCompiler);
