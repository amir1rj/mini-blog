const { validationResult } = require("express-validator");
const {
  Article,
  Category,
  Comment,
  ArticleLike,
  ArticleView,
  Bookmark,
} = require("../model/article");
const Activity = require("../model/activity.model");
const logActivity = require("../middleware/log.activity");
const User = require("../model/user.model");
const performSearch = require("../util/search.query");
module.exports.get_all_articles = async (req, res, next) => {
  try {
    const { category } = req.query;
    // Define the include object for the Sequelize query
    const includeOptions = [{ model: Category, attributes: ["name"] }];

    // Add a condition to filter articles by category name, if provided
    if (category) {
      includeOptions[0].where = { name: category };
    }
    // Fetch all articles with their associated category and comments
    const articles = await Article.findAll({
      include: includeOptions,
    });

    // If no articles are found, return empty array
    if (!articles || articles.length === 0) {
      return res.status(404).json({ message: "No articles found" });
    }
    const formattedArticles = articles.map((article) => ({
      id: article.id,
      title: article.title,
      description: article.description,
      categories: article.Categories.map((category) => category.name),
      likes: article.likes,
      slug: article.slug,
    }));

    res.status(200).json({ articles: formattedArticles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ message: "Failed to fetch articles" });
  }
};
module.exports.get_article = async (req, res) => {
  try {
    const { slug } = req.params;

    // Fetch the article with the specified ID along with its associated category and comments
    const article = await Article.findOne({
      where: { slug: slug },
      include: [
        { model: Category, attributes: ["name"] },
        { model: Comment },
        { model: User, as: "author", attributes: ["fullname"] },
      ],
    });

    // If the article with the specified ID is not found, return a 404 response
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    // Check if the user has viewed the article
    const existingView = await ArticleView.findOne({
      where: { userId: req.userId, articleId: article.id },
    });

    // If the user has not viewed the article before, create a new view
    if (!existingView) {
      await Article.increment("views", { where: { id: article.id } }); // Increment the views count
      await logActivity(req.userId, "view", "article", article.id);
      await ArticleView.create({ userId: req.userId, articleId: article.id }); // Record the view
    }
    // Format the response
    const formattedArticle = {
      id: article.id,
      title: article.title,
      description: article.description,
      categories: article.Categories.map((category) => category.name),
      comments: article.Comments,
      likes: article.likes,
      views: article.views,
      author: article.author.fullname,
    };

    // Send the formatted article as the response
    res.status(200).json({ article: formattedArticle });
  } catch (error) {
    // Handle any errors
    console.error("Error fetching article:", error);
    res.status(500).json({ message: "Failed to fetch article" });
  }
};
module.exports.create_article = async (req, res, next) => {
  try {
    // Extract article data from the request body
    const { title, content, category } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Find the category by name
    const category_model = await Category.findOne({
      where: { name: category },
    });
    console.log(category_model);
    // If category doesn't exist, handle the error
    if (!category_model) {
      return res.status(400).json({ message: "Category not found" });
    }

    // Create the article in the database with the associated author
    const article = await Article.create({
      title: title,
      description: content,
      authorId: req.userId,
      slug: 1,
    });
    await article.addCategory(category_model);
    res.status(201).json({
      message: "Article created successfully",
      article: article, // Return the article object returned by Sequelize create method
    });
  } catch (error) {
    // Handle any errors that occur during article creation
    console.error("Error creating article:", error);
    res.status(500).json({ message: "Failed to create article" });
  }
};
module.exports.create_comment = async (req, res) => {
  try {
    const { articleId, text, parentId } = req.body;
    const userId = req.userId;

    // Find the article by ID
    const article = await Article.findByPk(articleId);

    // If the article with the specified ID is not found, return a 404 response
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Define the comment object to be created
    const commentData = {
      text,
      userId,
      ArticleId: articleId, // Associate the comment with the article
    };

    // If parentId is provided, add it to the comment data
    if (parentId) {
      // Check if the parent comment exists
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      commentData.parentId = parentId;
    }

    // Create the comment in the database with the associated user, article, and parent comment
    const comment = await Comment.create(commentData);
    await logActivity(req.userId, comment.text, "comment", comment.id);
    // Send a success response
    res.status(201).json({
      message: "Comment created successfully",
      comment: comment,
    });
  } catch (error) {
    // Handle any errors that occur
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Failed to create comment" });
  }
};
module.exports.like = async (req, res) => {
  const { slug } = req.params;
  const userId = req.userId;
  try {
    const article = await Article.findOne({ where: { slug: slug } });
    if (!article) {
      throw new Error("Article not found");
    }

    // Check if the user has already liked the article
    const existingLike = await ArticleLike.findOne({
      where: { userId, articleId: article.id },
    });

    // If the user has already liked the article, toggle the like status
    if (existingLike) {
      await existingLike.destroy(); // Remove the existing like
      await Article.decrement("likes", { where: { id: article.id } }); // Decrement the likes count
      await logActivity(req.userId, "dislike", "article", article.id);
      return res

        .status(200)
        .json({ liked: false, message: "Article disLiked successfully" });
    }

    // If the user has not liked the article before, create a new like
    await ArticleLike.create({ userId, articleId: article.id, like: true });
    await Article.increment("likes", { where: { id: article.id } }); // Increment the likes count
    await logActivity(req.userId, "like", "article", article.id);
    return res
      .status(200)
      .json({ liked: true, message: "Article liked successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to like or dislike the article" });
  }
};
module.exports.delete_article = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.userId;

    // Find the article by ID
    const article = await Article.findOne({ slug: slug });

    // If the article doesn't exist, return a 404 response
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check if the current user is the author of the article
    if (article.authorId !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this article" });
    }

    // Delete the article
    await article.destroy();

    // Send a success response

    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ message: "Failed to delete article" });
  }
};

module.exports.update_article = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.userId;
    const { title, description, categories } = req.body;

    const article = await Article.findOne({
      where: { slug: slug },
      include: [{ model: Category }],
    });

    // If the article doesn't exist, return a 404 response
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    // Check if the current user is the author of the article
    if (article.authorId !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to modify this article" });
    }
    if (article.title !== title) {
      article.title = title;
    }

    article.description = description;

    // Find categories by name
    const newCategories = [];
    if (categories && Array.isArray(categories)) {
      for (const categoryName of categories) {
        const foundCategory = await Category.findOne({
          where: { name: categoryName },
        });
        if (foundCategory) {
          newCategories.push(foundCategory);
        }
      }
    }

    // Set the new categories for the article
    await article.setCategories(newCategories);

    // Save the updated article
    await article.save();
    await logActivity(req.userId, "update", "article", article.id);
    // Send a success response
    res
      .status(200)
      .json({ message: "Article updated successfully", article: article });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ message: "Failed to update article" });
  }
};

module.exports.search_articles = async (req, res, next) => {
  try {
    const { query, category } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    let searchResults = await performSearch(query);

    if (!searchResults || searchResults.length === 0) {
      return res.status(404).json({ message: "No matching articles found" });
    }

    // Filter search results by category if provided
    if (category) {
      searchResults = searchResults.filter((article) =>
        article.categories.includes(category)
      );
    }

    res.status(200).json({ articles: searchResults });
  } catch (error) {
    console.error("Error searching articles:", error);
    res.status(500).json({ message: "Failed to search articles" });
  }
};
module.exports.get_user_activities = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch activities of the user from the database
    const activities = await Activity.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ activities });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ message: "Failed to fetch user activities" });
  }
};
module.exports.bookmark_article = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.userId;

    // Check if the article with the specified ID exists
    const articleExists = await Article.findOne({ slug: slug });
    if (!articleExists) {
      return res.status(404).json({ message: "Article not found" });
    }
    const articleId = articleExists.id;
    // Check if the user has already bookmarked the article
    const existingBookmark = await Bookmark.findOne({
      where: { userId: userId, articleId: articleId },
    });
    if (existingBookmark) {
      existingBookmark.destroy();
      await logActivity(req.userId, "unbookmark", "article", articleId);
      return res.status(400).json({ message: "Article  unbookmarked successfully" });
    }

    // Create a new bookmark in the database
    await Bookmark.create({ userId: userId, articleId: articleId });

    // Send a success response
    await logActivity(req.userId, "bookmark", "article", articleId);
    res.status(201).json({ message: "Article bookmarked successfully" });
  } catch (error) {
    console.error("Error bookmarking article:", error);
    res.status(500).json({ message: "Failed to bookmark article" });
  }
};

module.exports.get_bookmarked_articles = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all bookmarks for the user
    const bookmarks = await Bookmark.findAll({
      where: { userId: userId },
      include: [
        {
          model: Article,
          include: [{ model: Category, attributes: ["name"] }],
        },
      ],
    });

    // Extract article details from bookmarks
    const bookmarkedArticles = bookmarks.map((bookmark) => {
      const article = bookmark.Article;
      const categories = article.Categories.map((category) => category.name); // Extract only category names
      return {
        ...article.toJSON(),
        Categories: categories,
      };
    });

    res.status(200).json({ bookmarkedArticles });
  } catch (error) {
    console.error("Error fetching bookmarked articles:", error);
    res.status(500).json({ message: "Failed to fetch bookmarked articles" });
  }
};
