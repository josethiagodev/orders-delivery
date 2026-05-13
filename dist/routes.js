import { Router } from "express";
const router = Router();
router.get("/users", (_req, res) => {
    res.json({
        message: "HELLO NODEJS",
    });
});
export { router };
//# sourceMappingURL=routes.js.map