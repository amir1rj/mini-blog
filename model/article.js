const Sequelize = require("sequelize");
const db = require("../db");
const User = require("./user.model");
const slugify = require("slugify");
// Define the Category model
const Category = db.define(
  "Category",
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    parentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    slug: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true,
    hooks: {
      // Before creating a category, generate slug from name
      beforeCreate: (category) => {
        category.slug = slugify(category.name, { lower: true });
      },
      // Before updating a category, regenerate slug if name is changed
      beforeUpdate: (category) => {
        if (category.changed("name")) {
          category.slug = slugify(category.name, { lower: true });
        }
      },
    },
  }
);

// Define the Article model
const Article = db.define(
  "Article",
  {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    authorId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    likes: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    views: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    slug: {
      type: Sequelize.STRING, // Define slug field
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true,
    hooks: {
      // Before creating an article, generate slug from title
      beforeCreate: (article) => {
        article.slug = slugify(article.title, { lower: true });
      },
      // Before updating an article, regenerate slug if title is changed
      beforeUpdate: async (article) => {
        article.slug = slugify(article.title, { lower: true });
      },
    },
  }
);

// Define the Comment model
const Comment = db.define(
  "Comment",
  {
    text: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    parentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);
// Define the view model
const ArticleView = db.define("ArticleView", {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  articleId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});
// Define the like model
const ArticleLike = db.define("ArticleLike", {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  articleId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  like: {
    type: Sequelize.BOOLEAN, // wether user liked this article or not
    allowNull: false,
  },
});
// Define the bookmark model

const Bookmark = db.define("Bookmark", {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  articleId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
 
},  {
  timestamps: true,
});
// Self-referencing association for categories (category can have a parent)
Category.hasMany(Category, { as: "Children", foreignKey: "parentId" });
Category.belongsTo(Category, { as: "Parent", foreignKey: "parentId" });

// Self-referencing association for comments (comment can have a parent)
Comment.hasMany(Comment, { as: "Replies", foreignKey: "parentId" });
Comment.belongsTo(Comment, { as: "Parent", foreignKey: "parentId" });

// Association between article and category (many-to-many)
Article.belongsToMany(Category, { through: "ArticleCategory" });
Category.belongsToMany(Article, { through: "ArticleCategory" });

// Association between article and comment (one-to-many)
Article.hasMany(Comment);
Comment.belongsTo(Article);

// Association between article and user (one-to-many)
Article.belongsTo(User, { foreignKey: "authorId", as: "author" });
Comment.belongsTo(User, { foreignKey: "userId", as: "author" });
// Association between user and article (many-to-many)
User.hasMany(Bookmark, { foreignKey: 'userId' });
Article.hasMany(Bookmark, { foreignKey: 'articleId' });
Bookmark.belongsTo(User, { foreignKey: 'userId' });
Bookmark.belongsTo(Article, { foreignKey: 'articleId' });
module.exports = { Article, Category, Comment, ArticleLike, ArticleView,Bookmark };
