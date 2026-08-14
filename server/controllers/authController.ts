import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../middleware/cookies";
import { publicProcedure, router } from "../middleware/auth";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getUserByOpenId, upsertUser } from "../models/User";
import { sdk } from "../services/sdk";
export const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
  loginWithPassword: publicProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword || input.password !== adminPassword) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid password" });
      }
      
      // Ensure admin user exists in DB
      let user = await getUserByOpenId("dev-admin-local");
      if (!user) {
        await upsertUser({
          openId: "dev-admin-local",
          name: "Admin",
          email: "admin@local",
          loginMethod: "password",
          role: "admin",
          lastSignedIn: new Date()
        });
        user = await getUserByOpenId("dev-admin-local");
      }
      
      // Mint session
      const sessionToken = await sdk.createSessionToken("dev-admin-local", { name: "Admin" });
      
      // Set cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
      
      return { success: true };
    }),
});
