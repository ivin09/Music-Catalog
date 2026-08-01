import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AnimatedMain from "@/components/AnimatedMain";
import ScrollProgressBar from "@/components/ScrollProgressBar";

export const metadata = {
  title: "Music Catalog Insights",
  description: "Search, save, and analyze your personal music library",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <ScrollProgressBar />
        <AuthProvider>
          <Navbar />
          <AnimatedMain>{children}</AnimatedMain>
        </AuthProvider>
      </body>
    </html>
  );
}
