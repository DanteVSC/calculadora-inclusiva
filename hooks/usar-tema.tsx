import { createContext, ReactNode, useContext, useState } from 'react';

type TemaTipo = "claro" | "escuro";

type TemaContextoTipo = {
  tema: TemaTipo;
  inverterTema: () => void;
};

const TemaContexto = createContext<TemaContextoTipo | undefined>(undefined);

export function TemaProvedor({ children }: { children: ReactNode }) {
  const [tema, definirTema] = useState<TemaTipo>("escuro");

  function inverterTema() {
    definirTema((temaAtual) => (temaAtual === "escuro" ? "claro" : "escuro"));
  }

  return (
    <TemaContexto.Provider value={{ tema, inverterTema }}>
      {children}
    </TemaContexto.Provider>
  );
}

export function usarTema() {
  const contexto = useContext(TemaContexto);
  if (!contexto) {
    throw new Error("usarTema precisa ser usado dentro do TemaProvedor");
  }
  return contexto;
}