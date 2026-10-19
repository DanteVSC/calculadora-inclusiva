import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { juntarTranscricoes } from '../funcoes/logica';

type OpcoesUsarVozTipo = {
  // Chamado a cada transcrição FINAL nova (por sessão). Usado pelo modo
  // palavra-chave no app/index, que tem sua própria máquina de estados.
  aoResultadoFinal?: (transcricao: string) => void;
};

type ReconhecimentoVozTipo = {
  ouvindo: boolean;
  // Todos os finais da sessão desde a última limpeza (no Android/iOS o texto
  // chega por trechos, um final por fala).
  texto: string;
  // Fala em andamento que ainda não virou final.
  textoParcial: string;
  iniciar: () => void;
  parar: () => void;
  // Limpa as transcrições sem mexer na sessão (ex.: assumir a escuta ociosa).
  limparTexto: () => void;
  erro: string | null;
  suportado: boolean;
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const WEB = Platform.OS === 'web';

export function usarVoz(opcoes?: OpcoesUsarVozTipo): ReconhecimentoVozTipo {
  const [ouvindo, setOuvindo] = useState(false);
  const [texto, setTexto] = useState('');
  const [textoParcial, setTextoParcial] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const reconhecimentoRef = useRef<{ stop: () => void } | null>(null);

  // Acúmulo dos finais da sessão (vira o estado `texto`).
  const finaisAcumuladosRef = useRef('');

  // Mantido fresco sem depender do array de deps do useCallback.
  const aoResultadoFinalRef = useRef<OpcoesUsarVozTipo['aoResultadoFinal']>(undefined);
  aoResultadoFinalRef.current = opcoes?.aoResultadoFinal;

  const suportado = WEB
    ? typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    : true;

  useSpeechRecognitionEvent('start', () => {
    setOuvindo(true);
    setErro(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setOuvindo(false);
    // O parcial NÃO é limpo aqui: se a sessão morreu sem emitir o `result`
    // final (silêncio, erro), ele ainda é o final da frase captada. Quem
    // limpa é `iniciar()` e `limparTexto()`.
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results.length > 0) {
      const r = event.results[0];
      if (event.isFinal) {
        // No Android (sessão segmentada) e no iOS cada final traz só o trecho
        // novo: acumula, senão o trecho anterior seria sobrescrito e perdido.
        finaisAcumuladosRef.current = juntarTranscricoes(finaisAcumuladosRef.current, r.transcript);
        setTexto(finaisAcumuladosRef.current);
        setTextoParcial('');
        aoResultadoFinalRef.current?.(r.transcript);
      } else {
        setTextoParcial(r.transcript);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setErro(event.error);
    setOuvindo(false);
  });

  const iniciar = useCallback(async () => {
    finaisAcumuladosRef.current = '';
    setTexto('');
    setTextoParcial('');
    setErro(null);

    if (WEB) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setErro('Reconhecimento de voz não suportado neste navegador');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setOuvindo(true);
        setErro(null);
      };

      // Na web `event.results` é acumulativo: só avisar o app dos finais NOVOS.
      let finaisVistos = 0;

      recognition.onresult = (event: any) => {
        let parcial = '';
        let quantosFinais = 0;
        const novos: string[] = [];

        for (let i = 0; i < event.results.length; i++) {
          const resultado = event.results[i];
          if (resultado.isFinal) {
            quantosFinais++;
            if (i >= finaisVistos) novos.push(resultado[0].transcript);
          } else {
            parcial += resultado[0].transcript;
          }
        }

        if (novos.length > 0) {
          finaisAcumuladosRef.current = juntarTranscricoes(finaisAcumuladosRef.current, ...novos);
        }
        finaisVistos = quantosFinais;

        setTexto(finaisAcumuladosRef.current);
        setTextoParcial(parcial);
        // Depois dos estados de propósito: um callback pode limpar a transcrição
        // (modo palavra-chave) e esse limpar precisa vencer os `setTexto`.
        if (novos.length > 0) aoResultadoFinalRef.current?.(juntarTranscricoes(...novos));
      };

      recognition.onerror = (event: any) => {
        reconhecimentoRef.current = null;
        setErro(event.error);
        setOuvindo(false);
      };

      recognition.onend = () => {
        reconhecimentoRef.current = null;
        setOuvindo(false);
        // O parcial fica: sem `result` final ele ainda é o final da frase
        // (o mesmo raciocínio do `end` nativo).
      };

      reconhecimentoRef.current = recognition;

      try {
        recognition.start();
      } catch {
        reconhecimentoRef.current = null;
        setErro('Erro ao iniciar reconhecimento');
      }
    } else {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        setErro('Permissão de microfone negada');
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang: 'pt-BR',
        interimResults: true,
        continuous: true,
      });
    }
  }, []);

  const parar = useCallback(() => {
    // NÃO commitar o parcial aqui: no Android o `stop()` só emite o `result`
    // final DEPOIS (ver README do expo-speech-recognition). Quem processa o
    // texto (app/index) espera esse resultado final chegar.
    if (WEB) {
      // Precisa parar a MESMA instância criada em iniciar(); uma nova instância
      // nunca foi iniciada e o stop() dela não encerra nada.
      try {
        reconhecimentoRef.current?.stop();
      } catch {
        // navegador sem suporte a parada do reconhecimento
      }
      reconhecimentoRef.current = null;
    } else {
      ExpoSpeechRecognitionModule.stop();
    }
  }, []);

  const limparTexto = useCallback(() => {
    finaisAcumuladosRef.current = '';
    setTexto('');
    setTextoParcial('');
  }, []);

  return { ouvindo, texto, textoParcial, iniciar, parar, limparTexto, erro, suportado };
}
