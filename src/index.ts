import "dotenv/config";
import path from "node:path";
import express from "express";
import nunjucks from "nunjucks";
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

app.use(express.static(path.join(__dirname, "..", "public")));

app.use((req, res, next) => {
	res.locals.currentPath = req.path;
	next();
});

app.use(router);

app.listen(port, () => {
	console.log(`Frontend running at http://localhost:${port}`);
} );
