import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { CoresTipo } from '../constantes/cores';

type BotaoMicrofoneTipo = {
  cores: CoresTipo;
  ouvindo: boolean;
  aoPressionar: () => void;
  aoSoltar: () => void;
};

export function BotaoMicrofone({ cores, ouvindo, aoPressionar, aoSoltar }: BotaoMicrofoneTipo) {
  return (
    <View style={styles.area}>
      <Pressable
        style={[styles.botao, { backgroundColor: ouvindo ? cores.gravando : cores.secundaria }]}
        onPressIn={aoPressionar}
        onPressOut={aoSoltar}
        accessibilityLabel="Microfone"
        accessibilityRole="button"
      >
        <Ionicons name={ouvindo ? 'ellipse-outline' : 'mic'} size={80} color={cores.textoInvertido} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 60,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botao: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
