import { useEffect, useState } from "react";
import Head from "next/head";

export default function HomePage() {
  const [apy, setApy] = useState({});
  useEffect(function () {
    fetch("/api/ftx")
      .then((response) => response.json())
      .then(function ({ past_day_average_apy, past_week_average_apy }) {
        setApy({ past_day_average_apy, past_week_average_apy });
      });
  }, []);
  return (
    <>
      <h1>APY for lending USD on FTX</h1>
      <div>
        <p>
          Past 24h:{" "}
          {apy.past_day_average_apy &&
            ((apy.past_day_average_apy - 1) * 100).toFixed(2) + "%"}
        </p>
      </div>
      <div>
        <p>
          Past 7d:{" "}
          {apy.past_week_average_apy &&
            ((apy.past_week_average_apy - 1) * 100).toFixed(2) + "%"}
        </p>
      </div>
    </>
  );
}
