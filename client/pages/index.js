import Chart from "chart.js";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

const chart_color_red = "rgb(255, 99, 132)";

export default function HomePage() {
  const canvas = useRef(null);
  const [data, setData] = useState({
    past_week_rates: [],
  });
  useEffect(function () {
    fetch("/api/ftx")
      .then((response) => response.json())
      .then(function (data) {
        setData(data);
      });
  }, []);

  useEffect(
    function () {
      const context2d = canvas.current.getContext("2d");
      const reversed_past_week_rates = data.past_week_rates.slice().reverse();
      const formatDate = new Intl.DateTimeFormat(navigator.language, {
        dateStyle: "short",
      }).format;
      const formatDateTime = new Intl.DateTimeFormat(navigator.language, {
        dateStyle: "short",
        timeStyle: "short",
      }).format;
      const myChart = new Chart(context2d, {
        type: "line",
        data: {
          labels: reversed_past_week_rates.map(([time]) => time),
          datasets: [
            {
              label: "Lending rate",
              fill: false,
              backgroundColor: chart_color_red,
              borderColor: chart_color_red,
              data: reversed_past_week_rates.map(
                ([, rate]) => Math.round(rate * 10000) / 100
              ),
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            xAxes: [
              {
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: "Time",
                },
                ticks: {
                  callback: function (dataLabel, index) {
                    return index % 6 === 0
                      ? formatDate(new Date(dataLabel))
                      : "";
                  },
                },
              },
            ],
            yAxes: [
              {
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: "Rate (%)",
                },
                ticks: {
                  callback: function (dataLabel) {
                    return `${dataLabel}%`;
                  },
                },
              },
            ],
          },
          tooltips: {
            callbacks: {
              title: function ([a]) {
                return formatDateTime(new Date(a.label));
              },
              label: function (a) {
                return `Lending rate: ${a.value}%`;
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
    <>
      <h1>APR for lending USD on FTX</h1>
      <div>
        <p>
          Past 24h:{" "}
          {data.past_day_average_apr &&
            (data.past_day_average_apr * 100).toFixed(2) + "%"}
        </p>
      </div>
      <div>
        <p>
          Past 7d:{" "}
          {data.past_week_average_apr &&
            (data.past_week_average_apr * 100).toFixed(2) + "%"}
        </p>
        <div>
          <canvas ref={canvas} />
        </div>
      </div>
    </>
  );
}
