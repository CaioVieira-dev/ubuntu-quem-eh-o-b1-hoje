import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "B1",
  description: "Quem é o B1 hoje",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      {children}
    </main>
  );
}
