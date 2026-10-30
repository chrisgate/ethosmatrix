import type { Metadata } from "next";
import {
  Cormorant, Inter, Montserrat, Playfair_Display, Poppins, Quicksand, Roboto,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--f-cormorant" });
const quicksand = Quicksand({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--f-quicksand" });
const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"], variable: "--f-roboto" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--f-poppins" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"], variable: "--f-playfair" });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--f-montserrat" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--f-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: "Ethos Matrix Limited", template: "%s - Ethos Matrix Limited" },
  description:
    "Ethos Matrix Limited is a Nigerian turnkey real estate company offering architectural design, construction and property development.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = [cormorant, quicksand, roboto, poppins, playfair, montserrat, inter].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={fonts}>
      <body>{children}</body>
    </html>
  );
}
