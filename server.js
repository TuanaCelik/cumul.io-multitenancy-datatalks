require("dotenv").load();
const express = require("express");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const { join } = require("path");
const DashboardClient = require("./dashboardClient.js");

const app = express();

const authConfig = require("./auth_config.json");
const Cumulio = require("cumulio");

// Set this to false if you don't want custom theming on the dashboards
const custom_theme = true;
// This property is required when overriding themes, and will be used to set the widget backgrounds. By default, it is set to white.
const itemsBackground = "#ffffff";

// Set this to false if you don't want to use custom css. The current custom_css implementation will
const custom_css = true;

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

const client = new Cumulio({
  api_key: process.env.CUMULIO_API_KEY,
  api_token: process.env.CUMULIO_API_TOKEN,
});

dashboardClient = new DashboardClient();
let dashboards = dashboardClient.dashboards;

// To authorize dashboards
app.get("/authorization", checkJwt, (req, res) => {
  /************* Create Authorization Options ************************************/

  /************* Fill Metadata with User Parameters ******************************/

  /************* Fill Metadata with Anything Added From the Frontend *************/

  /************* Add Custom CSS **************************************************/

  /************* Add Custom Themes ***********************************************/

  /************* Create the Temporary Authorization Token ************************/
  return res.status(200).json({});
});

// To fetch all dashboards
app.get("/dashboards", checkJwt, (req, res) => {
  let scoped_dashboards = {};
  /*********** Get the scope of user access **********/

  /*********** Return dashboards the user has access to*************/

  return res.status(200).json(scoped_dashboards);
});

function getUserProperty(user, property) {
  return user[authConfig.namespace + property];
}
/************************ EXTRA AND HELPER FUNCTIONS ****************/

function checkDashboardUserAccess(user, dashboardId) {
  let accessGranted = false;
  let userScope = getUserProperty(user, "scope");
  dashboards.tabs.forEach((tab) => {
    if (
      userScope.dashboards.includes(
        tab.name.en.toLowerCase().replace(/\s/g, "_")
      ) &&
      tab.id === dashboardId
    ) {
      accessGranted = true;
    }
  });
  if (!accessGranted) {
    dashboards.drill_throughs.forEach((drill_through) => {
      if (
        userScope.dashboards.includes(
          drill_through.name.en.toLowerCase().replace(/\s/g, "_")
        ) &&
        drill_through.id === dashboardId
      ) {
        accessGranted = true;
      }
    });
  }
  return accessGranted;
}

// Serve static assets from the /public folder
app.use(express.static(join(__dirname, "public")));

// Endpoint to serve the configuration file
app.get("/auth_config.json", (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

app.use(function (err, req, res, next) {
  if (err) console.log(err);
  if (err.name === "UnauthorizedError") {
    return res.status(401).send({ msg: "Invalid token" });
  }
  next(err, req, res);
});

// Serve the index page for all other requests
app.get("/*", (req, res) => {
  res.sendFile(join(__dirname, "public/index.html"));
});

// Listen on port 3000 & get dashboards w tags
app.listen(3000, () => {
  console.log("Application running on port 3000");
  // ********* At startup, get all dashboards *********** //
});
