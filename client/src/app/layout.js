import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"
import Link from "next/link";
import { AppProvider, useAppContext } from "./components/contexts";
import {Toaster} from 'react-hot-toast'
import Loading from "./components/Loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FINDR",
  description: "Your Lost and Found Buddy",
  icons:{
    icon:'./Logo.svg'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
      <AppProvider>
      <Toaster position="top-right" />
      <nav>
       
        <Link href='/login'/>
        <Link href='/signup'/>

        <Link href='/dashboard'/>
        <Link href='/reportLost'/>
        <Link href='/foundLost'/>
        
      </nav>
        {children}

        </AppProvider>
      </body>
    </html>
  );
}
