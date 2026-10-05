import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AreaTranscricao } from '../componentes/area-transcricao';
import { BotaoMicrofone } from '../componentes/botao-microfone';
import { Cabecalho } from '../componentes/cabecalho';
import { PainelAjuda } from '../componentes/painel-ajuda';
import { VisorResultado } from '../componentes/visor-resultado';
import { Cores } from '../constantes/cores';
import { AMOSTRA_VOZ, MENSAGENS, TopicoAjuda } from '../constantes/mensagens';
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
  const aviso = erro || (!suportado ? 'Reconhecimento de voz não suportado neste dispositivo' : null);

  const aplicarResultado = useCallback(
    (res: ResultadoProcessamento) => {
      if (res.tipo === 'ajuda' && res.topico === 'repetir') {
        const anterior = resultadoRef.current;
        if (anterior?.tipo === 'conta' || anterior?.tipo === 'temperatura' || anterior?.tipo === 'conversao') {
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
      <Cabecalho
        cores={cores}
        tema={tema}
        aoInverterTema={inverterTema}
        aoAlternarAjuda={() => setMostrarAjuda((atual) => !atual)}
      />

      {mostrarAjuda && (
        <PainelAjuda
          cores={cores}
          vozes={vozes}
          vozAtual={vozAtual}
          velocidade={velocidade}
          aoEscolherTopico={falarTopico}
          aoTrocarVoz={handleProximaVoz}
          aoTrocarVelocidade={handleProximaVelocidade}
        />
      )}

      <AreaTranscricao
        cores={cores}
        ouvindo={ouvindo}
        editando={editando}
        textoExibicao={textoExibicao}
        textoLegenda={textoLegenda}
        textoDigitado={textoDigitado}
        aoDigitado={setTextoDigitado}
        aoEnviar={handleEnviarTexto}
        aoEditar={() => setEditando(true)}
        aoSairDaEdicao={() => setEditando(false)}
      />

      <VisorResultado cores={cores} resultado={resultado} />

      <BotaoMicrofone
        cores={cores}
        ouvindo={ouvindo}
        aoPressionar={() => {
          pararFala();
          iniciar();
        }}
        aoSoltar={handleParar}
      />

      {aviso && (
        <Text style={[styles.erro, { color: cores.erro }]}>Erro: {aviso}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
