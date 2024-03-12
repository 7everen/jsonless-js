# JsonLess <img src="https://raw.githubusercontent.com/7everen/jsonless-js/main/icons/icon-32.png" alt="icon for jsonless compressor/obfuscator">

Is a JavaScript library that compresses and obfuscates JSON.

## Introduction
It was designed for performant compress large JSON which has duplicated data properties like in the example:
```json
{
 "player1": {
   "EfficiencyGameScore": 0,
   "FastBreakPointsAttempted": 0,
   "FastBreakPointsMade": 0
  },
  "player2": {
   "EfficiencyGameScore": 3,
   "FastBreakPointsAttempted": 2,
   "FastBreakPointsMade": 0
  },
   ...
}

```

Benefits:
- Can be achieved `2-10` times less size depending on data.
- More secure sending data, make it unreadable.
- Cost-efficient than compression.
- Support multiple languages
  - [Rust/C/C++](https://github.com/7everen/jsonless-rs)

## Performance
| Libraries      | Compress time (seconds) | Original size to Compressed (times) |                
|:---------------|------------------------:|------------------------------------:|
| jsonpack       |                   2.532 |                                 2.3 |
| compressjs     |                   2.250 |                                 3.9 |
| gzip           |                   0.865 |                                 7.1 |
| jsonless-js    |                   0.261 |                                 4.3 |

> **NOTE**  
> Used the next [JSON Data](https://raw.githubusercontent.com/7everen/jsonless-js/main/test/test.json) with `1000` iteration.
>
> Links: [gzip](https://www.npmjs.com/package/zlib), [compressjs](https://www.npmjs.com/package/compressjs), [jsonpack](https://www.npmjs.com/package/jsonpack)


## Encode

Example how to encode object to encoded object
```js
var jsonless = require('jsonless-js');

var obj = {...};
var encodedObj = jsonless.encode(obj, options);

```

Each encoded object consists `signature`. It is map of property names. It can be used as a key for decrypting encoded object.

Example how to remove signature from encoded object
```js
var jsonless = require('jsonless-js');

var encodedObjWithoutSignature = jsonless.withoutSignature(encodedObj);

```

Example how to get signature from encoded object
```js
var jsonless = require('jsonless-js');

var signature = jsonless.getSignature(encodedObj);

```

## Decode

Example how to decode object
```js
var jsonless = require('jsonless-js');

var encodedObjWithSignature = [...];
var decodedObj = jsonless.decode(encodedObjWithSignature);

```

Example how to decode object with removed signature
```js
var jsonless = require('jsonless-js');

var encodedObjWithoutSignature = [...];
var signature = [...];
var options = {
    "signature": signature
}
var decodedObj = jsonless.decode(encodedObjWithoutSignature, options);

```