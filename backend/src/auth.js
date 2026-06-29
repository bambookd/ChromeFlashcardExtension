import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { httpError } from "./errors.js";

export function createAuthService(config, repositories) {
  return {
    async register(username, password) {
      const existing = await repositories.users.findByUsername(username);

      if (existing) {
        throw httpError(409, "Username already exists");
      }

      const now = new Date().toISOString();
      const user = await repositories.users.create({
        userId: randomUUID(),
        username,
        passwordHash: await bcrypt.hash(password, 10),
        role: "user",
        createdAt: now,
        updatedAt: now
      });

      await repositories.categories.add(user.userId, "Uncategorized");
      return createAuthPayload(config, user);
    },

    async login(username, password) {
      const user = await repositories.users.findByUsername(username);

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw httpError(401, "Invalid username or password");
      }

      return createAuthPayload(config, user);
    },

    async authenticateToken(token) {
      if (!token) {
        throw httpError(401, "Authentication required");
      }

      try {
        const payload = jwt.verify(token, config.jwtSecret);
        const user = await repositories.users.findByUsername(payload.username);

        const userId = user?.userId || user?.id;

        if (!user || userId !== payload.sub) {
          throw httpError(401, "User no longer exists");
        }

        return normalizeUser(user);
      } catch (error) {
        if (error.statusCode) {
          throw error;
        }

        throw httpError(401, "Invalid or expired token");
      }
    }
  };
}

export function publicUser(user) {
  return {
    id: user.userId || user.id,
    userId: user.userId || user.id,
    username: user.username,
    role: user.role || "user"
  };
}

function normalizeUser(user) {
  const userId = user.userId || user.id;

  return {
    ...user,
    id: userId,
    userId,
    role: user.role || "user"
  };
}

function createAuthPayload(config, user) {
  const publicInfo = publicUser(normalizeUser(user));

  return {
    ok: true,
    token: jwt.sign(
      {
        sub: publicInfo.userId,
        username: publicInfo.username,
        role: publicInfo.role
      },
      config.jwtSecret,
      { expiresIn: "7d" }
    ),
    user: publicInfo
  };
}
