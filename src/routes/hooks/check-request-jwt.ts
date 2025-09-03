import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../../env.ts";

type JWTPayload = {
  sub: string;
  role: "student" | "manager";
};

export async function checkRequestJwt(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies.token;

  if (!token) {
    return reply.status(401).send();
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    request.user = payload;
  } catch {
    return reply.status(401).send();
  }
}
