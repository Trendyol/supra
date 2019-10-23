Documentation will be released soon.


[![CircleCI](https://circleci.com/gh/Trendyol/supra.svg?style=svg)](https://circleci.com/gh/Trendyol/supra) [![codecov](https://codecov.io/gh/Trendyol/supra/branch/master/graph/badge.svg)](https://codecov.io/gh/Trendyol/supra) [![npm version](https://badge.fury.io/js/supra-http.svg)](https://www.npmjs.com/package/supra-http)

```js
client.request('browsingConfigurationRequest', 'https://api.trendyol.com/mwebbrowsinggw/', {
  timeout: 300,
  allowWarmUp: true,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
  enabled: false,
  method: 'get',
  json: true
})
  .then(response => console.log(response.json))
  .catch(_ => console.log(_));
```
