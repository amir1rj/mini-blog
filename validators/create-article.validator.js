const { body } = require("express-validator");
const { Category,Article } = require("../model/article");

const validateArticleCreation = () => {
  return [
    // Validate title
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .matches(/^[a-zA-Z0-9\s]+$/)
      .withMessage("Title must contain only letters and numbers")
      .custom(async (value) => {
        // Check if an article with the same title already exists
        const existingArticle = await Article.findOne({
          where: { title: value },
        });
        if (existingArticle) {
          throw new Error("Article with this title already exists");
        }else
        return true;
      })
      ,
    // Validate description
    body("content").notEmpty().withMessage("Description is required"),

    // Validate category
    body("category")
      .notEmpty()
      .withMessage("Category is required")
      .custom(async (value) => {
        // Check if the category exists
        const existingCategory = await Category.findOne({
          where: { name: value },
        });
        if (!existingCategory) {
          // If the category doesn't exist, create it
          await Category.create({ name: value,slug:1 });
        }
        return true;
      })
     
  ];
};

module.exports = validateArticleCreation;
