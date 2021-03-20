const faunadb = require("faunadb");

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNA_SECRET,
});
const q = faunadb.query;

export default (req, res) => {
  return get_rates().then(function (data) {
    return res.status(200).json(data);
  });
};

export function get_rates() {
  return Promise.all(
    ["DAI", "EUR", "USD", "USDT"].map(function (coin) {
      return get_coin_rates(coin).then(function (data) {
        return {
          coin,
          ...data,
        };
      });
    })
  ).then(function (results) {
    const largest_dataset = results
      .reduce(function (current, dataset) {
        if (current.length < dataset.past_week_rates.length) {
          return dataset.past_week_rates;
        }
        return current;
      }, [])
      .map(([datetime]) => [datetime]);
    results.forEach(function (data) {
      if (data.past_day_rates.length < 24) {
        data.past_day_rates = fill_dataset(
          data.past_day_rates,
          24,
          largest_dataset
        );
      }
      if (data.past_week_rates.length < 24 * 7) {
        data.past_week_rates = fill_dataset(
          data.past_week_rates,
          24 * 7,
          largest_dataset
        );
      }
    });
    return results;
  });
}

function fill_dataset(array, length, filler) {
  return filler.slice(0, length - array.length).concat(array);
}

function get_coin_rates(coin) {
  return faunaClient
    .query(getRecentCoinRates(coin, 24 * 7))
    .then(function ({ data: past_week_rates }) {
      past_week_rates = past_week_rates.reverse();
      past_week_rates.forEach(function (rate) {
        rate[1] = convert_hourly_to_yearly(rate[1]);
      });

      const past_day_rates = past_week_rates.slice(-24);
      const past_day_average_apr = getAverageRate(past_day_rates);
      const past_week_average_apr = getAverageRate(past_week_rates);

      return {
        past_day_average_apr,
        past_day_rates,
        past_week_average_apr,
        past_week_rates,
      };
    });
}

function convert_hourly_to_yearly(hourly_rate) {
  return hourly_rate * 24 * 365;
}

function getAverageRate(array) {
  return (
    array.reduce(function (acc, [, rate]) {
      acc += rate;
      return acc;
    }, 0) / array.length
  );
}

function getRecentCoinRates(coin, hourCount) {
  return q.Map(
    q.Paginate(q.Match(q.Index("ftx_rates_by_coin_time_desc"), coin), {
      size: hourCount,
    }),
    q.Lambda((time, coin, rate, ref) => [q.ToString(time), rate])
  );
}
