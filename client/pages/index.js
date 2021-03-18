import { useEffect, useState } from "react";
import Head from "next/head";

export default function HomePage() {
  const [apr, setapr] = useState({});
  useEffect(function () {
    fetch("/api/ftx")
      .then((response) => response.json())
      .then(function ({ past_day_average_apr, past_week_average_apr }) {
        setapr({ past_day_average_apr, past_week_average_apr });
      });
  }, []);
  return (
    <>
      <h1>APR for lending USD on FTX</h1>
      <div>
        <p>
          Past 24h:{" "}
          {apr.past_day_average_apr &&
            ((apr.past_day_average_apr - 1) * 100).toFixed(2) + "%"}
        </p>
      </div>
      <div>
        <p>
          Past 7d:{" "}
          {apr.past_week_average_apr &&
            ((apr.past_week_average_apr - 1) * 100).toFixed(2) + "%"}
        </p>
      </div>
    </>
  );
}
