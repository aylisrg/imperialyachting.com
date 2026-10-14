import { Cormorant_Garamond } from "next/font/google";

// Display serif for the Wake redesign (issue #46), same settings as the home page.
export const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
});
