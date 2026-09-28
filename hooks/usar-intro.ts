import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_INTRO = 'intro-vista';

type IntroTipo = {
  introPendente: boolean;
  marcarIntroVista: () => void;
};

export function usarIntro(): IntroTipo {
  const [vista, setVista] = useState<boolean | null>(null);

  useEffect(() => {
    let ativo = true;

    AsyncStorage.getItem(CHAVE_INTRO)
      .then((valor) => {
        if (ativo) setVista(valor !== null);
      })
      .catch(() => {
        if (ativo) setVista(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const marcarIntroVista = useCallback(() => {
    setVista(true);
    AsyncStorage.setItem(CHAVE_INTRO, '1').catch(() => {});
  }, []);

  return { introPendente: vista === false, marcarIntroVista };
}
