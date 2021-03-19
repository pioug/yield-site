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
  return faunaClient
    .query(getRecentRates(24 * 7))
    .then(function ({ data: past_week_rates }) {
      past_week_rates.forEach(function (rate) {
        rate[1] = convert_hourly_to_yearly(rate[1]);
      });

      const past_day_rates = past_week_rates.slice(0, 24);
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

function getRecentRates(hourCount) {
  return q.Map(
    q.Paginate(q.Match(q.Index("ftx_rates_by_coin_time_desc"), "USD"), {
      size: hourCount,
    }),
    q.Lambda((time, coin, rate, ref) => [q.ToString(time), rate])
  );
}
