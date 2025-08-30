import { test, expect } from "vitest";
import request from "supertest";
import { server } from "../app.ts";
import { makeCourse } from "../tests/factories/make-course.ts";
import { makeAuthenticatedUser } from "../tests/factories/make-user.ts";

test("get course by id", async () => {
  await server.ready();

  const { token } = await makeAuthenticatedUser("student");
  const course = await makeCourse();

  const response = await request(server.server).get(`/courses/${course.id}`).set("Authorization", token);

  expect(response.status).toEqual(200);
  expect(response.body).toEqual({
    course: {
      id: expect.any(String),
      title: expect.any(String),
      description: null,
    },
  });
});

test("return 404 for non existing course", async () => {
  await server.ready();

  const { token } = await makeAuthenticatedUser("student");

  const response = await request(server.server)
    .get(`/courses/773022c7-b04a-49f8-8b7a-b664431d5d8c`)
    .set("Authorization", token);

  expect(response.status).toEqual(404);
  expect(response.body).toEqual({
    message: "Course not found",
  });
});
