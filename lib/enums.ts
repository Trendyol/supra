enum CONTENT_TYPE {
  TextEventStream = 'text/event-stream',
  ApplicationJson = 'application/json',
  FormUrlEncoded = 'application/x-www-form-urlencoded'
}

enum CACHE_CONTROL {
  NoCache = 'no-cache'
}

enum CONNECTION {
  KeepAlive = 'keep-alive'
}

export {
  CONNECTION,
  CACHE_CONTROL,
  CONTENT_TYPE
}
