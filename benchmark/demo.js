const supra = require('../dist');

const http = require('http');
const axios = require('axios');




const server = http.createServer((req, res) => {
  if (req.url === '/') {
    supra.request('requestName', 'http://api-dc1.trendyol.com/seoblacklistapi/v2/bulk-blacklist', {
      enabled: false,
      method: 'post',
      httpTimeout: 1,
      json: true,
      body: {
        "paths": [
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
          "/yaygan-silgi-x-b887-c104139",
        ]
      },
      compressRequest: true
    })
      .then((respo) => {
        res.end(respo.body);
      })
      .catch(err => {
        console.log(err);
        res.statusCode = 500;
        res.end();
        throw err
      })
  }
})

server.listen(5543);


