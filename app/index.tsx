import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Cores } from '../constantes/cores';
import { usarTema } from '../hooks/usar-tema';
import { usarVoz } from '../hooks/usar-voz';

export default function Index() {
  const { tema, inverterTema } = usarTema();
  const cores = Cores[tema];
  const { ouvindo, texto, textoParcial, iniciar, parar, erro, suportado } = usarVoz();

  const textoExibicao = textoParcial || texto;

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <View style={[styles.header, { backgroundColor: cores.texto }]}>
        <Pressable onPress={inverterTema}>
          <Ionicons name={tema == 'claro' ? 'moon-outline' : 'sunny-outline' } size={24} color={cores.fundo} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: cores.fundo }]}>Calculadora</Text>
        <Pressable>
          <Ionicons name="settings-outline" size={24} color={cores.fundo} />
        </Pressable>
      </View>

      <View style={[styles.banner, { backgroundColor: cores.primaria }]}>
        <Text style={styles.bannerLabel}>Escutando usuário:</Text>
        <Text style={styles.bannerText}>
          "{textoExibicao || (ouvindo ? '...' : 'aperte o botão')}..."
        </Text>
      </View>

      <View style={styles.micArea}>
        <Pressable
          style={[
            styles.micButton,
            {
              backgroundColor: ouvindo ? cores.secundaria : cores.primaria,
            },
          ]}
          onPress={ouvindo ? parar : iniciar}
        >
          <Ionicons name="mic" size={80} color="#fff" />
        </Pressable>
      </View>

      {erro && (
        <Text style={[styles.erro, { color: '#ff4444' }]}>
          Erro: {erro}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 16,
    minHeight: 80,
  },
  bannerLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerText: {
    color: '#fff',
    fontSize: 20,
    fontStyle: 'italic',
  },
  micArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 180,
    height: 180,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  erro: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    textAlign: 'center',
    fontSize: 12,
  },
});
