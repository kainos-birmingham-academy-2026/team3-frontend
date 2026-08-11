import "dotenv/config";
import path from "node:path";
import express from "express";
import session from "express-session";
import nunjucks from "nunjucks";
import authRouter from "./routes/authRouter";
import router from "./routes/jobRoleRouter";

const app = express();
const port = Number(process.env.PORT) ?? "3000";
const isDev = process.env.NODE_ENV !== "production";

nunjucks.configure(
	[
		path.join(__dirname, "views"),
		path.join(__dirname, "..", "node_modules", "dist"),
	],
	{
	  autoescape: true,
	  express: app,
	  watch: false,
	  noCache: isDev,
	},
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public")));

// Persist login state across requests so protected routes can read req.session.jwtToken.
app.use(
	session({
		secret: process.env.SESSION_SECRET ?? "dev-session-secret",
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 1000 * 60 * 60,
		},
	}),
);

app.use((req, res, next) => {
	res.locals.currentPath = req.path;
	next();
});

// Expose auth state to all templates for sign in/sign out navigation.
app.use((req, res, next) => {
	res.locals.isAuthenticated = Boolean(req.session.jwtToken);
	next();
});

app.use(authRouter);
app.use(router);

app.listen(port, () => {
	console.log(`Frontend running at http://localhost:${port}`);
} );
