/*
	For authentication with JWT
*/

const jwt = require("jsonwebtoken");
const Database = require("./database");

class Auth {
	constructor(secret) {
		this.secret = process.env.SECRET;
		this.table = "users";
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

	// Returns valid token if correct credentials
	login(user) {
		let token = null;
		const database = new Database(this.table);
		const authUser = database.get().filter(item =>
			item.name === user.name &&
			item.password === user.password
		);
		if(authUser.length > 0)
			token = this.sign(user);
		return token;
	}
}

module.exports = Auth;