/*
	Record and check login attempts
*/

const Database = require("./database");

const Attempt = {
	get: (user) => {
		let nextAttempt = 1;
		const database = new Database(process.env.DB_ATTEMPTS);
		const loginAttempt = database.get("email", user.email);
		database.remove("email", user.email);
		if(loginAttempt && loginAttempt.attempts)
			nextAttempt = loginAttempt.attempts + 1;
		database.push({
			email: user.email,
			attempts: nextAttempt
		});
		return (3 - nextAttempt);
	},

	reset: (user) => {
		const database = new Database(process.env.DB_ATTEMPTS);
		database.remove("email", user.email);
	}
};

module.exports = Attempt;