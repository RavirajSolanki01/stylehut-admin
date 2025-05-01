"use client";
import NextTopLoader from "nextjs-toploader";
import { type PropsWithChildren } from "react";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import "@/css/satoshi.css";
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import "react-toastify/dist/ReactToastify.css";

import store, { persistor } from "../store";
import { Providers } from "./providers";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <title>Stylehunt</title>
      <body>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <Providers>
              <NextTopLoader color="#5750F1" showSpinner={false} />
              <ToastContainer />
              {children}
            </Providers>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
