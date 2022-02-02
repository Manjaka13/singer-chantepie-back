/*
	User APIs
*/

const Express = require("express");
const auth = require("../auth");
const Database = require("../database");
const route = Express.Router();
const path = "/user/";

// Get all users
route.get("/", auth.isLogged, (req, res) => {
	let result = {
		caption: "Privilèges insuffisants.",
		status: 0
	};
	if(res.locals.user.level >= 1)
		result = {
			caption: "Liste des comptes",
			status: 1,
			payload: new Database(process.env.DB_USERS).get().map(user => {
				delete user._id;
				delete user.password;
				return user;
			})
		};
	res.json(result);
});

// Sign in incoming user
route.post("/sign", (req, res) => {
	res.json(auth.sign(req));
});

// Verifies token
route.get("/verify", (req, res) => {
	res.json(auth.verify(req));
});

// Creates new user
route.post("/new", auth.isLogged, (req, res) => {
	res.json(auth.create(req, res));
});

// Creates new user
route.delete("/delete", auth.isLogged, (req, res) => {
	res.json(auth.remove(req, res));
});

module.exports = {path, route};