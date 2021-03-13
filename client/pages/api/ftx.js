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
          q.Paginate(
            q.Range(
              q.Match("ftx_rates_by_time"),
              q.TimeSubtract(q.Now(), 1, "day"),
              q.Now()
            )
          ),
          q.Lambda((time, x) => q.Select(["data", "rate"], q.Get(x)))
        )
      )
    )
    .then(function (ret) {
      const apy = Math.pow(Math.pow(1 + ret.data[0], 24), 365);
      return res.status(200).json({ apy });
    });
};
