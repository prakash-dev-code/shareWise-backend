const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getSummary,
  getHistory,
} = require("../controllers/articleController");

router.use(authenticate);

router.get("/", getAllArticles);
router.get("/:id", getArticleById);
router.post("/", createArticle);
router.patch("/:id", updateArticle);
router.delete("/:id", deleteArticle);
router.get("/:id/summary", getSummary);
router.get("/:id/history", getHistory);

module.exports = router;
