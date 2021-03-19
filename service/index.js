"use strict";

const cctx = require("ccxt");
const faunadb = require("faunadb");
const startOfHour = require("date-fns/startOfHour");
const subHours = require("date-fns/subHours");
const formatISO = require("date-fns/formatISO");
const memoize = require("lodash/memoize");

const ftx = new cctx.ftx({
  apiKey: process.env.FTX_API_KEY,
  secret: process.env.FTX_SECRET,
});

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNA_SECRET,
});
const q = faunadb.query;

const time = formatISO(startOfHour(subHours(new Date(), 1)));

const getRateFromDatabase = memoize(function (coin) {
  return faunaClient.query(
    q.Get(q.Match(q.Index("ftx_rates_by_coin_time"), [coin, q.Time(time)]))
  );
});

const getRatesFromFtx = memoize(function () {
  return ftx.privateGetSpotMarginLendingRates();
});

Promise.all([
  processCoin("DAI"),
  processCoin("EUR"),
  processCoin("USD"),
  processCoin("USDT"),
]);

function processCoin(targetedCoin) {
  return getRateFromDatabase(targetedCoin).catch(function (ret) {
    return getRatesFromFtx().then(function ({ result }) {
      const savingRates = result
        .filter(function ({ coin }) {
          return coin === targetedCoin;
        })
        .map(function ({ coin, previous: rate }) {
          faunaClient.query(
            q.Create(q.Collection("ftx_rates"), {
              data: {
                coin,
                rate,
                time: q.Time(time),
              },
            })
          );
        });
      return Promise.all(savingRates);
    });
  });
}
