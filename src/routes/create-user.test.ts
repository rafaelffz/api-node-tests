import { expect, test } from "vitest";
import { server } from "../app.ts";
import request from "supertest";
import { faker } from "@faker-js/faker";
import { makeUser } from "../tests/factories/make-user.ts";

test("create a new user", async () => {
  await server.ready();

  const fakeEmail = faker.internet.email();

  const response = await request(server.server).post("/users").send({
    name: "John Doe",
    email: fakeEmail,
    password: "password123",
  });

  expect(response.status).toBe(201);
  expect(response.body).toEqual({
    user: {
      id: expect.any(String),
      name: "John Doe",
      email: fakeEmail,
      role: "student",
    },
  });
});

test("try to create a user with an email that already exists", async () => {
  await server.ready();

  const { user, passwordBeforeHash } = await makeUser();

  const response = await request(server.server).post("/users").send({
    name: "John Doe",
    email: user.email,
    password: "password123",
  });

  expect(response.status).toBe(409);
  expect(response.body).toEqual({
    message: "Email already in use",
  });
});
