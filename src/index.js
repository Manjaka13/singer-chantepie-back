/*
	Server entry point
*/

// Import and configure everything needed
require("dotenv").config();
const Express = require("express");
const cors = require("cors");
const user = require("./api/user");
const contacts = require("./api/contacts");

// Setup
const app = Express();
const port = process.env.PORT || 3001;
const welcomeMessage = `Singer Chantepie server running on port ${port}`;

// Apply middlewares
app.use(cors());
app.use(Express.urlencoded({extended: true}));
app.use(Express.json());

// Mount APIs
app.use(user.path, user.route);
app.use(contacts.path, contacts.route);

// Default home route
app.get("/", (req, res) => {
	res.json({
		caption: welcomeMessage,
		status: 1
	});
});

// Listen
app.listen(port, () => {
	console.log(welcomeMessage);
});