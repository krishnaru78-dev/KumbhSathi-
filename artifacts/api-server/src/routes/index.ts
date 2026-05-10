import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import dashboardRouter from "./dashboard";
import templesRouter from "./temples";
import eventsRouter from "./events";
import crowdRouter from "./crowd";
import emergenciesRouter from "./emergencies";
import lostFoundRouter from "./lostFound";
import servicesRouter from "./services";
import alertsRouter from "./alerts";
import aiRouter from "./ai";
import adminRouter from "./admin";
import hotelsRouter from "./hotels";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(dashboardRouter);
router.use(templesRouter);
router.use(eventsRouter);
router.use(crowdRouter);
router.use(emergenciesRouter);
router.use(lostFoundRouter);
router.use(servicesRouter);
router.use(alertsRouter);
router.use(aiRouter);
router.use(adminRouter);
router.use(hotelsRouter);

export default router;
