"use strict";

const faunadb = require("faunadb");
const formatISO = require("date-fns/formatISO");
const got = require("got");

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNA_SECRET,
});
const q = faunadb.query;

Promise.all([processCoin("USD"), processCoin("UST")]);

function processCoin(coin) {
  return got(
    `https://api-pub.bitfinex.com/v2/funding/stats/f${coin}/hist?limit=1`,
    {
      responseType: "json",
    }
  ).then(function ({ body: [rate] }) {
    const time = formatISO(new Date(rate[0]));
    return faunaClient
      .query(
        q.Get(
          q.Match(q.Index("bitfinex_rates_by_coin_time"), [coin, q.Time(time)])
        )
      )
      .catch(function () {
        return faunaClient.query(
          q.Create(q.Collection("bitfinex_rates"), {
            data: {
              coin,
              rate: rate[3],
              time: q.Time(time),
            },
          })
        );
      });
  });
}
