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
		let result = {
			caption: "Utilisateur non vérifié !",
			status: 0
		};
		if(bearer) {
			const token = bearer.replace("Bearer ", "");
			result.status = 1;
			result.caption = "Utilisateur vérifié !";
			try {
				result.payload = jwt.verify(token, process.env.JWT_SECRET);
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
		res.locals.level = 0;
		if(bearer) {
			let user = null;
			const token = bearer.replace("Bearer ", "");
			try {
				user = jwt.verify(token, process.env.JWT_SECRET);
			} catch(e) {
				console.log(e);
			}
			if(user)
				res.locals.level = user.data.level;
		}
		next();
	}
};

module.exports = Auth;