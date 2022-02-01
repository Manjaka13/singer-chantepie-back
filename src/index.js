// Get env variable
require("dotenv").config();
// Import necessary tools
const Express = require("express");
const cors = require("cors");
const Auth = require("./auth");
// Import APIs
const user = require("./api/user");
const secret = require("uuid").v4;

const app = Express();
const port = process.env.PORT || 3001;

// Apply Middlewares
app.use(cors());
app.use(Express.urlencoded({extended: true}));
app.use(Express.json());

// Mount APIs
app.use(user.path, user.route);

// const auth = new Auth();
// const u1 = {
// 	name: "Manjaka",
// 	password: "hello"
// };
// const u2 = {
// 	name: "Manjaka2",
// 	password: "hello"
// };
// let token = auth.sign(u1);
// console.log("Token ", token);
// console.log("-----------------------");
// console.log("Verification ", auth.verify(u1, token));
// console.log("Verification ", auth.verify(u2, token));

// Default home route
app.get("/", (req, res) => {
	res.json({
		"data": "Singer Chantepie server."
	});
});

// Listen
app.listen(port, () => {
	console.log("Singer Chantepie server running on port " + port);
});