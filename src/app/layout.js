import "./globals.css";

export const metadata = {
  title: {
    default: "SiBantu — Bantuan Tepat Sasaran",
    template: "%s | SiBantu",
  },
  description:
    "Platform transparansi dan pengawasan bantuan sosial yang aman, mudah diakses, dan akuntabel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
