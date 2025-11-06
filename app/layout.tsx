import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import MobileDock from "@/components/mobile-dock"
import { UsdBynRateProvider } from "@/components/providers/usd-byn-rate-provider"
import { NotificationProvider } from "@/components/providers/notification-provider"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  metadataBase: new URL('https://belautocenter.by'),
  title: {
    default: "Белавто Центр - Продажа автомобилей с пробегом в Беларуси",
    template: "%s | Белавто Центр"
  },
  description: "Большой выбор качественных автомобилей с пробегом. Кредит, лизинг. Проверенные автомобили в отличном состоянии в Минске.",
  keywords: [
    "автомобили с пробегом",
    "купить авто в Минске",
    "автосалон Минск",
    "подержанные автомобили Беларусь",
    "Белавто Центр",
    "автомобили в кредит",
    "лизинг авто",
    "проверенные автомобили",
    "качественные авто с пробегом"
  ],
  authors: [{ name: "Белавто Центр" }],
  creator: "Белавто Центр",
  publisher: "Белавто Центр",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://belautocenter.by',
    siteName: 'Белавто Центр',
    title: 'Белавто Центр - Продажа автомобилей с пробегом в Беларуси',
    description: 'Большой выбор качественных автомобилей с пробегом. Кредит, лизинг. Проверенные автомобили в отличном состоянии в Минске.',
    images: [
      {
        url: 'https://belautocenter.by/social-preview.jpg',
        width: 1200,
        height: 630,
        alt: 'Белавто Центр - автомобили с пробегом в Беларуси',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Белавто Центр - Продажа автомобилей с пробегом в Беларуси',
    description: 'Большой выбор качественных автомобилей с пробегом. Кредит, лизинг.',
    images: ['https://belautocenter.by/social-preview.jpg'],
    creator: '@autobelcenter',
  },
  verification: {
    google: 'google-site-verification',
    yandex: 'yandex-verification',
  },
  alternates: {
    canonical: 'https://belautocenter.by',
    languages: {
      'ru-RU': 'https://belautocenter.by',
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/favicon.ico',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta name="yandex-verification" content="a9085911ec7f5c05" />
        <link
          rel="preload"
          href="/fonts/ofont.ru_Geoform.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FCJJ7QL8S4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FCJJ7QL8S4');
          `}
        </Script>

        {/* Google Ads Conversion Tracking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17493994956"
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17493994956');
          `}
        </Script>

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <UsdBynRateProvider>
            <NotificationProvider>
              <Header />
              <main className="flex-1 flex flex-col bg-white dark:bg-black">
                {children}
              </main>
              <Footer />
              <MobileDock />
            </NotificationProvider>
          </UsdBynRateProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
