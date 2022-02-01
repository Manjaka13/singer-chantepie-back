/*
	User APIs
*/

const Express = require("express");
const Auth = require("../auth");
const Database = require("../database");
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
	const authUser = auth.get(user);
	let status = 0;
	let result = null;
	let payload = null;
	if(authUser) {
		if(!authUser.verified)
			result = "Le compte de cet utilisateur n'est pas encore vérifié.";
		else {
			result = auth.generate(user);
			status = 1;
			authUser.password = null;
			payload = authUser;
		}
	}
	else
		result = "Veuillez vérifier vos identifiants.";
	res.json({
		data: result,
		payload,
		status
	});
});

// Creates new user
route.post("/new", (req, res) => {
	const user = req.body;
	const database = new Database(process.env.DB_USERS);
	let result = "";
	let status = 0;
	if(typeof user.name != "string" || user.name.length <= 2)
		result = "Le nom doit contenir 3 caractères minimum.";
	else if(typeof user.email != "string" || user.email.length <= 6)
		result = "L'e-mail est invalide.";
	else if(typeof user.password != "string" || user.password.length <= 4)
		result = "Le mot de passe doit contenir 5 caractères minimum.";
	else {
		const exists = database.get("email", user.email);
		if(exists)
			result = "Cet utilisateur existe déjà.";
		else {
			database.push({
				...user,
				verified: false
			});
			result = "Compte créé avec succès, veuillez vérifier votre e-mail !";
			status = 1;
		}
	}
	res.json({
		data: result,
		status
	});
});

// Remove user
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

// 404 route
route.post("/*", (req, res) => {
	res.json({
		data: "URL de requête invalide.",
		status: 0
	});
});

module.exports = {path, route};