import { Router } from "express";
import messageController from "../controllers/messageController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);

router.post("/", asyncHandler(messageController.sendMessage));
router.get(
  "/conversation/:conversationId",
  asyncHandler(messageController.getMessages),
);
router.post("/:messageId/react", asyncHandler(messageController.reactToMessage));

export default router;
