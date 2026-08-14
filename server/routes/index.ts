import { router } from "../middleware/auth";
import { systemRouter } from "../controllers/systemController";
import { authRouter } from "../controllers/authController";
import { portfolioRouter } from "../controllers/portfolioController";
import { adminRouter } from "../controllers/adminController";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  portfolio: router({
    // Public procedures
    ...portfolioRouter._def.procedures,
    // Admin procedures
    ...adminRouter._def.procedures,
  }),
});

export type AppRouter = typeof appRouter;
