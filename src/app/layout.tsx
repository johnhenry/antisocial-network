import type { FC } from "react";
import type { Metadata } from "next";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import { FaUsers } from "react-icons/fa";
import { PiFilesFill } from "react-icons/pi";
import { FaTools } from "react-icons/fa";
import { IoIosClock } from "react-icons/io";
import { FaGears } from "react-icons/fa6";
import { HiMiniPencilSquare } from "react-icons/hi2";
import { IoIosHelpCircle } from "react-icons/io";
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
        <title>My First Web Page</title>
        <meta name="charset" content="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
              <a href="/agents">
                <span className="menu-icon">
                  <FaUsers />
                </span>
                <span className="collapse-text-portrait">Agents</span>
              </a>
              <a href="/files">
                <span className="menu-icon">
                  <PiFilesFill />
                </span>
                <span className="collapse-text-portrait">Files</span>
              </a>
              <a href="/tools">
                <span className="menu-icon">
                  <FaTools />
                </span>
                <span className="collapse-text-portrait">Tools</span>
              </a>
              <a href="/schedule">
                <span className="menu-icon">
                  <IoIosClock />
                </span>
                <span className="collapse-text-portrait">Scheule</span>
              </a>
              <a href="/settings">
                <span className="menu-icon">
                  <FaGears />
                </span>
                <span className="collapse-text-portrait">Settings</span>
              </a>
              <a href="/logs">
                <span className="menu-icon">
                  <HiMiniPencilSquare />
                </span>
                <span className="collapse-text-portrait">Logs</span>
              </a>
              <a href="/settings">
                <span className="menu-icon">
                  <IoIosHelpCircle />
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
