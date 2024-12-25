"use client";
import { useSearchParams } from "next/navigation";

export default function Error() {
  const params = useSearchParams();

  const error = params.get("error");

  if (error) {
    return (
      <div className="text-red-400">
        <h4 className="text-2xl">Erro:</h4>
        Hmm... parece que você tentou entrar na balada sem o carimbo de entrada.
        🚫🕺
        <br />
        Sem convite, sem festa!😅
        <br />
        Se você acha que merecia um convite, dá um toque pra gente. Quem sabe a
        gente dá um jeito! 😉
      </div>
    );
  }
  return null;
}
