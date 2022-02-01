/*
	User APIs
*/

const Express = require("express");
const Database = require("../database");
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
	let token = null;
	const user = req.body;
	const database = new Database("users");
	const authUser = database.get().filter(item =>
		item.name === user.name &&
		item.password === user.password
	);
	console.log("Incoming user ", user);
	console.log("Found user ", authUser);
	if(authUser.length > 0)
		token = auth.sign(user);
	res.json({
		data: token
	});
});

module.exports = {path, route};