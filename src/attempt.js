/*
	Record and check login attempts
*/

const Database = require("./database");

class Attempt {
	get(user) {
		let nextAttempt = 1;
		const database = new Database(process.env.DB_ATTEMP);
		const loginAttempt = database.get("email", user.email);
		database.remove("email", user.email);
		if(loginAttempt && loginAttempt.attempts)
			nextAttempt = loginAttempt.attempts + 1;
		database.push({
			email: user.email,
			attempts: nextAttempt
		});
		return nextAttempt;
	}

	reset(user) {
		const database = new Database(process.env.DB_ATTEMP);
		database.remove("email", user.email);
	}
}

module.exports = Attempt;