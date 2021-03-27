"use strict";

const faunadb = require("faunadb");
const formatISO = require("date-fns/formatISO");
const got = require("got");
const startOfHour = require("date-fns/startOfHour");
const subHours = require("date-fns/subHours");

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNA_SECRET,
});
const q = faunadb.query;

const time = formatISO(startOfHour(subHours(new Date(), 1)));

Promise.all([processCoin("USD"), processCoin("UST")]);

function processCoin(coin) {
  return got(
    `https://api.bitfinex.com/v1/lendbook/${coin}?limit_bids=0&limit_asks=1`,
    {
      responseType: "json",
    }
  ).then(function ({
    body: {
      asks: [{ rate }],
    },
  }) {
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
              rate: +rate,
              time: q.Time(time),
            },
          })
        );
      });
  });
}
