import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { AreaTranscricao } from '../componentes/area-transcricao';
import { BotaoMicrofone } from '../componentes/botao-microfone';
import { Cabecalho } from '../componentes/cabecalho';
import { PainelAjuda } from '../componentes/painel-ajuda';
import { VisorResultado } from '../componentes/visor-resultado';
import { Cores } from '../constantes/cores';
import { AMOSTRA_VOZ, MENSAGENS, RESPOSTAS_CONFIGURACAO, TopicoAjuda } from '../constantes/mensagens';
import { formatarParaFala, processarComando, ResultadoProcessamento } from '../funcoes/logica';
import { usarFala } from '../hooks/usar-fala';
import { usarIntro } from '../hooks/usar-intro';
import { usarTema } from '../hooks/usar-tema';
import { usarVoz } from '../hooks/usar-voz';

// O painel de ajuda fecha sozinho depois disso, reiniciando a cada interação.
const TEMPO_PAINEL_AJUDA_MS = 20_000;

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
  const [atividadeAjuda, setAtividadeAjuda] = useState(0);

  const textoRef = useRef('');
  textoRef.current = texto || textoParcial;

  const resultadoRef = useRef<ResultadoProcessamento | null>(null);
  resultadoRef.current = resultado;

  const textoExibicao = textoParcial || texto;
  const aviso = erro || (!suportado ? 'Reconhecimento de voz não suportado neste dispositivo' : null);

  const aplicarResultado = useCallback(
    (res: ResultadoProcessamento) => {
      if (res.tipo === 'configuracao' && res.acao) {
        let msg: string;
        if (res.acao === 'voz') {
          if (vozes.length === 0) msg = RESPOSTAS_CONFIGURACAO.vozIndisponivel;
          else if (vozes.length === 1) msg = RESPOSTAS_CONFIGURACAO.vozUnica;
          else msg = RESPOSTAS_CONFIGURACAO.vozAlterada(proximaVoz()?.nome ?? '');
        } else {
          msg = RESPOSTAS_CONFIGURACAO.velocidadeAlterada(proximaVelocidade());
        }
        setResultado({ ...res, mensagem: msg });
        falar(msg);
        return;
      }

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
    [falar, vozes, proximaVoz, proximaVelocidade],
  );

  useEffect(() => {
    if (!introPendente) return;
    falar(MENSAGENS['boas-vindas']);
    marcarIntroVista();
  }, [introPendente, falar, marcarIntroVista]);

  const registrarAtividadeAjuda = useCallback(() => {
    setAtividadeAjuda((atual) => atual + 1);
  }, []);

  useEffect(() => {
    if (!mostrarAjuda) return;
    const timer = setTimeout(() => setMostrarAjuda(false), TEMPO_PAINEL_AJUDA_MS);
    return () => clearTimeout(timer);
  }, [mostrarAjuda, atividadeAjuda]);

  const falarTopico = useCallback(
    (topico: TopicoAjuda) => {
      registrarAtividadeAjuda();
      aplicarResultado({ tipo: 'ajuda', topico, mensagem: MENSAGENS[topico] });
    },
    [aplicarResultado, registrarAtividadeAjuda],
  );

  const handleProximaVoz = useCallback(() => {
    registrarAtividadeAjuda();
    proximaVoz();
    falar(AMOSTRA_VOZ);
  }, [proximaVoz, falar, registrarAtividadeAjuda]);

  const handleProximaVelocidade = useCallback(() => {
    registrarAtividadeAjuda();
    proximaVelocidade();
    falar(AMOSTRA_VOZ);
  }, [proximaVelocidade, falar, registrarAtividadeAjuda]);

  const handlePressionarMicrofone = useCallback(() => {
    pararFala();
    iniciar();
  }, [pararFala, iniciar]);

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
    <Pressable
      // cursor 'auto' anula o 'pointer' que o react-native-web aplica em todo Pressable
      style={[styles.container, { backgroundColor: cores.fundo, cursor: 'auto' }]}
      onPressIn={handlePressionarMicrofone}
      onPressOut={handleParar}
    >
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
        aoPressionar={handlePressionarMicrofone}
        aoSoltar={handleParar}
      />

      {aviso && (
        <Text style={[styles.erro, { color: cores.erro }]}>Erro: {aviso}</Text>
      )}
    </Pressable>
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
