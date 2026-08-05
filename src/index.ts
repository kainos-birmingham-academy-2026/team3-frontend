import dotenv from "dotenv";
import express from "express";
import nunjucks from "nunjucks";
import router from "./routes/routes";
import path, { dirname } from "path";


const app = express();
const port = 3000;
const isDev = process.env.NODE_ENV !== "production";

nunjucks.configure(
	[
		path.join(__dirname, "views"),
		path.join(__dirname, "..", "node_modules", "dist"),
	],
	{
	  autoescape: true,
	  express: app,
	  watch: isDev,
	  noCache: isDev,
	},
);

app.use(router);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);  
} );
