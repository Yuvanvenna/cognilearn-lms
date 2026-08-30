import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CogniLearn OS — Next-Generation AI-Native Adaptive LMS",
  description: "Next-generation AI-native learning platform featuring in-video checkpoints, timestamped RAG copilot, adaptive knowledge graphs, and Socratic evaluation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
