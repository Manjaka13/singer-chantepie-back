const nodeJsonDb = require("node-json-db");
const uuidv4 = require("uuid").v4;

/*
	Database class
	For getting and saving data
*/

class Database {
	constructor(name) {
		const JsonDB = nodeJsonDb.JsonDB;
		const humanReadable = process.env.DEV ? true : false;
		this.db = new JsonDB(`database/${name || 'db'}`, true, humanReadable, "/");
		this.prefix = "/data";
	}

	// Pushes new data to be added in the tabe
	push(data) {
		if(!data._id)
			data._id = uuidv4();
		this.db.push(this.prefix, [data], false);
	}

	// Gets saved data
	get(key, value) {
		let data = [];
		try {
			data = this.db.getData(this.prefix);
		} catch(e) {
			console.log("Could not get data.");
			return [];
		}
		if(typeof key === "undefined" || typeof value === "undefined")
			return data;
		else {
			let found = data.filter(item => item[key] && item[key] === value);
			if(found.length === 0)
				found = null;
			else if(found.length === 1)
				found = found[0];
			return found;
		}
	}

	// Resets table content
	flush() {
		this.db.push(this.prefix, []);
	}

	// Removes an entry in table
	remove(key, value) {
		this.db.push(this.prefix, this.get().filter(item => item[key] != value));
	}
}

module.exports = Database;