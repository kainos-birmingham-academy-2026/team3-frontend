import dotenv from 'dotenv';
import express from 'express';
import nunjucks from 'nunjucks';
import router from './routes';


const app = express();
const port = 3000;

app.use(router);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});