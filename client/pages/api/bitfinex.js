const faunadb = require("faunadb");
const subHours = require("date-fns/subHours");
const formatISO = require("date-fns/formatISO");

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNA_SECRET,
});
const q = faunadb.query;

export function get_bitfinex_rates() {
  return Promise.all(
    ["USD"].map(function (coin) {
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

function fill_dataset(array, length) {
  const filler = Array.from({ length: length - array.length }, function (v, i) {
    return [
      formatISO(subHours(new Date(array[0][0]), length - array.length + i)),
    ];
  });
  return filler.concat(array);
}

function get_coin_rates(coin) {
  return faunaClient
    .query(get_recent_coin_rates(coin, 24 * 7))
    .then(function ({ data: past_week_rates }) {
      past_week_rates = past_week_rates.reverse();
      past_week_rates.forEach(function (rate) {
        rate[1] = convert_percent_to_decimal(rate[1]);
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

function convert_percent_to_decimal(percent) {
  return percent / 100;
}

function getAverageRate(array) {
  return (
    array.reduce(function (acc, [, rate]) {
      acc += rate;
      return acc;
    }, 0) / array.length
  );
}

function get_recent_coin_rates(coin, hourCount) {
  return q.Map(
    q.Paginate(q.Match(q.Index("bitfinex_rates_by_coin_time_desc"), coin), {
      size: hourCount,
    }),
    q.Lambda((time, coin, rate, ref) => [q.ToString(time), rate]) // eslint-disable-line
  );
}
