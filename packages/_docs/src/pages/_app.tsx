import "tailwindcss/tailwind.css";
import React from "react";
import { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default App;
