import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ModalProvider } from "@/providers/admin/modal-provider";
import { ThemeProvider } from "@/providers/admin/theme-provider";
import { SessionProvider } from "next-auth/react";
import "plyr-react/plyr.css"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Store | Admin",
  description:
    "Effortlessly control your ecommerce empire with our intuitive admin panel. Seamlessly manage products, orders, and track revenue for optimal SEO and business success.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="icon" href="/assets/favicon.ico" sizes="any" />
      <body className={roboto.className}>
        <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ModalProvider />
            <Toaster position="bottom-right" />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
