import { test, expect } from "vitest";
import request from "supertest";
import { server } from "../app.ts";
import { makeCourse } from "../tests/factories/make-course.ts";
import { randomUUID } from "node:crypto";
import { makeAuthenticatedUser } from "../tests/factories/make-user.ts";

test("get courses", async () => {
  await server.ready();

  const titleId = randomUUID();

  const { token } = await makeAuthenticatedUser("manager");
  const course = await makeCourse(titleId);

  const response = await request(server.server).get(`/courses?search=${titleId}`).set("Authorization", token);

  expect(response.status).toEqual(200);
  expect(response.body).toEqual({
    courses: [
      {
        id: course.id,
        title: course.title,
        enrollments: 0,
      },
    ],
    total: 1,
  });
});

test("return 404 if no courses found", async () => {
  await server.ready();

  const { token } = await makeAuthenticatedUser("manager");

  const response = await request(server.server)
    .get(`/courses?search=non-existing-title-${randomUUID()}`)
    .set("Authorization", token);

  expect(response.status).toEqual(404);
  expect(response.body).toEqual({
    message: "No courses found",
  });
});
