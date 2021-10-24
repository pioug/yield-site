import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  PointElement,
  LineElement,
  Tooltip,
  TimeSeriesScale,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import Head from "next/head";
import { useEffect, useRef } from "react";
import { get_ftx_rates } from "./api/ftx.js";
import { get_bitfinex_rates } from "./api/bitfinex.js";

Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  PointElement,
  LineElement,
  Tooltip,
  TimeSeriesScale,
  Legend
);

const chart_color_red = "rgb(255, 99, 132)";
const chart_color_orange = "rgb(255, 159, 64)";
const chart_color_yellow = "rgb(255, 205, 86)";
const chart_color_green = "rgb(75, 192, 192)";
const chart_color_blue = "rgb(54, 162, 235)";
const chart_color_purple = "rgb(153, 102, 255)";
const chart_color_grey = "rgb(201, 203, 207)";

const chart_colors = [
  chart_color_red,
  chart_color_orange,
  chart_color_yellow,
  chart_color_green,
  chart_color_blue,
  chart_color_purple,
  chart_color_grey,
];

export async function getStaticProps() {
  return Promise.all([get_bitfinex_rates(), get_ftx_rates()]).then(function ([
    bitfinex_rates,
    ftx_rates,
  ]) {
    bitfinex_rates.forEach(function (rate) {
      rate.coin += " (Bitfinex)";
    });
    ftx_rates.forEach(function (rate) {
      rate.coin += " (FTX)";
    });
    return {
      props: { data: [...ftx_rates, ...bitfinex_rates] },
      revalidate: 600,
    };
  });
}

export default function HomePage({ data }) {
  const canvas = useRef(null);
  useEffect(
    function () {
      const context2d = canvas.current.getContext("2d");
      const formatDateTime = new Intl.DateTimeFormat(navigator.language, {
        dateStyle: "short",
        timeStyle: "short",
      }).format;
      const myChart = new Chart(context2d, {
        type: "line",
        data: {
          labels: data[0].past_week_rates.map(([time]) => time),
          datasets: data.map(function (d, index) {
            return {
              label: d.coin,
              fill: false,
              backgroundColor: chart_colors[index],
              borderColor: chart_colors[index],
              borderCapStyle: "round",
              borderJoinStyle: "round",
              data: d.past_week_rates.map(
                ([, rate]) => Math.round(rate * 10000) / 100
              ),
            };
          }),
        },
        options: {
          animation: {
            duration: 0,
          },
          responsive: true,
          plugins: {
            tooltip: {
              mode: "index",
              callbacks: {
                title: function ([a]) {
                  return formatDateTime(new Date(a.parsed.x));
                },
                label: function (a) {
                  return `${data[a.datasetIndex].coin}: ${a.parsed.y}%`;
                },
              },
            },
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: "Time",
              },
              time: {
                unit: "day",
              },
              type: "timeseries",
            },
            y: {
              display: true,
              title: {
                display: true,
                text: "APR (%)",
              },
              ticks: {
                callback: function (dataLabel) {
                  return `${dataLabel}%`;
                },
              },
            },
          },
        },
      });

      return function () {
        myChart.destroy();
      };
    },
    [data]
  );
  return (
    <main>
      <Head>
        <title>Earn.fyi</title>
        <link rel="icon" type="image/png" href="/favicon32.png" sizes="32x32" />
        <meta name="color-scheme" content="dark light" />
      </Head>
      <h1>APR for margin lending on FTX and Bitfinex</h1>
      <div>
        <div>
          <canvas ref={canvas} />
        </div>
        <table>
          <thead>
            <tr>
              <th>Coin</th>
              <th>24h</th>
              <th>7d</th>
            </tr>
          </thead>
          <tbody>
            {data.map(function ({
              coin,
              past_day_average_apr,
              past_week_average_apr,
            }) {
              return (
                <tr key={coin}>
                  <td>{coin}</td>
                  <td>{toReadablePercentage(past_day_average_apr)}</td>
                  <td>{toReadablePercentage(past_week_average_apr)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function toReadablePercentage(value) {
  return (value * 100).toFixed(2) + "%";
}
