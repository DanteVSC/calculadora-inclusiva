import { useCallback, useRef, useState } from 'react';

type ReconhecimentoVozTipo = {
  ouvindo: boolean;
  texto: string;
  textoParcial: string;
  iniciar: () => void;
  parar: () => void;
  erro: string | null;
  suportado: boolean;
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function usarVoz(): ReconhecimentoVozTipo {
  const [ouvindo, setOuvindo] = useState(false);
  const [texto, setTexto] = useState('');
  const [textoParcial, setTextoParcial] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const reconhecimentoRef = useRef<any>(null);

  const suportado =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const criarReconhecimento = useCallback(() => {
    if (!suportado) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setOuvindo(true);
      setErro(null);
    };

    recognition.onresult = (event: any) => {
      let textoFinal = '';
      let parcial = '';

      for (let i = 0; i < event.results.length; i++) {
        const resultado = event.results[i];
        if (resultado.isFinal) {
          textoFinal += resultado[0].transcript;
        } else {
          parcial += resultado[0].transcript;
        }
      }

      setTexto(textoFinal);
      setTextoParcial(parcial);
    };

    recognition.onerror = (event: any) => {
      setErro(event.error);
      setOuvindo(false);
    };

    recognition.onend = () => {
      setOuvindo(false);
      setTextoParcial('');
    };

    return recognition;
  }, [suportado]);

  const iniciar = useCallback(() => {
    const recognition = criarReconhecimento();
    if (!recognition) {
      setErro('Reconhecimento de voz não suportado neste navegador');
      return;
    }

    reconhecimentoRef.current = recognition;
    setTexto('');
    setTextoParcial('');
    setErro(null);

    try {
      recognition.start();
    } catch {
      reconhecimentoRef.current = null;
    }
  }, [criarReconhecimento]);

  const parar = useCallback(() => {
    if (reconhecimentoRef.current) {
      reconhecimentoRef.current.stop();
      reconhecimentoRef.current = null;
    }
  }, []);

  return { ouvindo, texto, textoParcial, iniciar, parar, erro, suportado: !!suportado };
}
