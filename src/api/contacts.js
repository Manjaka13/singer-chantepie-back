/*
	User APIs
*/

const Express = require("express");
const auth = require("../auth");
const Database = require("../database");
const route = Express.Router();
const log = require("../log");
const path = "/contacts/";

// Get all contacts
route.get("/", auth.isLogged, (req, res) => {
	let result = {
		caption: "Privilèges insuffisants.",
		status: 0
	};
	log("contacts/", req);
	if(res.locals.user && res.locals.user.level >= 1)
		result = {
			caption: "Liste des contacts",
			status: 1,
			payload: new Database(process.env.DB_CONTACTS).get().map(user => {
				delete user._id;
				return user;
			})
		};
	res.json(result);
});

// Add new contact
route.post("/new", (req, res) => {
	const d = new Date().getDate();
	const m = new Date().getMonth();
	const y = new Date().getFullYear();
	const now = `${d < 10 ? '0' + d : d}/${m < 10 ? '0' + m : m}/${y}`;
	const {email} = req.body;
	const result = {
		caption: "Une erreur est survenue.",
		status: 0
	};

	log("contacts/new", req);

	if(typeof email != "string" || email.length < 8)
		result.caption = "Renseigner votre e-mail.";
	else {
		const db = new Database(process.env.DB_CONTACTS);
		const savedContact = db.get("email", email);
		if(!savedContact || savedContact.length === 0) {
			db.push({
				email,
				date: now
			});
			result.caption = "Adresse enregistrée avec succès !";
			result.status = 1;
		}
		else result.caption = "Adresse déjà enregistrée !"
	}

	res.json(result);
});

// Remove contact
route.post("/delete", auth.isLogged, (req, res) => {
	const admin = res.locals.user;
	const {email} = req.body;
	let result = {
		caption: "",
		status: 0
	};
	log("contacts/delete", req);
	if(!admin || admin.level < 2)
		result.caption = "Privilèges insuffisants.";
	else if(typeof email != "string")
		result.caption = "Renseigner l'email à supprimer.";
	else {
		const db = new Database(process.env.DB_CONTACTS);
		if(!db.get("email", email))
			result.caption = "Ce contact n'existe pas !";
		else {
			db.remove("email", email);
			result.caption = `${email} supprimé avec succès !`;
			result.status = 1;
		}
	}
	res.json(result);
});

module.exports = {path, route};