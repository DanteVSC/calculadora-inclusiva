import { createContext, useState, useContext, ReactNode } from 'react';
import { Cores } from '../constantes/cores';

// Cria o context do tema
const TemaContexto = createContext("escuro") 

export function TemaProvedor( {children}:{ children: ReactNode } ){ // Children pega tudo que estiver dentro das tags do <provedor>
    // Cria o useState(tipo uma variavel) para guardar o tema
    const [tema, definirTema] = useState("escuro"); // Vem por padrão no modo escuro//

    function inverterTema(){
        // Se o tema atual for escuro, muda pra claro, senão, muda pra escuro
        definirTema(tema === "escuro" ? "claro" : "escuro") // if ternário
    };

    return (
        <TemaContexto.Provider value={{tema, Cores[tema], inverterTema}}> //Provedor oferece o tema atual, a paleta de cores, e a função para inverter o tema para que outros pedaços do app possam usar
            {children}
        </TemaContexto.Provider>
    );
}

export function useTema() { // Função para pegar o as coisas que o provedor oferece e associar a novas variaveis?????????
  return useContext(TemaContexto);
}