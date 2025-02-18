Documentation will be released soon.


[![CircleCI](https://circleci.com/gh/Trendyol/supra.svg?style=svg)](https://circleci.com/gh/Trendyol/supra) [![codecov](https://codecov.io/gh/Trendyol/supra/branch/master/graph/badge.svg)](https://codecov.io/gh/Trendyol/supra) [![npm version](https://badge.fury.io/js/supra-http.svg)](https://www.npmjs.com/package/supra-http)

## Installing
```bash
npm i supra-http
```

## Simple Usage

### Get
```js
client.request('apiCallName', 'https://my-api/endpoint', {
  method: 'get',
  json: true
})
  .then(response => console.log(response.json))
  .catch(_ => console.log(_));
```

### Post
```js
client.request('apiCallName', 'https://my-api/endpoint', {
  method: 'post',
  body: {
    test: true  
  },
  json: true
})
  .then(response => console.log(response.json))
  .catch(_ => console.log(_));
```

### Circuit Breaking
```js
client.request('apiCallName', 'https://my-api/endpoint', {
  timeout: 1000,
  allowWarmUp: true,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
  enabled: true,
  method: 'get',
  json: true
})
  .then(response => console.log(response.json))
  .catch(_ => console.log(_));
```

You can read more about properties from [opossum](https://github.com/nodeshift/opossum).

### Decompression
Supra supports gzip and brotli decompressions over zlib. So it requires at least NodeJs 10.17.x

### Benchmarks
```
supra with circuit x 8,779 ops/sec ±3.31% (76 runs sampled)
supra without circuit x 8,625 ops/sec ±4.68% (68 runs sampled)
requestretry x 3,672 ops/sec ±7.24% (67 runs sampled)
request x 5,092 ops/sec ±4.42% (73 runs sampled)
native http request 1.0 x 9,874 ops/sec ±5.82% (67 runs sampled)
native http request 1.1 x 9,681 ops/sec ±6.36% (73 runs sampled)
```
