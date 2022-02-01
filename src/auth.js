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
		const user = {
			email: req.body.email,
			password: req.body.password,
		};
		let result = {
			caption: "Utilisateur non vérifié !",
			status: 0
		};
		if(bearer && typeof user.email === "string" && typeof user.password === "string") {
			const token = bearer.replace("Bearer ", "");
			result.status = 1;
			result.caption = "Utilisateur vérifié !";
			try {
				result.payload = jwt.verify(token, process.env.JWT_SECRET);
				if(result.payload.data.email != user.email || result.payload.data.password != user.password) {
					result.payload = null;
					result.status = 0;
					result.caption = "Utilisateur non vérifié !";
				}
			} catch(e) {
				result.payload = null;
				result.status = 0;
				result.caption = "Utilisateur non vérifié !";
			}
		}
		return result;
	},

	// Auth verification middleware
	isLogged: (req, res, next) => {
		const bearer = req.headers.authorization;
		const user = {
			email: req.body.email,
			password: req.body.password,
		};
		res.locals.level = 0;
		if(bearer && typeof user.email === "string" && typeof user.password === "string") {
			let tokenUser = null;
			const token = bearer.replace("Bearer ", "");
			try {
				tokenUser = jwt.verify(token, process.env.JWT_SECRET);
				if(tokenUser.data.email != user.email || tokenUser.data.password != user.password)
					tokenUser = null;
			} catch(e) {
				console.log(e);
			}
			if(tokenUser)
				res.locals.level = tokenUser.data.level;
		}
		next();
	},

	// Creates new user
	create: (req, res) => {
		const userLevel = res.locals.level;
		let result = {
			caption: "",
			status: 0
		};
		if(userLevel < 2)
			result.caption = "Ce compte ne permet pas ce genre d'action.";
		else {
			const user = req.body;
			const database = new Database(process.env.DB_USERS);
			if(typeof user.newName != "string" || user.newName.length <= 2)
				result.caption = "Le nom doit contenir 3 caractères minimum.";
			else if(typeof user.newEmail != "string" || user.newEmail.length <= 6)
				result.caption = "L'e-mail est invalide.";
			else if(typeof user.newPassword != "string" || user.newPassword.length <= 4)
				result.caption = "Le mot de passe doit contenir 5 caractères minimum.";
			else {
				const exists = database.get("email", user.newEmail);
				if(exists)
					result.caption = "Cet utilisateur existe déjà !";
				else {
					database.push({
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
	}
};

module.exports = Auth;