import type { ReactNode } from "react";

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antisocial Network",
  description: "The social network without people",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description || ""} />
        {/* <script type="module" src="/register-service-worker.mjs" async></script>
        <script
          type="module"
          src="/request-permission-notification.mjs"
          async
        ></script> */}

        <title>{metadata.title}</title>
      </head>
      <body>
        <main>
          <header>
            <a href="/">
              <h1>{metadata.title}</h1>
            </a>
            <nav>
              <a href="/settings">Settings</a>
            </nav>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
