import Head from "next/head";
import { formatDistanceToNow } from "date-fns";

export async function getServerSideProps() {
  return Promise.all([
    get_aldrin_pools(),
    get_atrix_pools(),
    get_crema_pools(),
    get_cropper_pools(),
    get_lifinity_pools(),
    get_mercurial_pools(),
    get_orca_pools(),
    get_raydium_pools(),
    get_tulip_pools(),
  ]).then(function ([
    aldrin_pools,
    atrix_pools,
    crema_pools,
    cropper_pools,
    lifinity_pools,
    mercurial_pools,
    orca_pools,
    raydium_pools,
    tulip_pools,
  ]) {
    return {
      props: {
        data: [
          flattenPools(aldrin_pools, "aldrin"),
          flattenPools(atrix_pools, "atrix"),
          flattenPools(crema_pools, "crema"),
          flattenPools(cropper_pools, "cropper"),
          flattenPools(lifinity_pools, "lifinity"),
          flattenPools(mercurial_pools, "mercurial"),
          flattenPools(orca_pools, "orca"),
          flattenPools(raydium_pools, "raydium"),
          flattenPools(tulip_pools, "tulip"),
        ]
          .flat()
          .filter(function (pool) {
            return pool.apr || pool.apy;
          }),
      },
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
      <h1>Liquidity Pools on Solana</h1>
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
                  <a href={pool.platform.url} style={{ display: "flex" }}>
                    <img
                      alt={pool.platform.name}
                      height="16"
                      src={`/${pool.platform.id}.webp`}
                      style={{ verticalAlign: "middle" }}
                      title={pool.platform.name}
                      width="16"
                    />
                  </a>
                </td>
                <td>{pool.name}</td>
                <td
                  title={`${formatDistanceToNow(
                    new Date(pool.platform.timetamp)
                  )} ago`}
                >
                  {pool.apy || pool.apr}
                </td>
                <td
                  style={{
                    fontVariantCaps: "all-small-caps",
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

function get_aldrin_pools() {
  return fetch("https://pioug.github.io/yield-data/aldrin.json").then(function (
    response
  ) {
    return response.json();
  });
}

function get_atrix_pools() {
  return fetch("https://pioug.github.io/yield-data/atrix.json").then(function (
    response
  ) {
    return response.json();
  });
}

function get_crema_pools() {
  return fetch("https://pioug.github.io/yield-data/crema.json").then(function (
    response
  ) {
    return response.json();
  });
}

function get_cropper_pools() {
  return fetch("https://pioug.github.io/yield-data/cropper.json").then(
    function (response) {
      return response.json();
    }
  );
}

function get_lifinity_pools() {
  return fetch("https://pioug.github.io/yield-data/lifinity.json").then(
    function (response) {
      return response.json();
    }
  );
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

function get_tulip_pools() {
  return fetch("https://pioug.github.io/yield-data/tulip.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (result) {
      result.data.forEach(function (pool) {
        pool.apy = pool.apy.replace(" ", "");
      });
      return result;
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
