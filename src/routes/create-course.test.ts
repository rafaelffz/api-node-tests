import { test, expect } from "vitest";
import request from "supertest";
import { server } from "../app.ts";
import { faker } from "@faker-js/faker";
import { makeAuthenticatedUser } from "../tests/factories/make-user.ts";

test("create a course", async () => {
  await server.ready();

  const { cookie } = await makeAuthenticatedUser("manager");
  if (!cookie) return;

  const response = await request(server.server)
    .post("/courses")
    .set("Content-Type", "application/json")
    .set("Cookie", cookie)
    .send({ title: faker.lorem.words(4) });

  expect(response.status).toEqual(201);
  expect(response.body).toEqual({
    courseId: expect.any(String),
  });
});

test("return 400 for invalid data", async () => {
  await server.ready();

  const { cookie } = await makeAuthenticatedUser("manager");
  if (!cookie) return;

  const response = await request(server.server)
    .post("/courses")
    .set("Content-Type", "application/json")
    .set("Cookie", cookie)
    .send({});

  expect(response.status).toEqual(400);
  expect(response.body).toEqual({
    message: expect.any(String),
  });
});

test("return 400 for invalid data", async () => {
  await server.ready();

  const response = await request(server.server).post("/courses").set("Content-Type", "application/json").send({});

  expect(response.status).toEqual(400);
  expect(response.body).toEqual({
    message: expect.any(String),
  });
});
