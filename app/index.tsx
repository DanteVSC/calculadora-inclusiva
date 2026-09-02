import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState, useCallback, useRef } from 'react';
import { Cores } from '../constantes/cores';
import { usarTema } from '../hooks/usar-tema';
import { usarVoz } from '../hooks/usar-voz';
import { processarComando, ResultadoProcessamento } from '../funcoes/logica';

export default function Index() {
  const { tema, inverterTema } = usarTema();
  const cores = Cores[tema];
  const { ouvindo, texto, textoParcial, iniciar, parar, erro, suportado } = usarVoz();
  const [resultado, setResultado] = useState<ResultadoProcessamento | null>(null);
  const [textoDigitado, setTextoDigitado] = useState('');
  const [textoLegenda, setTextoLegenda] = useState('');
  const [editando, setEditando] = useState(false);

  const textoRef = useRef('');
  textoRef.current = texto || textoParcial;

  const textoExibicao = textoParcial || texto;

  const handleParar = useCallback(() => {
    const textoFinal = textoRef.current;
    parar();
    setTimeout(() => {
      if (textoFinal) {
        setTextoLegenda(textoFinal);
        const res = processarComando(textoFinal);
        setResultado(res);
      }
    }, 100);
  }, [parar]);

  const handleEnviarTexto = useCallback(() => {
    if (textoDigitado.trim()) {
      setTextoLegenda(textoDigitado);
      const res = processarComando(textoDigitado);
      setResultado(res);
      setTextoDigitado('');
    }
    setEditando(false);
  }, [textoDigitado]);

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <View style={[styles.header, { backgroundColor: cores.primaria }]}>
        <Pressable onPress={inverterTema}>
          <Ionicons name={tema == 'claro' ? 'moon-outline' : 'sunny-outline' } size={24} color={cores.fundo} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: cores.fundo }]}>Calculadora</Text>
      </View>

      <View style={[styles.banner, { backgroundColor: cores.secundaria }]}>
        <Text style={styles.bannerLabel}>Escutando usuário:</Text>
        {ouvindo ? (
          <Text style={styles.bannerText}>
            "{textoExibicao || '...'}"
          </Text>
        ) : editando ? (
          <TextInput
            style={styles.bannerInput}
            placeholder="Digite uma conta..."
            placeholderTextColor="#ffffff99"
            value={textoDigitado}
            onChangeText={setTextoDigitado}
            onSubmitEditing={handleEnviarTexto}
            onBlur={() => setEditando(false)}
            autoFocus
            returnKeyType="send"
          />
        ) : (
          <Pressable onPress={() => setEditando(true)}>
            <Text style={styles.bannerText}>
              "{textoLegenda || 'Pressione o microfone para gravar e solte quando terminar'}"
            </Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.visor, { backgroundColor: cores.fundo, borderColor: cores.texto }]}>
        <Text style={[styles.visorLabel, { color: cores.texto }]}>Resultado:</Text>
        <Text style={[styles.visorTexto, { color: cores.texto }]}>
          {resultado?.tipo === 'conta'
            ? `${resultado.expressao} = ${resultado.resultado}`
            : resultado?.mensagem || ''}
        </Text>
      </View>

      <View style={styles.micArea}>
        <Pressable
          style={[
            styles.micButton,
            {
              backgroundColor: ouvindo ? '#d84315' : cores.secundaria,
            },
          ]}
          onPressIn={iniciar}
          onPressOut={handleParar}
        >
          <Ionicons name={ouvindo ? "ellipse-outline" : "mic"} size={80} color="#fff" />
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
  visor: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    minHeight: 80,
  },
  visorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  visorTexto: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
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
  bannerInput: {
    color: '#fff',
    fontSize: 20,
    fontStyle: 'italic',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff66',
    paddingVertical: 4,
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
