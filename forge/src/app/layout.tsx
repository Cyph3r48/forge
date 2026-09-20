import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AuthGate } from "@/components/AuthGate";

export const metadata: Metadata = { title: "The Forge" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthGate>
          <div className="shell">
            <Sidebar />
            <main className="main">{children}</main>
          </div>
        </AuthGate>
      </body>
    </html>
  );
}
