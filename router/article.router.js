const express = require("express");
const Router = express.Router();
const article_controller = require("../controller/article.controller");
const is_athenticated = require("../middleware/authMiddleware");
const is_admin = require("../middleware/isAdminMiddleware");
const validateArticleCreation =require("../validators/create-article.validator")
// routers
Router.get("/articles", article_controller.get_all_articles);
Router.get("/search", article_controller.search_articles);
Router.get("/articles/:slug",is_athenticated, article_controller.get_article);
Router.delete("/articles/:slug",is_athenticated,is_admin, article_controller.delete_article);
Router.put("/articles/:slug",is_athenticated, article_controller.update_article);
Router.post("/articles", is_athenticated,validateArticleCreation(), article_controller.create_article);
Router.post("/comment", is_athenticated, article_controller.create_comment);
Router.get("/like/:slug", is_athenticated, article_controller.like);
Router.get("/activity/:userId",is_athenticated,is_admin, article_controller.get_user_activities);
Router.get("/bookmark/:slug",is_athenticated, article_controller.bookmark_article);
Router.get("/bookmark/",is_athenticated, article_controller.get_bookmarked_articles);

module.exports = Router;
