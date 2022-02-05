/*
	User APIs
*/

const Express = require("express");
const auth = require("../auth");
const Database = require("../database");
const route = Express.Router();
const log = require("../log");
const path = "/user/";

// Get all users
route.get("/", auth.isLogged, (req, res) => {
	let result = {
		caption: "Privilèges insuffisants.",
		status: 0
	};
	log("user/", req);
	if(res.locals.user && res.locals.user.level >= 1)
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
	log("user/sign", req);
	res.json(auth.sign(req));
});

// Verifies token
route.get("/verify", (req, res) => {
	log("user/verify", req);
	res.json(auth.verify(req));
});

// Creates new user
route.post("/new", auth.isLogged, (req, res) => {
	log("user/new", req);
	res.json(auth.create(req, res));
});

// Creates new user
route.post("/delete", auth.isLogged, (req, res) => {
	log("user/delete", req);
	res.json(auth.remove(req, res));
});

module.exports = {path, route};