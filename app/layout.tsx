import type { Metadata } from "next";
import {
  Cormorant, Heebo, Inter, Karla, Lora, Montserrat, Mulish, Playfair_Display, Poppins, Quicksand, Raleway, Roboto,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--f-cormorant" });
const quicksand = Quicksand({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--f-quicksand" });
const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"], variable: "--f-roboto" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--f-poppins" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"], variable: "--f-playfair" });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--f-montserrat" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"], variable: "--f-inter" });
// Small details the original site also uses: testimonial names and roles, the "Our story" label, two buttons.
const karla = Karla({ subsets: ["latin"], weight: ["600"], variable: "--f-karla" });
const lora = Lora({ subsets: ["latin"], weight: ["400"], style: ["italic"], variable: "--f-lora" });
const raleway = Raleway({ subsets: ["latin"], weight: ["400"], variable: "--f-raleway" });
const heebo = Heebo({ subsets: ["latin"], weight: ["500"], variable: "--f-heebo" });
const mulish = Mulish({ subsets: ["latin"], weight: ["400"], variable: "--f-mulish" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: "Ethos Matrix Limited", template: "%s - Ethos Matrix Limited" },
  description:
    "Ethos Matrix Limited is a Nigerian turnkey real estate company offering architectural design, construction and property development.",
  // Each page's own address is its canonical URL; share cards fall back to app/opengraph-image.jpg.
  alternates: { canonical: "./" },
  openGraph: { type: "website", siteName: "Ethos Matrix Limited", locale: "en_NG" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = [cormorant, quicksand, roboto, poppins, playfair, montserrat, inter, karla, lora, raleway, heebo, mulish].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={fonts}>
      <body>{children}</body>
    </html>
  );
}
