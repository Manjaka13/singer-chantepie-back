/*
	For authentication
*/

const jwt = require("jsonwebtoken");
const Database = require("./database");
const attempt = require("./attempt");

const Auth = {
	// Signs user in, returns token and full user data
	sign: (req) => {
		const user = req.body;
		const remainingTries = attempt.get(user);
		let result = {
			payload: null,
			caption: "",
			status: 0
		};
		if(!user || typeof user.email != "string" || typeof user.password != "string")
			result.caption = "Veuillez communiquer un email et un mot de passe.";
		else {
			const expiration = (parseInt(process.env.JWT_EXP) || 3600);
			const db = new Database(process.env.DB_USERS);
			const authUser = db.get("email", user.email);

			// Wrong email
			if(!authUser)
				result.caption = "Cet utilisateur n'existe pas.";
			// Wrong password
			else if (authUser.password != user.password) {
				if(remainingTries <= 0)
					result.caption = "Ce compte est bloqué, veuillez contacter un admnistrateur.";
				else
					result.caption = `Mot de passe invalide. ${remainingTries} essai(s) restants`;
			}
			// Unverified account
			else if(!authUser.verified)
				result.caption = "Ce compte n'a pas encore été vérifié.";
			// Generate token
			else {
				result.status = 1;
				delete authUser._id;
				delete authUser.verified;
				delete authUser.password;
				result.caption = jwt.sign({
					exp: Math.floor(Date.now() / 1000) + expiration,
					data: authUser
				}, process.env.JWT_SECRET);
				result.payload = authUser;
				attempt.reset(authUser);
			}
		}
		return result;
	},

	// Verifies token
	verify: (req) => {
		const bearer = req.headers.authorization;
		let result = {
			caption: "Utilisateur inconnu",
			status: 0
		};
		if(bearer) {
			const token = bearer.replace("Bearer ", "");
			const db = new Database(process.env.DB_USERS);
			try {
				const jwtUser = db.get("email", jwt.verify(token, process.env.JWT_SECRET).data.email);
				delete jwtUser._id;
				delete jwtUser.password;
				result.status = 1;
				result.caption = "Utilisateur vérifié !";
				result.payload = jwtUser;
			} catch(e) {
				console.log(e);
			}
		}
		return result;
	},

	// Auth verification middleware
	isLogged: (req, res, next) => {
		const bearer = req.headers.authorization;
		res.locals.user = null;
		if(bearer) {
			let tokenUser = null;
			const token = bearer.replace("Bearer ", "");
			try {
				tokenUser = jwt.verify(token, process.env.JWT_SECRET);
			} catch(e) {
				console.log(e);
			}
			if(tokenUser)
				res.locals.user = {...tokenUser.data};
		}
		next();
	},

	// Creates new user
	create: (req, res) => {
		const userLevel = res.locals.user.level;
		let result = {
			caption: "",
			status: 0
		};
		if(userLevel < 2)
			result.caption = "Privilèges insuffisants.";
		else {
			const user = req.body;
			const db = new Database(process.env.DB_USERS);
			if(typeof user.newName != "string" || user.newName.length <= 2)
				result.caption = "Le nom doit contenir 3 caractères minimum.";
			else if(typeof user.newEmail != "string" || user.newEmail.length <= 6)
				result.caption = "L'e-mail est invalide.";
			else if(typeof user.newPassword != "string" || user.newPassword.length <= 4)
				result.caption = "Le mot de passe doit contenir 5 caractères minimum.";
			else {
				const exists = db.get("email", user.newEmail);
				if(exists)
					result.caption = "Cet utilisateur existe déjà !";
				else {
					db.push({
						email: user.newEmail,
						password: user.newPassword,
						name: user.newName,
						level: 1,
						verified: false
					});
					result.caption = "Compte créé avec succès, veuillez vérifier votre e-mail !";
					result.status = 1;
				}
			}
		}
		return result;
	},

	// Removes user
	remove: (req, res) => {
		const admin = res.locals.user;
		const email = req.body.email;
		let result = {
			caption: "",
			status: 0
		};
		if(!admin || admin.level < 2)
			result.caption = "Privilèges insuffisants.";
		else if(typeof email != "string")
			result.caption = "Renseigner l'email du compte à supprimer.";
		else if (email === admin.email)
			result.caption = "Impossible de supprimer votre propre compte !";
		else {
			const db = new Database(process.env.DB_USERS);
			if(!db.get("email", email))
				result.caption = "Ce compte n'existe pas !";
			else {
				db.remove("email", email);
				result.caption = `${email} supprimé avec succès !`;
				result.status = 1;
			}
		}
		return result;
	}
};

module.exports = Auth;