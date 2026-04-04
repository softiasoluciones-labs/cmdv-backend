import { Router } from "express";
import { GlobalParametersController } from "../controllers/config-system-controllers/global-parameters-controller";
import { authMiddleware } from "../../../middleware";

const router = Router();

router.use(authMiddleware);

router.get('/global-parameters', GlobalParametersController.getAll);
router.get('/global-parameters/category/:category', GlobalParametersController.getByCategory);
router.get('/global-parameters/key/:key', GlobalParametersController.getByKey);
router.post('/global-parameters', GlobalParametersController.create);
router.put('/global-parameters/:id', GlobalParametersController.update);

export { router as configRoutes };