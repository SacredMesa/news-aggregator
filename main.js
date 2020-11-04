// Libraries

const express = require('express');
const handlebars = require('express-handlebars');
const fetch = require('node-fetch');
const withQuery = require('with-query').default;

// Configure environment
const PORT = parseInt(process.argv[2] || process.env.APP_PORT) || 3000
const API_KEY = process.env.API_KEY || "";

const ENDPOINT = 'https://newsapi.org/v2/top-headlines';

const headers = {
  'X-Api-Key': API_KEY
}

// Instances
const app = express();

// Express configuration
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/static'));

// Handlebars configuration
app.engine('hbs', handlebars({
    defaultLayout: 'default.hbs'
}));
app.set('view engine', 'hbs');
// app.set('views', __dirname + '/views'); //Check to see if can delete

// handlebars.registerHelper('splitTime', function (a) {
// return a.split('T').join(' ').slice(0, -1);

// Routers
app.get('/', (req, res) => {
    res.status(200);
    res.type('text/html');
    res.render('index');
})

app.get('/search', async (req, res) => {
    res.status(200);
    res.type('text/html');

    const search = req.query['news_search'];
    const country = req.query['country'];
    const category = req.query['category'];

    const url = withQuery(
        ENDPOINT, {
            country: country,
            q: search,
            category: category,
            // apiKey: API_KEY
        }
    );

    let result = await fetch(url, {headers});

    try {
        const rawNews = await result.json();
        const newsArr = rawNews.articles;
        res.render('results-cards', {
            newsArr,
            hasContent: !!newsArr.length
        });

    } catch (e) {
        console.error('error');
        return Promise.reject(e);
    }
})

// Start Express
if (API_KEY) {
    app.listen(PORT, () => {
        console.log(`Application started on port ${PORT} at ${new Date}`);
        console.log(`With key ${API_KEY}`);
    });
} else {
    console.error(`API_KEY is not set`);
}