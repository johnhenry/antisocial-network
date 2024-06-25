import type { ReactNode } from "react";
import Image from "next/image";

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

        <title>{metadata.title as string}</title>
      </head>
      <body>
        <main>
          <header>
            <h1>
              <a href="/" title="The Antisocial Network">
                <Image
                  src="/logo.png"
                  width="80"
                  height="45"
                  alt="logo"
                ></Image>
              </a>
            </h1>
            <nav>
              <a href="/settings" title="settings">
                ⚙
              </a>
            </nav>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
