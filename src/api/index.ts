import { Router } from "express";
import { v1Router } from './v1/routes';

const apiRouter = Router();

// Version 1 router - /api/v1
apiRouter.use('/v1', v1Router);

apiRouter.get('/', (req, res) => {
    res.redirect('/api/v1');
});

export { apiRouter as routes };

