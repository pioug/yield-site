import Head from "next/head";

export async function getStaticProps() {
  return Promise.all([
    get_mercurial_pools(),
    get_orca_pools(),
    get_saber_pools(),
    get_sunny_pools(),
  ]).then(function ([mercurial_pools, orca_pools, saber_pools, sunny_pools]) {
    return {
      props: { data: [mercurial_pools, orca_pools, saber_pools, sunny_pools] },
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
      </Head>
      <h1>Yield farming on Solana</h1>
      {data.map(function (platform) {
        return (
          <section key={platform.name}>
            <h2>{platform.name}</h2>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Pool</th>
                    <th>{"apr" in platform.data[0] ? "APR" : "APY"}</th>
                  </tr>
                </thead>
                <tbody>
                  {platform.data.map(function (pool, index) {
                    return (
                      <tr key={index}>
                        <td>{pool.name}</td>
                        <td>{pool.apy || pool.apr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
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
  return fetch("https://pioug.github.io/yield-data/orca.json").then(function (
    response
  ) {
    return response.json();
  });
}

function get_saber_pools() {
  return fetch("https://pioug.github.io/yield-data/saber.json").then(function (
    response
  ) {
    return response.json();
  });
}

function get_sunny_pools() {
  return fetch("https://pioug.github.io/yield-data/sunny.json").then(function (
    response
  ) {
    return response.json();
  });
}
