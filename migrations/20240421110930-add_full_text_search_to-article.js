'use strict';
const vectorName = '_search';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => (
    queryInterface.sequelize.transaction((t) =>
      Promise.all([
        queryInterface.addColumn('Articles', vectorName, {
          type: Sequelize.DataTypes.TSVECTOR,
          allowNull: true,
        }, { transaction: t }),
        queryInterface.sequelize.query(`
          UPDATE "Articles" SET ${vectorName} = to_tsvector('english', title || ' ' || description);
        `, { transaction: t }),
        queryInterface.sequelize.query(`
          CREATE INDEX articles_search ON "Articles" USING gin(${vectorName});
        `, { transaction: t }),
        queryInterface.sequelize.query(`
          CREATE TRIGGER articles_vector_update
          BEFORE INSERT OR UPDATE ON "Articles"
          FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(${vectorName}, 'pg_catalog.english', title, description);
        `, { transaction: t }),
      ]).catch(console.log)
    )
  ),

  down: (queryInterface) => (
    queryInterface.sequelize.transaction((t) =>
      Promise.all([
        queryInterface.sequelize.query(`
          DROP TRIGGER articles_vector_update ON "Articles";
        `, { transaction: t }),
        queryInterface.sequelize.query(`
          DROP INDEX articles_search;
        `, { transaction: t }),
        queryInterface.removeColumn('Articles', vectorName, { transaction: t }),
      ]).catch(console.log)
    )
  ),
};