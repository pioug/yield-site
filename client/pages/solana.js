import Head from "next/head";

export async function getStaticProps() {
  return Promise.all([
    get_mercurial_pools(),
    get_orca_pools(),
    get_raydium_pools(),
    get_saber_pools(),
    get_solfarm_pools(),
    get_sunny_pools(),
  ]).then(function ([
    mercurial_pools,
    orca_pools,
    raydium_pools,
    saber_pools,
    solfarm_pools,
    sunny_pools,
  ]) {
    return {
      props: {
        data: [
          flattenPools(mercurial_pools, "mercurial"),
          flattenPools(orca_pools, "orca"),
          flattenPools(raydium_pools, "raydium"),
          flattenPools(saber_pools, "saber"),
          flattenPools(solfarm_pools, "solfarm"),
          flattenPools(sunny_pools, "sunny"),
        ].flat(),
      },
      revalidate: 600,
    };
  });
}

export default function SolanaPage({ data }) {
  return (
    <main>
      <Head>
        <title>Earn.fyi</title>
        <link rel="icon" type="image/png" href="/favicon32.png" sizes="32x32" />
        <meta name="color-scheme" content="dark light" />
      </Head>
      <h1>Yield farming on Solana</h1>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Pool</th>
            <th>Yield</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map(function (pool, index) {
            return (
              <tr key={index}>
                <td style={{ padding: 0 }}>
                  <img
                    alt={pool.platform.name}
                    height="16"
                    src={`/${pool.platform.id}.webp`}
                    style={{ verticalAlign: "middle" }}
                    title={pool.platform.name}
                    width="16"
                  />
                </td>
                <td>{pool.name}</td>
                <td>{pool.apy || pool.apr}</td>
                <td
                  style={{
                    "font-variant-caps": "all-small-caps",
                  }}
                >
                  {"apy" in pool ? "APY" : "APR"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}

function toReadablePercentage(value) {
  return (value * 100).toFixed(2) + "%";
}

function get_mercurial_pools() {
  return fetch("https://pioug.github.io/yield-data/mercurial.json").then(
    function (response) {
      return response.json();
    }
  );
}

function get_orca_pools() {
  return fetch("https://pioug.github.io/yield-data/orca.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (result) {
      result.data.forEach(function (pool) {
        pool.apr = pool.apr.replace(/\d+\.*\d*/, function (match) {
          return parseFloat(match).toFixed(2);
        });
      });
      return result;
    });
}

function get_raydium_pools() {
  return fetch("https://pioug.github.io/yield-data/raydium.json").then(
    function (response) {
      return response.json();
    }
  );
}

function get_saber_pools() {
  return fetch("https://pioug.github.io/yield-data/saber.json").then(function (
    response
  ) {
    return response.json();
  });
}

function get_solfarm_pools() {
  return fetch("https://pioug.github.io/yield-data/solfarm.json").then(
    function (response) {
      return response.json();
    })
    .then(function (result) {
      result.data.forEach(function (pool) {
        pool.apy = pool.apy.replace(" ", "");
      });
      return result;
    });
}

function get_sunny_pools() {
  return fetch("https://pioug.github.io/yield-data/sunny.json").then(function (
    response
  ) {
    return response.json();
  });
}

function flattenPools(dataset, id) {
  const { data, ...platform } = dataset;
  platform.id = id;
  data.forEach(function (pool) {
    pool.platform = platform;
  });
  return data;
}
