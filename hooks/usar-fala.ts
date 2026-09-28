import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

export type VozTipo = {
  id: string;
  nome: string;
  idioma: string;
};

type FalaTipo = {
  falar: (texto: string) => void;
  pararFala: () => void;
  falando: boolean;
  vozes: VozTipo[];
  vozAtual: VozTipo | null;
  proximaVoz: () => VozTipo | null;
  velocidade: number;
  proximaVelocidade: () => number;
};

type PendenciaTipo = {
  timer: ReturnType<typeof setTimeout> | null;
  aoGesto: (() => void) | null;
};

export const VELOCIDADES = [0.8, 1, 1.2, 1.5];

const IDIOMA = 'pt-BR';
const CHAVE_VOZ = 'voz-tts';
const CHAVE_VELOCIDADE = 'velocidade-tts';
const TEMPO_ESPERA_VOZES = 4000;

function ordenarVozes(a: VozTipo, b: VozTipo): number {
  const ptBr = (v: VozTipo) => (v.idioma.toLowerCase().startsWith('pt-br') ? 0 : 1);
  if (ptBr(a) !== ptBr(b)) return ptBr(a) - ptBr(b);
  return a.nome.localeCompare(b.nome);
}

export function usarFala(): FalaTipo {
  const [falando, setFalando] = useState(false);
  const [vozes, setVozes] = useState<VozTipo[]>([]);
  const [vozAtual, setVozAtual] = useState<VozTipo | null>(null);
  const [velocidade, setVelocidade] = useState(1);

  const sequenciaRef = useRef(0);
  const pendenciaRef = useRef<PendenciaTipo | null>(null);
  const vozRef = useRef<VozTipo | null>(null);
  const velocidadeRef = useRef(1);

  const aplicarVoz = useCallback((voz: VozTipo | null) => {
    vozRef.current = voz;
    setVozAtual(voz);
  }, []);

  const aplicarVelocidade = useCallback((taxa: number) => {
    velocidadeRef.current = taxa;
    setVelocidade(taxa);
  }, []);

  useEffect(() => {
    let ativo = true;

    void (async () => {
      let vozSalva: string | null = null;
      let velocidadeSalva: string | null = null;

      try {
        const pares = await AsyncStorage.multiGet([CHAVE_VOZ, CHAVE_VELOCIDADE]);
        vozSalva = pares[0][1];
        velocidadeSalva = pares[1][1];
      } catch {
        // sem persistência disponível
      }

      let lista: VozTipo[] = [];
      try {
        const disponiveis = await Promise.race([
          Speech.getAvailableVoicesAsync(),
          new Promise<never>((_, rejeitar) =>
            setTimeout(() => rejeitar(new Error('timeout')), TEMPO_ESPERA_VOZES),
          ),
        ]);
        lista = disponiveis
          .filter((voz) => (voz.language || '').toLowerCase().startsWith('pt'))
          .map((voz) => ({ id: voz.identifier, nome: voz.name, idioma: voz.language }))
          .sort(ordenarVozes);
      } catch {
        lista = [];
      }

      if (!ativo) return;

      setVozes(lista);
      aplicarVoz(lista.find((voz) => voz.id === vozSalva) || null);

      const taxaSalva = velocidadeSalva ? parseFloat(velocidadeSalva) : NaN;
      if (!isNaN(taxaSalva) && VELOCIDADES.includes(taxaSalva)) {
        aplicarVelocidade(taxaSalva);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [aplicarVoz, aplicarVelocidade]);

  const limparPendencia = useCallback(() => {
    const pendencia = pendenciaRef.current;
    if (!pendencia) return;
    if (pendencia.timer) clearTimeout(pendencia.timer);
    if (pendencia.aoGesto && typeof document !== 'undefined') {
      document.removeEventListener('pointerdown', pendencia.aoGesto);
    }
    pendenciaRef.current = null;
  }, []);

  useEffect(() => {
    return () => limparPendencia();
  }, [limparPendencia]);

  const falar = useCallback(
    (texto: string) => {
      const mensagem = texto.trim();
      if (!mensagem) return;

      const voz = vozRef.current;
      const taxa = velocidadeRef.current;

      limparPendencia();
      sequenciaRef.current += 1;
      const sequencia = sequenciaRef.current;

      const opcoes: Speech.SpeechOptions = {
        language: IDIOMA,
        rate: taxa,
        ...(voz ? { voice: voz.id } : {}),
        onStart: () => {
          if (sequencia === sequenciaRef.current) setFalando(true);
        },
        onDone: () => {
          if (sequencia === sequenciaRef.current) setFalando(false);
        },
        onStopped: () => {
          if (sequencia === sequenciaRef.current) setFalando(false);
        },
        onError: () => {
          if (sequencia === sequenciaRef.current) setFalando(false);
        },
      };

      void (async () => {
        // Espera a fala anterior terminar para não cancelar a nova no Android
        try {
          await Speech.stop();
        } catch {
          // sem suporte a síntese de voz
        }
        if (sequencia !== sequenciaRef.current) return;

        try {
          Speech.speak(mensagem, opcoes);
        } catch {
          return;
        }

        if (typeof document === 'undefined') return;

        // No navegador a primeira fala pode ser bloqueada por não haver gesto do
        // usuário. Se isso acontecer, repetimos no primeiro toque da tela.
        const timer = setTimeout(() => {
          void (async () => {
            if (sequencia !== sequenciaRef.current) return;
            let jaFalando = false;
            try {
              jaFalando = await Speech.isSpeakingAsync();
            } catch {
              jaFalando = false;
            }
            if (jaFalando || sequencia !== sequenciaRef.current) return;

            const aoGesto = () => {
              if (sequencia !== sequenciaRef.current) return;
              limparPendencia();
              void (async () => {
                try {
                  if (await Speech.isSpeakingAsync()) return;
                  await Speech.stop();
                } catch {
                  return;
                }
                if (sequencia !== sequenciaRef.current) return;
                try {
                  Speech.speak(mensagem, opcoes);
                } catch {
                  // navegador sem suporte a síntese de voz
                }
              })();
            };

            pendenciaRef.current = { timer: null, aoGesto };
            document.addEventListener('pointerdown', aoGesto, { once: true });
          })();
        }, 1200);

        pendenciaRef.current = { timer, aoGesto: null };
      })();
    },
    [limparPendencia],
  );

  const pararFala = useCallback(() => {
    limparPendencia();
    sequenciaRef.current += 1;
    setFalando(false);
    void Speech.stop().catch(() => {});
  }, [limparPendencia]);

  const proximaVoz = useCallback(() => {
    if (vozes.length === 0) return null;

    const atual = vozRef.current;
    const indice = atual ? vozes.findIndex((voz) => voz.id === atual.id) : -1;
    const nova = vozes[(indice + 1) % vozes.length];

    aplicarVoz(nova);
    AsyncStorage.setItem(CHAVE_VOZ, nova.id).catch(() => {});
    return nova;
  }, [vozes, aplicarVoz]);

  const proximaVelocidade = useCallback(() => {
    const indice = VELOCIDADES.indexOf(velocidadeRef.current);
    const nova = VELOCIDADES[(indice + 1) % VELOCIDADES.length];

    aplicarVelocidade(nova);
    AsyncStorage.setItem(CHAVE_VELOCIDADE, String(nova)).catch(() => {});
    return nova;
  }, [aplicarVelocidade]);

  return {
    falar,
    pararFala,
    falando,
    vozes,
    vozAtual,
    proximaVoz,
    velocidade,
    proximaVelocidade,
  };
}
