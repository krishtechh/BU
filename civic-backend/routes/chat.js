const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.use(protect); // Ensure all chat routes are protected

router.get("/my-chats", chatController.getMyChats);
router.get("/:chatId/messages", chatController.getMessages);
router.post("/message", chatController.sendMessage);
router.post("/create", chatController.createChat);

module.exports = router;
