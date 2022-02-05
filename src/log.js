/*
	Log API calls
*/

const log = (path, req) => {
	console.log(`Route: ${path}`);
	console.log(`Authorization: ${JSON.stringify(req.headers.authorization)}`);
	console.log(`Body: ${JSON.stringify(req.body)}`);
	console.log("");
};

module.exports = log;