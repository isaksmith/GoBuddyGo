import { Router, type IRouter } from "express";
import healthRouter from "./health";
import imageTo3dRouter from "./image-to-3d";

const router: IRouter = Router();

router.use(healthRouter);
router.use(imageTo3dRouter);

export default router;
