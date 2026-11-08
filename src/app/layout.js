import "./globals.css";

export const metadata = {
  title: {
    default: "BansosGuard — Bantuan Tepat Sasaran",
    template: "%s | BansosGuard",
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
