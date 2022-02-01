/*
	User APIs
*/

const Express = require("express");
const Database = require("../database");
const route = Express.Router();
const path = "/user/";

// Get all users
route.get("/", (req, res) => {
	res.json({
		data: "User list",
	});
});

module.exports = {path, route};