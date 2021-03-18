const faunadb = require("faunadb");

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNA_SECRET,
});
const q = faunadb.query;

export default (req, res) => {
  return Promise.all([
    faunaClient.query(getAverageRate(24)),
    faunaClient.query(getAverageRate(24 * 7)),
  ]).then(function ([day, week]) {
    const past_day_average_apr = 1 + day.data[0] * 24 * 365;
    const past_week_average_apr = 1 + week.data[0] * 24 * 365;
    return res
      .status(200)
      .json({ past_day_average_apr, past_week_average_apr });
  });
};

function getAverageRate(hourCount) {
  return q.Mean(
    q.Map(
      q.Paginate(q.Match(q.Index("ftx_rates_by_coin_time_desc"), "USD"), {
        size: hourCount,
      }),
      q.Lambda((time, coin, rate, ref) => rate)
    )
  );
}
