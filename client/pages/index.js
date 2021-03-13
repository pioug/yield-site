import { useEffect, useState } from "react";
import Head from "next/head";

export default function HomePage() {
  const [apy, setApy] = useState(null);
  useEffect(function () {
    fetch("/api/ftx")
      .then((response) => response.json())
      .then(function ({ apy }) {
        setApy(apy);
      });
  }, []);
  return <div>{apy && ((apy - 1) * 100).toFixed(2) + "%"}</div>;
}
