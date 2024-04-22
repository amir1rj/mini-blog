const db = require("../db");

const performSearch = async (query) => {
  try {
    const searchResults = await db.query(`
    SELECT "Article"."id", "Article"."title", "Article"."description", "Article"."authorId", "Article"."likes", "Article"."views", "Article"."slug", "Article"."createdAt", "Article"."updatedAt", ARRAY_AGG("Categories"."name") AS categories
    FROM "Articles" AS "Article"
    LEFT JOIN "ArticleCategory" AS "ArticleCategory" ON "Article"."id" = "ArticleCategory"."ArticleId"
    LEFT JOIN "Categories" AS "Categories" ON "ArticleCategory"."CategoryId" = "Categories"."id"
    WHERE "Article"."_search" @@ plainto_tsquery('english', :query)
    GROUP BY "Article"."id";
    `, {
      replacements: { query },
      type: db.QueryTypes.SELECT,
    });
    
    return searchResults;
  } catch (error) {
    console.error('Error performing full-text search:', error);
    throw new Error('Failed to perform full-text search');
  }
};
module.exports =  performSearch ;