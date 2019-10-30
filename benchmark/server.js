const http = require('http');
const supra = require('../dist');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    supra.request('browsingConfigurationRequest', 'http://localhost:4406/package-lock.json', {
      httpTimeout: 500,
      allowWarmUp: true,
      errorThresholdPercentage: 50,
      resetTimeout: 10000,
      enabled: true,
      method: 'get',
      json: true
    })
      .then(response => {
        res.end(response.body);
      })
      .catch(_ => {
        res.statusCode = 500;
        res.end();
      });
  } else {
    res.statusCode = 404;
    res.end();
  }
});

server.listen(8080);
