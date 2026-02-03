import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import SessionProvider from "./components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Voronoi',
  description: 'Manage your code snippets efficiently',

  openGraph: {
    title: 'Voronoi',
    description: 'Manage your code snippets efficiently',
    url: 'https://www.voronoi.notes/', 
    siteName: 'Voronoi',
    images: [
      {
        url: '/logo.svg', 
        width: 1200,
        height: 630,
        alt: 'Voronoi screenshot',
      },
    ],
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image', 
    title: 'Voronoi',
    description: 'Manage your code snippets efficiently',
    images: ['/logo.svg'],
  },

  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  

  authors: [
    {
      name: 'Amaurys De Los Santos Mendez',
      url: 'https://www.amaurysdelossantos.com', // optional
    },
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  metadataBase: new URL('https://www.voronoi.space/'),
};

export function generateViewport() {
  return {
    viewport: {
      width: 'device-width',
      initialScale: 1,
      minimumScale: 1,
      maximumScale: 1,
      userScalable: false,
    },
    themeColor: '#1d222a', 
  };
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
