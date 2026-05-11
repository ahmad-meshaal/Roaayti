import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import booksRouter from "./books";
import chaptersRouter from "./chapters";
import linksRouter from "./links";
import exploreRouter from "./explore";
import aiRouter from "./ai";
import followersRouter from "./followers";
import adminRouter from "./admin";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(booksRouter);
router.use(chaptersRouter);
router.use(linksRouter);
router.use(exploreRouter);
router.use(aiRouter);
router.use(followersRouter);
router.use(adminRouter);
router.use(storageRouter);

export default router;
