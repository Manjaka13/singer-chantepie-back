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
	const userLevel = res.locals.level;
	res.json({
		caption: `Requesting user level ${userLevel}`,
		status: 1,
		payload: userLevel
	});
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

/*
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
*/

module.exports = {path, route};