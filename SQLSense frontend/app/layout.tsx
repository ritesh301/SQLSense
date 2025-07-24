import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SQLSense - AI-Powered SQL Query Generator | Transform Natural Language to SQL",
  description:
    "Convert natural language into perfect SQL queries with our AI-powered assistant. Design schemas, track history, and boost productivity with SQLSense.",
  keywords: "SQL generator, AI SQL, natural language to SQL, database tools, schema designer",
  authors: [{ name: "SQLSense Team" }],
  openGraph: {
    title: "SQLSense - AI-Powered SQL Query Generator",
    description: "Transform natural language into SQL queries with AI assistance",
    url: "https://sqlsense.com",
    siteName: "SQLSense",
    type: "website",
  },

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Navigation />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
