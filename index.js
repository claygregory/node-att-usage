'use strict';

const Horseman = require('node-horseman');
const csv_parse = require('csv-parse/lib/sync');

const optionDefaults = {
  parse: true
};

module.exports.currentBilledUsage = function(username, password, options) {

  options = Object.assign({}, optionDefaults, options || {});

  const horseman = new Horseman({timeout: 120 * 1000, injectJquery: false });
  return horseman
    .userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14')
    .open('https://www.att.com/olam/loginAction.olamexecute')
    .type('#password', password)
    .type('#userName', username)
    .click('#loginButton')
    .waitForNextPage()
    .wait(2 * 1000)
    .open('https://www.att.com/olam/billUsageTiles.myworld')
    .click('#WebUsage1')
    .waitForNextPage()
    .download('https://www.att.com/pmt/jsp/mypayment/viewbill/download_csv/download_csv.jsp?reportActionEvent=A_VB_WIRELESS_DETAILS_DOWNLOAD_CSV_SUBMIT')
    .then((results) => {
      if (options.parse)
        return Promise.resolve(parseExport(results));
      else
        return Promise.resolve(results);
    })
    .finally(() => {
      horseman.close();
    });
};

function parseExport(data) {

  const lines = data
    .trim()
    .replace(/^\s*\n/gm, '')
    .split('\n')
    .map(l => l.trim());

  var number = '';
  var type = '';
  var results = [];
  lines.forEach((line) => {

    const columns = csv_parse(line)[0];

    if (line.startsWith('Mobile Number'))
      number = line.split(',')[1];

    else if (columns[0].includes(' Detail'))
      type = columns[0].split(' ')[0];

    else if (!isNaN(columns[0])) {
      if (type === 'Data') {
        const d = parseDataLine(columns);
        d.user = number;
        results.push(d);
      }
      else if (type === 'Call'){
        const c = parseCallLine(columns);
        c.user = number;
        results.push(c);
      }
    }
  });

  return results;
}

function parseDataLine(columns) {
  const data = {
    date: columns[2],
    time: columns[3],
  };
  if (columns[4].includes('Transfer')) {
    data.type = 'Data Transfer';
    data.size_kb = parseInt(columns[6].split(' ')[0].replace(/,/g, ''));
  } else{
    data.contact = columns[4];
    data.type = 'Message';
    data.direction = columns[5] === 'Rcvd' ? 'Incoming' : 'Outgoing';
  }

  return data;
}

function parseCallLine(columns) {
  return {
    type: 'Call',
    date: columns[2],
    time: columns[3],
    contact: columns[4],
    direction: columns[5] === 'INCOMING CL' ? 'Incoming' : 'Outgoing',
    duration_m: parseInt(columns[6])
  };
}