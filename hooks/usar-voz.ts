import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

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
    setTextoParcial('');
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results.length > 0) {
      const r = event.results[0];
      if (event.isFinal) {
        setTexto(r.transcript);
        setTextoParcial('');
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

      try {
        recognition.start();
      } catch {
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
    setTexto((t) => t || textoParcial);
    setTextoParcial('');

    if (WEB) {
      const recognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (recognition) {
        try { recognition.stop(); } catch {}
      }
    } else {
      ExpoSpeechRecognitionModule.stop();
    }
  }, [textoParcial]);

  return { ouvindo, texto, textoParcial, iniciar, parar, erro, suportado };
}
