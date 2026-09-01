import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

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

const WEB = Platform.OS === 'web';

export function usarVoz(): ReconhecimentoVozTipo {
  const [ouvindo, setOuvindo] = useState(false);
  const [texto, setTexto] = useState('');
  const [textoParcial, setTextoParcial] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const reconhecimentoRef = useRef<any>(null);

  const suportado = WEB
    ? typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    : true;

  useEffect(() => {
    if (WEB || !suportado) return;

    const Voice = require('@react-native-voice/voice').default;

    const onInicio = () => {
      setOuvindo(true);
      setErro(null);
    };

    const onFim = () => {
      setOuvindo(false);
      setTextoParcial('');
    };

    const onResultado = (e: any) => {
      setTexto(e.value[0] || '');
      setTextoParcial('');
    };

    const onParcial = (e: any) => {
      setTextoParcial(e.value[0] || '');
    };

    const onErro = (e: any) => {
      setErro(String(e.error));
      setOuvindo(false);
    };

    Voice.onSpeechStart = onInicio;
    Voice.onSpeechEnd = onFim;
    Voice.onSpeechResults = onResultado;
    Voice.onSpeechPartialResults = onParcial;
    Voice.onSpeechError = onErro;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [suportado]);

  const iniciar = useCallback(() => {
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

      reconhecimentoRef.current = recognition;

      try {
        recognition.start();
      } catch {
        reconhecimentoRef.current = null;
      }
    } else {
      const Voice = require('@react-native-voice/voice').default;
      Voice.start('pt-BR');
    }
  }, []);

  const parar = useCallback(() => {
    setTexto((t) => t || textoParcial);
    setTextoParcial('');

    if (WEB) {
      if (reconhecimentoRef.current) {
        reconhecimentoRef.current.stop();
        reconhecimentoRef.current = null;
      }
    } else {
      const Voice = require('@react-native-voice/voice').default;
      Voice.stop();
    }
  }, [textoParcial]);

  return { ouvindo, texto, textoParcial, iniciar, parar, erro, suportado };
}
