/*
	User APIs
*/

const Express = require("express");
const Auth = require("../auth");
const route = Express.Router();
const path = "/user/";
const auth = new Auth();

// Get all users
route.get("/", (req, res) => {
	res.json({
		data: "User list"
	});
});

// Sign in incoming user
route.post("/sign", (req, res) => {
	const user = req.body;
	res.json({
		data: auth.login(user)
	});
});

module.exports = {path, route};