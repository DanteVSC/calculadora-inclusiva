import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Cores } from '../constantes/cores';
import { usarTema } from '../hooks/usar-tema';

export default function Index() {
  const { tema, inverterTema } = usarTema();
  const cores = Cores[tema];

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Pressable style={[styles.button, { backgroundColor: cores.secundaria }]} onPress={inverterTema}>
        <Text style={styles.buttonText}>
          Temaaaaa atual: {tema === 'claro' ? 'Claro' : 'Escuro'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});