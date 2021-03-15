const faunadb = require("faunadb");

const faunaClient = new faunadb.Client({
  secret: process.env.FAUNA_SECRET,
});
const q = faunadb.query;

export default (req, res) => {
  return faunaClient
    .query(
      q.Mean(
        q.Map(
          q.Paginate(q.Match(q.Index("ftx_rates_by_coin_time_desc"), "USD"), {
            size: 24,
          }),
          q.Lambda((time, coin, rate, ref) => rate)
        )
      )
    )
    .then(function (ret) {
      const apy = Math.pow(Math.pow(1 + ret.data[0], 24), 365);
      return res.status(200).json({ apy });
    });
};
