import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Cores } from '../constantes/cores';
import { AMOSTRA_VOZ, BOTOES_AJUDA, MENSAGENS, ROTULOS, TopicoAjuda } from '../constantes/mensagens';
import { formatarParaFala, processarComando, ResultadoProcessamento } from '../funcoes/logica';
import { usarFala } from '../hooks/usar-fala';
import { usarIntro } from '../hooks/usar-intro';
import { usarTema } from '../hooks/usar-tema';
import { usarVoz } from '../hooks/usar-voz';

export default function Index() {
  const { tema, inverterTema } = usarTema();
  const cores = Cores[tema];
  const { ouvindo, texto, textoParcial, iniciar, parar, erro, suportado } = usarVoz();
  const { falar, pararFala, vozes, vozAtual, proximaVoz, velocidade, proximaVelocidade } = usarFala();
  const { introPendente, marcarIntroVista } = usarIntro();
  const [resultado, setResultado] = useState<ResultadoProcessamento | null>(null);
  const [textoDigitado, setTextoDigitado] = useState('');
  const [textoLegenda, setTextoLegenda] = useState('');
  const [editando, setEditando] = useState(false);
  const [mostrarAjuda, setMostrarAjuda] = useState(false);

  const textoRef = useRef('');
  textoRef.current = texto || textoParcial;

  const resultadoRef = useRef<ResultadoProcessamento | null>(null);
  resultadoRef.current = resultado;

  const textoExibicao = textoParcial || texto;

  const aplicarResultado = useCallback(
    (res: ResultadoProcessamento) => {
      if (res.tipo === 'ajuda' && res.topico === 'repetir') {
        const anterior = resultadoRef.current;
        if (anterior?.tipo === 'conta' || anterior?.tipo === 'temperatura') {
          falar(formatarParaFala(anterior));
          return;
        }
        setResultado(res);
        falar(res.mensagem || MENSAGENS.repetir);
        return;
      }

      setResultado(res);
      falar(formatarParaFala(res));
    },
    [falar],
  );

  useEffect(() => {
    if (!introPendente) return;
    falar(MENSAGENS['boas-vindas']);
    marcarIntroVista();
  }, [introPendente, falar, marcarIntroVista]);

  const falarTopico = useCallback(
    (topico: TopicoAjuda) => {
      aplicarResultado({ tipo: 'ajuda', topico, mensagem: MENSAGENS[topico] });
    },
    [aplicarResultado],
  );

  const handleProximaVoz = useCallback(() => {
    proximaVoz();
    falar(AMOSTRA_VOZ);
  }, [proximaVoz, falar]);

  const handleProximaVelocidade = useCallback(() => {
    proximaVelocidade();
    falar(AMOSTRA_VOZ);
  }, [proximaVelocidade, falar]);

  const handleParar = useCallback(() => {
    const textoFinal = textoRef.current;
    parar();
    setTimeout(() => {
      if (textoFinal) {
        setTextoLegenda(textoFinal);
        const res = processarComando(textoFinal);
        aplicarResultado(res);
      }
    }, 100);
  }, [parar, aplicarResultado]);

  const handleEnviarTexto = useCallback(() => {
    if (textoDigitado.trim()) {
      setTextoLegenda(textoDigitado);
      const res = processarComando(textoDigitado);
      aplicarResultado(res);
      setTextoDigitado('');
    }
    setEditando(false);
  }, [textoDigitado, aplicarResultado]);

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <View style={[styles.header, { backgroundColor: cores.primaria }]}>
        <Pressable onPress={inverterTema} accessibilityLabel="Trocar tema">
          <Ionicons name={tema == 'claro' ? 'moon-outline' : 'sunny-outline' } size={24} color={cores.fundo} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: cores.fundo }]}>Calculadora</Text>
        <Pressable
          onPress={() => setMostrarAjuda((atual) => !atual)}
          accessibilityLabel="Ajuda"
          accessibilityRole="button"
        >
          <Ionicons name="help-circle-outline" size={26} color={cores.fundo} />
        </Pressable>
      </View>

      {mostrarAjuda && (
        <View style={[styles.painelAjuda, { backgroundColor: cores.primaria }]}>
          {BOTOES_AJUDA.map((topico) => (
            <Pressable
              key={topico}
              style={[styles.botaoAjuda, { backgroundColor: cores.fundo }]}
              onPress={() => falarTopico(topico)}
              accessibilityRole="button"
              accessibilityLabel={ROTULOS[topico]}
            >
              <Text style={[styles.botaoAjudaTexto, { color: cores.texto }]}>
                {ROTULOS[topico]}
              </Text>
            </Pressable>
          ))}

          {vozes.length > 1 && (
            <Pressable
              style={[styles.botaoAjuda, styles.botaoAjudaAudio, { backgroundColor: cores.fundo }]}
              onPress={handleProximaVoz}
              accessibilityRole="button"
              accessibilityLabel={`Trocar voz. Voz atual: ${vozAtual?.nome || 'padrão'}`}
            >
              <Text style={[styles.botaoAjudaTexto, { color: cores.texto }]}>Voz</Text>
              <Text style={[styles.botaoAjudaValor, { color: cores.texto }]} numberOfLines={1}>
                {vozAtual?.nome || 'Padrão'}
              </Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.botaoAjuda, styles.botaoAjudaAudio, { backgroundColor: cores.fundo }]}
            onPress={handleProximaVelocidade}
            accessibilityRole="button"
            accessibilityLabel={`Velocidade da fala: ${velocidade.toFixed(1).replace('.', ',')} vezes`}
          >
            <Text style={[styles.botaoAjudaTexto, { color: cores.texto }]}>Velocidade</Text>
            <Text style={[styles.botaoAjudaValor, { color: cores.texto }]}>
              {velocidade.toFixed(1).replace('.', ',')}×
            </Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.banner, { backgroundColor: cores.secundaria }]}>
        <Text style={styles.bannerLabel}>Escutando usuário:</Text>
        {ouvindo ? (
          <Text style={styles.bannerText}>
            "{textoExibicao || '...'}"
          </Text>
        ) : editando ? (
          <TextInput
            style={styles.bannerInput}
            placeholder="Conta ou conversão de temperatura..."
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
        <Text
          style={[
            resultado?.tipo === 'ajuda' ? styles.visorTextoMenor : styles.visorTexto,
            { color: cores.texto },
          ]}
        >
          {resultado?.tipo === 'conta' || resultado?.tipo === 'temperatura'
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
          onPressIn={() => {
            pararFala();
            iniciar();
          }}
          onPressOut={handleParar}
          accessibilityLabel="Microfone"
          accessibilityRole="button"
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
  visorTextoMenor: {
    fontSize: 16,
    lineHeight: 22,
  },
  painelAjuda: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  botaoAjuda: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#00000033',
  },
  botaoAjudaTexto: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  botaoAjudaAudio: {
    maxWidth: 190,
    gap: 2,
  },
  botaoAjudaValor: {
    fontSize: 13,
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
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 60,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: '100%',
    height: '100%',
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
