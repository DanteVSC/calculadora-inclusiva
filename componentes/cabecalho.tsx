import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CoresTipo } from '../constantes/cores';
import { TemaTipo } from '../hooks/usar-tema';

type CabecalhoTipo = {
  cores: CoresTipo;
  tema: TemaTipo;
  aoInverterTema: () => void;
  aoAlternarAjuda: () => void;
};

export function Cabecalho({ cores, tema, aoInverterTema, aoAlternarAjuda }: CabecalhoTipo) {
  return (
    <View style={[styles.cabecalho, { backgroundColor: cores.primaria }]}>
      <Pressable onPress={aoInverterTema} accessibilityLabel="Trocar tema">
        <Ionicons
          name={tema === 'claro' ? 'moon-outline' : 'sunny-outline'}
          size={24}
          color={cores.fundo}
        />
      </Pressable>
      <Text style={[styles.titulo, { color: cores.fundo }]}>Calculadora</Text>
      <Pressable
        onPress={aoAlternarAjuda}
        accessibilityLabel="Ajuda"
        accessibilityRole="button"
      >
        <Ionicons name="help-circle-outline" size={26} color={cores.fundo} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
