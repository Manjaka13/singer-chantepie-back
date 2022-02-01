/*
	For authentication with JWT
*/

const jwt = require("jsonwebtoken");
const Database = require("./database");

class Auth {
	constructor() {
		this.secret = process.env.SECRET;
		this.table = process.env.DB_USERS;
	}

	// Sign user
	generate(user) {
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
			if(user.email === result.data.email && user.password === result.data.password)
				return true;
		}
		return false;
	}

	// Returns corresponding user
	get(user) {
		const database = new Database(this.table);
		const authUser = database.get().filter(item =>
			item.email === user.email &&
			item.password === user.password
		);
		return authUser[0] || null;
	}
}

module.exports = Auth;