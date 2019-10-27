Documentation will be released soon.


[![CircleCI](https://circleci.com/gh/Trendyol/supra.svg?style=svg)](https://circleci.com/gh/Trendyol/supra) [![codecov](https://codecov.io/gh/Trendyol/supra/branch/master/graph/badge.svg)](https://codecov.io/gh/Trendyol/supra) [![npm version](https://badge.fury.io/js/supra-http.svg)](https://www.npmjs.com/package/supra-http)

## Installing
```bash
npm i supra-http
```


## Simple Usage

### Get
```js
client.request('browsingConfigurationRequest', 'https://api.trendyol.com/mwebbrowsinggw/', {
  method: 'get',
  json: true
})
  .then(response => console.log(response.json))
  .catch(_ => console.log(_));
```

### Post
```js
client.request('browsingConfigurationRequest', 'https://api.trendyol.com/mwebbrowsinggw/', {
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
client.request('browsingConfigurationRequest', 'https://api.trendyol.com/mwebbrowsinggw/', {
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

You can read more about properties from ![opossum](https://github.com/nodeshift/opossum).
