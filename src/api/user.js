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

/*
route.delete("/delete", (req, res) => {
	const email = req.body.email;
	const database = new Database(process.env.DB_USERS);
	let result = "";
	let status = 0;
	if(typeof email != "string" || email.length <= 6)
		result = "E-mail invalide";
	else {
		database.remove("email", email);
		result = "Utilisateur supprimé avec succès !";
		status = 1;
	}
	res.json({
		data: result,
		status
	});
});
*/

module.exports = {path, route};