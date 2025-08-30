import { test, expect } from "vitest";
import request from "supertest";
import { server } from "../app.ts";
import { makeUser } from "../tests/factories/make-user.ts";

test("login", async () => {
  await server.ready();

  const { user, passwordBeforeHash } = await makeUser();

  const response = await request(server.server)
    .post("/login")
    .set("Content-Type", "application/json")
    .send({ email: user.email, password: passwordBeforeHash });

  expect(response.status).toEqual(200);
  expect(response.body).toEqual({
    message: expect.any(String),
  });
});

test("login with invalid email", async () => {
  await server.ready();

  const { user, passwordBeforeHash } = await makeUser();

  const response = await request(server.server)
    .post("/login")
    .set("Content-Type", "application/json")
    .send({ email: "invalid_email@example.com", password: passwordBeforeHash });

  expect(response.status).toEqual(400);
  expect(response.body).toEqual({
    message: "Invalid credentials",
  });
});

test("login with invalid password", async () => {
  await server.ready();

  const { user, passwordBeforeHash } = await makeUser();

  const response = await request(server.server)
    .post("/login")
    .set("Content-Type", "application/json")
    .send({ email: user.email, password: "invalid_password" });

  expect(response.status).toEqual(400);
  expect(response.body).toEqual({
    message: "Invalid credentials",
  });
});
