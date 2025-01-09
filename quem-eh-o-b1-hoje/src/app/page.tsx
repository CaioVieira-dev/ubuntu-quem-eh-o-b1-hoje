import Link from "next/link";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import LoginError from "./LoginError";
import { env } from "~/env";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Quem é o B1 hoje?
          </h1>
          <LoginError />
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logado como {session.user?.name}</span>}
              </p>
              {session && (
                <Link
                  href={`/companies/${env.COMPANY}`}
                  className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                >
                  Ir para lista
                </Link>
              )}
              <Link
                href={
                  session
                    ? `/api/auth/signout?callbackUrl=${encodeURI(`http://${env?.VERCEL_URL ? env.VERCEL_URL : "localhost:3000"}/`)}`
                    : `/api/auth/signin?callbackUrl=${encodeURI(`http://${env?.VERCEL_URL ? env.VERCEL_URL : "localhost:3000"}/companies/${env.COMPANY}`)}`
                }
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sair" : "Entrar"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
