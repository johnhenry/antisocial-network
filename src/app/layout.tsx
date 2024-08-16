import type { FC } from "react";
import type { Metadata } from "next";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

import {
  // IconTool,
  IconSchedule,
  IconSetting,
  // IconLog,
  IconHelp,
} from "@/components/icons";

import "./globals.css";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Props = { children: React.ReactNode };
export const metadata: Metadata = {
  title: "The Anitsocial Network",
  description: "Social Networking, but without the people",
};

const Page: FC<Props> = async ({ children }: Props) => {
  const cssFilePath = path.join(__dirname, "critical.css");
  const criticalCSS = await readFile(cssFilePath, "utf-8");
  return (
    <html lang="en-us">
      <head>
        <meta name="charset" content="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo-thick.svg" sizes="any" />
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      </head>
      <body>
        <main>
          {children}
          <header className="inverted-colors">
            <h1>
              <a href="/">
                <img alt="logo" />
                <span className="collapse-text-portrait">
                  Antisocial Network
                </span>
              </a>
            </h1>
            <nav>
              {/* <a href="/tools">
                <span className="menu-icon">
                  <IconTool />
                </span>
                <span className="collapse-text-portrait">Tools</span>
              </a> */}
              <a href="/schedule">
                <span className="menu-icon">
                  <IconSchedule />
                </span>
                <span className="collapse-text-portrait">Schedule</span>
              </a>
              <a href="/settings">
                <span className="menu-icon">
                  <IconSetting />
                </span>
                <span className="collapse-text-portrait">Settings</span>
              </a>
              {/* <a href="/logs">
                <span className="menu-icon">
                  <IconLog />
                </span>
                <span className="collapse-text-portrait">Logs</span>
              </a> */}
              <a
                rel="noopener"
                href="https://github.com/johnhenry/antisocial-network"
                target="_blank"
              >
                <span className="menu-icon">
                  <IconHelp />
                </span>
                <span className="collapse-text-portrait">Help</span>
              </a>
            </nav>
          </header>
        </main>
      </body>
    </html>
  );
};

export default Page;
