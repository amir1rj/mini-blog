const express = require("express");
const Router = express.Router();
const account_controller = require("../controller/account.controller");
const validateRegistration = require("../validators/register.validator");
const is_admin = require("../middleware/isAdminMiddleware");
const is_authenticated = require("../middleware/authMiddleware");
// routers
Router.post("/register", validateRegistration(), account_controller.register);
Router.post("/login", account_controller.login);
Router.get("/users",is_authenticated,is_admin,account_controller.get_all_users )
Router.get("/users/:id",account_controller.get_user )
Router.patch("/users/:id",is_authenticated,account_controller.edit_user )
Router.delete("/users/:id",account_controller.delete_user )


module.exports = Router;
