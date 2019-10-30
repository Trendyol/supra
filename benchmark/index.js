const Benchmark = require('benchmark');
const supra = require('../dist');
const nock = require('nock');
const http = require('http');
const faker = require('faker');
const request = require('request');
const zlib = require('zlib');
const requestretry = require('requestretry');

const suite = Benchmark.Suite();

const host = 'http://localhost:4406';
const path = '/package-lock.json';


const compressedMessage = zlib.gzipSync(JSON.stringify(faker.helpers.createTransaction()));

const scope = nock(host)
  .get(path)
  .reply(200, compressedMessage, {
    'content-encoding': 'gzip'
  })
  .persist(true);

suite.add('supra with circuit warmup', {
  defer: true,
  fn: defer =>
    supra.request('requestName', host + path, {
      enabled: true,
      allowWarmUp: true,
      timeout: 100,
      json: true
    })
      .then(res => defer.resolve(res))
      .catch(err => {
        throw err
      })
});


suite.add('supra with circuit', {
  defer: true,
  fn: defer =>
    supra.request('requestName', host + path, {
      enabled: true,
      allowWarmUp: true,
      timeout: 100,
      json: true
    })
      .then(res => defer.resolve(res))
      .catch(err => {
        throw err
      })
});


suite.add('supra without circuit', {
  defer: true,
  fn: defer =>
    supra.request('requestName', host + path, {
      enabled: false
    })
      .then(res => defer.resolve(res))
      .catch(err => {
        throw err
      })
});

suite.add('requestretry', {
  defer: true,
  fn: defer => {
    return requestretry(host + path, {
      gzip: true,
      json: true,
      timeout: 100,
      maxRetry: 0
    }, function (error, response, body) {
      if (error) {
        throw error
      }
      return defer.resolve(body);
    })
  }
});

suite.add('request', {
  defer: true,
  fn: defer => {
    return request(host + path, {
      gzip: true,
      json: true,
      timeout: 100
    }, function (error, response, body) {
      if (error) {
        throw error
      }
      return defer.resolve(body);
    })
  }
});

suite.add('native http request 1.0', {
  defer: true,
  fn: defer =>
    http.get(host + path, {timeout: 100}, res => {
      let body = '';
      const gunzip = zlib.createGunzip();
      gunzip.on('data', data => {
        body += data
      });
      gunzip.on('end', () => {
        return defer.resolve(JSON.parse(body));
      });
      gunzip.on('error', () => {
        throw new Error();
      })

      res.pipe(gunzip);
    })
});

suite.add('native http request 1.1', {
  defer: true,
  fn: defer =>
    http.get(host + path, {agent: new http.Agent({keepAlive: true}), timeout: 100}, res => {
      let body = '';
      const gunzip = zlib.createGunzip();
      gunzip.on('data', data => {
        body += data
      });
      gunzip.on('end', () => {
        return defer.resolve(JSON.parse(body));
      });
      gunzip.on('error', () => {
        throw new Error();
      });

      res.pipe(gunzip);
    })
});

supra.request('requestName', host + path, {
  enabled: true,
  allowWarmUp: true,
  timeout: 100,
  json: true
})
  .then(res => console.log('Warmed Up'))
  .then(() => {
    suite.run({
      async: true
    });
  });


suite.on('complete', function () {
  console.log(this[0].toString());
  console.log(this[1].toString());
  console.log(this[2].toString());
  console.log(this[3].toString());
  console.log(this[4].toString());
  console.log(this[5].toString());
  console.log(this[6].toString());
});
