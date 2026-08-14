import { describe, expect, it } from "vitest";
import { appRouter } from "./routes";
import type { TrpcContext } from "./middleware/context";

function createTestContext(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-openid",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("portfolio tRPC procedures", () => {
  it("fetches projects successfully", async () => {
    const ctx = createTestContext("user");
    const caller = appRouter.createCaller(ctx);
    const projects = await caller.portfolio.getProjects();
    expect(Array.isArray(projects)).toBe(true);
  });

  it("fetches certificates successfully", async () => {
    const ctx = createTestContext("user");
    const caller = appRouter.createCaller(ctx);
    const certs = await caller.portfolio.getCertificates();
    expect(Array.isArray(certs)).toBe(true);
  });

  it("fetches blog posts successfully", async () => {
    const ctx = createTestContext("user");
    const caller = appRouter.createCaller(ctx);
    const posts = await caller.portfolio.getBlogPosts();
    expect(Array.isArray(posts)).toBe(true);
  });

  it("denies admin mutation for non-admin users", async () => {
    const ctx = createTestContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.portfolio.upsertProject({
        title: "Unauthorized Project",
        slug: "unauthorized",
        summary: "test",
        category: "DevOps",
        imageUrl: "https://example.com/image.png",
        technologies: "Docker",
        problem: "test",
        architecture: "test",
        impact: "test",
      })
    ).rejects.toThrow();
  });
});
