import { faker } from "@faker-js/faker";
import { db } from "../../database/client.ts";
import { users } from "../../database/schema.ts";
import { hash } from "argon2";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { server } from "../../app.ts";

export async function makeUser(role?: "manager" | "student") {
  const passwordBeforeHash = randomUUID();

  const result = await db
    .insert(users)
    .values({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: await hash(passwordBeforeHash),
      role: role,
    })
    .returning();

  return {
    user: result[0],
    passwordBeforeHash,
  };
}

export async function makeAuthenticatedUser(role: "manager" | "student") {
  const { user, passwordBeforeHash } = await makeUser(role);

  const response = await request(server.server).post("/login").send({
    email: user.email,
    password: passwordBeforeHash,
  });

  const cookie = response.get("Set-Cookie");

  return {
    user,
    cookie,
  };
}
