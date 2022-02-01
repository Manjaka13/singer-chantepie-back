/*
	For authentication with JWT
*/

const jwt = require("jsonwebtoken");

class Auth {
	constructor(secret) {
		this.secret = process.env.SECRET;
	}

	// Sign user
	sign(user) {
		return jwt.sign({
			exp: Math.floor(Date.now() / 1000) + (60 * 60),
			data: user
		}, this.secret);
	}

	// Verify user
	verify(user, token) {
		let result = null;
		try {
			result = jwt.verify(token, this.secret);
		} catch(e) {
			console.log("Invalid token");
		}
		if(result) {
			if(user.name === result.data.name && user.password === result.data.password)
				return true;
		}
		return false;
	}
}

module.exports = Auth;