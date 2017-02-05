
# ATT Usage Scraper

This is a simple Node module to download and parse your current month's billed usage from the ATT customer portal. **Fair warning: this project is not associated with or supported by ATT; you should personally consult your customer service agreement and other applicable terms prior to using.**

This module handles scraping of the CSV export and (optionally) parsing. Because the raw download format is rather poor for automated consumption/analysis, parsing is performed by default.

## Installation

```bash
npm install --save @claygregory/att-usage
```

This project uses PhantomJS (via [Horseman](http://www.horsemanjs.org)), so also make sure PhantomJS is available in your path or you have the phantomjs-prebuilt/phantomjs npm package installed.

## Usage

### Basic Example

The `currentBilledUsage` function is called with the portal login creditials, returning a promise that will resolve to an array of line item objects (see format below), parsed from the downloaded CSV.

```javascript
const att_usage = require('@claygregory/att-usage');

att_usage.currentBilledUsage('<portal username or phone number>', '<portal password>')
  .then(usage => {
    usage.forEach(line => {
       //process each line item based on below object formats
    });
  });
```

#### Object Formats

Phone Call
```javascript
{
  type: 'Call',
  date: '1/24/2017',
  time: '02:29PM',
  contact: '<remote phone number>',
  direction: 'Incoming',
  duration_m: 20,
  user: '<mobile phone number>'
}
```

SMS/MMS
```javascript
{
  date: '01/24/2017',
  time: '07:57PM',
  contact: '<remote phone number>',
  type: 'Message',
  direction: 'Outgoing',
  user: '<mobile phone number>'
}
```

Date Transfer
```javascript
{
  date: '01/24/2017',
  time: '12:02PM',
  type: 'Data Transfer',
  size_kb: 263,
  user: '<mobile phone number>'
},
```

### Raw CSV Example

Alternatively, the options parameter can disable parsing of the resulting CSV. In this case, the returned promise will resolve to a string containing the raw CSV payload from the portal.

```javascript
const att_usage = require('@claygregory/att-usage');

att_usage.currentBilledUsage('<portal username or phone number>', '<portal password>', {parse: false})
  .then(csvString => {
    //process resulting string as CSV
  });
```

##License

See the included [LICENSE](LICENSE.md) for rights and limitations under the terms of the MIT license.