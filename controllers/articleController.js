const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateSummary } = require("../utils/openAI");

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });

    const sanitizedArticles = articles.map((article) => {
      const { password, ...authorWithoutPassword } = article.author || {};
      return {
        ...article,
        author: authorWithoutPassword,
      };
    });

    res.json({
      count: sanitizedArticles.length,
      data: sanitizedArticles,
    });
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: req.params.id },
      include: { author: true },
    });

    const { password, ...authorWithoutPassword } = article.author || {};
    const sanitizedArticle = {
      ...article,
      author: authorWithoutPassword,
    };

    res.json(sanitizedArticle);
  } catch (err) {
    console.error("Error fetching article by ID:", err);
    res.status(500).json({ error: "Failed to fetch article" });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    const article = await prisma.article.create({
      data: {
        title,
        content,
        createdBy: req.user.id,
      },
    });
    res.json(article);
  } catch (err) {
    console.error("Error creating article:", err);
    res.status(500).json({ error: "Failed to create article" });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    const id = req.params.id;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Article not found" });

    if (existing.createdBy !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    await prisma.revision.create({
      data: {
        articleId: id,
        content: existing.content,
        title: existing.title,
      },
    });

    const updated = await prisma.article.update({
      where: { id },
      data: { title, content },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating article:", err);
    res.status(500).json({ error: "Failed to update article" });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await prisma.article.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: "Article not found" });
    }

    if (existing.createdBy !== req.user.id) {
      return res.status(403).json({ error: "your are not Unauthorized" });
    }

    await prisma.article.delete({ where: { id } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete article" });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const id = req.params.id;
    const article = await prisma.article.findUnique({ where: { id } });

    if (!article) return res.status(404).json({ error: "Article not found" });

    if (article.summary) return res.json({ summary: article.summary });

    const summary = await generateSummary(article.content);

    const updated = await prisma.article.update({
      where: { id },
      data: { summary },
    });

    res.json({ summary: updated.summary });
  } catch (err) {
    console.error("Error generating summary:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const id = req.params.id;
    const article = await prisma.article.findUnique({ where: { id } });

    if (!article) return res.status(404).json({ error: "Article not found" });

    if (article.createdBy !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    const history = await prisma.revision.findMany({
      where: { articleId: id },
      orderBy: { createdAt: "desc" },
    });

    const modifiedHistory = history.map((rev) => ({
      ...rev,
      title: article.title,
    }));

    res.json(modifiedHistory);
  } catch (err) {
    console.error("Error fetching article history:", err);
    res.status(500).json({ error: "Failed to fetch article history" });
  }
};
