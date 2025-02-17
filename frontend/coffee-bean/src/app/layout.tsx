import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "The Coffee Bean Project",
  description: "Premium coffee beans for coffee lovers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${inter.variable} font-sans antialiased bg-[#FAFAFA] text-[#1D1D1F] dark:bg-[#121212] dark:text-white transition-colors duration-200`}
      >
        <ThemeProvider>
          <CartProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'dark:bg-[#1D1D1F] dark:text-white',
                style: {
                  background: '#1D1D1F',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                },
                success: {
                  iconTheme: {
                    primary: '#00A67E',
                    secondary: '#FFFFFF',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#FF4B4B',
                    secondary: '#FFFFFF',
                  },
                },
              }}
            />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
