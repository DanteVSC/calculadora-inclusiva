import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_PALAVRA_CHAVE = 'palavra-chave-ativa';

type PalavraChaveTipo = {
  ativo: boolean;
  alternar: () => void;
};

// Modo de escuta por palavra-chave (ligado/desligado, persistido).
export function usarPalavraChave(): PalavraChaveTipo {
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    let vivo = true;

    AsyncStorage.getItem(CHAVE_PALAVRA_CHAVE)
      .then((valor) => {
        if (vivo && valor === '1') setAtivo(true);
      })
      .catch(() => {});

    return () => {
      vivo = false;
    };
  }, []);

  const alternar = useCallback(() => {
    setAtivo((atual) => {
      AsyncStorage.setItem(CHAVE_PALAVRA_CHAVE, atual ? '0' : '1').catch(() => {});
      return !atual;
    });
  }, []);

  return { ativo, alternar };
}
