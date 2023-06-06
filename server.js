const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello, Express.js backend!');
});

async function fetchNewsData(apiKey, language, additionalParams, res, maxApiCall = 7) {
  let newsAPIUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=${language}&${additionalParams}`;
  let allData = [];
  let apiCallCount = 1;

  try {
    let response = await axios.get(newsAPIUrl);
    allData = allData.concat(response.data.results);

    while (response.data.nextPage && apiCallCount < maxApiCall) {
      newsAPIUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=${language}&${additionalParams}&page=${response.data.nextPage}`;

      response = await axios.get(newsAPIUrl);
      allData = allData.concat(response.data.results);
      apiCallCount++;
    }

    res.json(allData);
  } catch (error) {
    console.error(`Error fetching news data: ${error}`);
    res.status(500).json({ message: 'Error fetching news data' });
  }
}

app.get('/news', (req, res) => fetchNewsData('pub_2225624548c8092ce078a095582d68cb77ece', 'en', '', res));
app.get('/US', (req, res) => fetchNewsData('pub_2155396370a3a451ed30271a9cdec44e6c5c9', 'en', 'country=us', res, 1));
app.get('/category', (req, res) => fetchNewsData('pub_2155396370a3a451ed30271a9cdec44e6c5c9', 'en', `category=${req.query.category}`, res, 5));
app.get('/search', (req, res) => fetchNewsData('pub_2225624548c8092ce078a095582d68cb77ece', 'en', `q=${req.query.term}`, res, 5));
app.get('/country', (req, res) => fetchNewsData('pub_2155396370a3a451ed30271a9cdec44e6c5c9', 'en', `country=${req.query.country}`, res, 5));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
