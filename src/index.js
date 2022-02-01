// Get env variable
require("dotenv").config();
// Import necessary tools
const Express = require("express");
const cors = require("cors");
// Import APIs
const user = require("./api/user");

const app = Express();
const port = process.env.PORT || 3001;

// Apply Middlewares
app.use(cors());
app.use(Express.urlencoded({extended: true}));
app.use(Express.json());

// Mount APIs
app.use(user.path, user.route);

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