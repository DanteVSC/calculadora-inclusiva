import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { AreaTranscricao } from '../componentes/area-transcricao';
import { BotaoMicrofone } from '../componentes/botao-microfone';
import { Cabecalho } from '../componentes/cabecalho';
import { PainelAjuda } from '../componentes/painel-ajuda';
import { VisorResultado } from '../componentes/visor-resultado';
import { Cores } from '../constantes/cores';
import {
  AMOSTRA_VOZ,
  MENSAGENS,
  PALAVRA_CHAVE,
  RESPOSTAS_CONFIGURACAO,
  TopicoAjuda,
} from '../constantes/mensagens';
import {
  extrairComandoAposPalavraChave,
  formatarParaFala,
  processarComando,
  ResultadoProcessamento,
} from '../funcoes/logica';
import { usarFala } from '../hooks/usar-fala';
import { usarIntro } from '../hooks/usar-intro';
import { usarPalavraChave } from '../hooks/usar-palavra-chave';
import { usarTema } from '../hooks/usar-tema';
import { usarVoz } from '../hooks/usar-voz';

// O painel de ajuda fecha sozinho depois disso, reiniciando a cada interação.
const TEMPO_PAINEL_AJUDA_MS = 20_000;

// Depois de soltar o microfone o Android ainda está processando o áudio: o
// `stop()` emite o resultado final um pouco depois (fones lentos precisam de
// mais tempo). É o limite de segurança caso nem o `result` nem o `end` cheguem.
const TEMPO_ESPERA_RESULTADO_MS = 3000;

// No modo palavra-chave, depois de a pessoa falar o comando, espera-se isso de
// silêncio (sem parciais nem finais novos) antes de processar o que foi captado.
const TEMPO_SILENCIO_GRAVACAO_MS = 2500;

// 'desligado' = escuta só com botão | 'ocioso' = ouvindo esperando a palavra-
// chave | 'gravando' = palavra-chave ouvida, capturando o comando.
type FaseEscutaTipo = 'desligado' | 'ocioso' | 'gravando';

export default function Index() {
  const { tema, inverterTema } = usarTema();
  const cores = Cores[tema];
  const { introPendente, marcarIntroVista } = usarIntro();
  const { ativo: palavraChaveAtiva, alternar } = usarPalavraChave();
  const { falar, pararFala, falando, vozes, vozAtual, proximaVoz, velocidade, proximaVelocidade } =
    usarFala();
  const [resultado, setResultado] = useState<ResultadoProcessamento | null>(null);
  const [textoDigitado, setTextoDigitado] = useState('');
  const [textoLegenda, setTextoLegenda] = useState('');
  const [editando, setEditando] = useState(false);
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const [atividadeAjuda, setAtividadeAjuda] = useState(0);
  const [fase, setFase] = useState<FaseEscutaTipo>('desligado');

  // Ponte até a máquina de estados definida abaixo (usarVoz é chamado no topo).
  const aoResultadoFinalRef = useRef<(transcricao: string) => void>(() => {});
  const { ouvindo, texto, textoParcial, iniciar, parar, limparTexto, erro, suportado } = usarVoz({
    aoResultadoFinal: useCallback((transcricao: string) => aoResultadoFinalRef.current(transcricao), []),
  });

  const textoRef = useRef('');
  textoRef.current = texto || textoParcial;
  const parcialRef = useRef('');
  parcialRef.current = textoParcial;
  const ouvindoRef = useRef(ouvindo);
  ouvindoRef.current = ouvindo;
  const falandoRef = useRef(falando);
  falandoRef.current = falando;
  const faseRef = useRef(fase);
  faseRef.current = fase;
  const palavraChaveAtivaRef = useRef(palavraChaveAtiva);
  palavraChaveAtivaRef.current = palavraChaveAtiva;

  // true entre "soltou o microfone" e o momento em que o comando é processado;
  // baseCapturaRef guarda o que existia na soltada (parcial) como reserva.
  const aguardandoResultadoRef = useRef(false);
  const baseCapturaRef = useRef('');
  const esperaResultadoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fase 'gravando': o que já foi finalizado, e o cronômetro de silêncio.
  const comandoAcumuladoRef = useRef('');
  const silencioRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resultadoRef = useRef<ResultadoProcessamento | null>(null);
  resultadoRef.current = resultado;

  const textoExibicao = textoParcial || texto;
  // Microfone/área só mostram "gravando" no modo manual ou na fase 'gravando';
  // na escuta ociosa o app ouve em silêncio esperando a palavra-chave.
  const gravandoAgora = ouvindo && fase !== 'ocioso';
  const aviso = erro || (!suportado ? 'Reconhecimento de voz não suportado neste dispositivo' : null);

  const aplicarResultado = useCallback(
    (res: ResultadoProcessamento) => {
      if (res.tipo === 'configuracao' && res.acao) {
        if (res.acao === 'palavra-chave') {
          const ativando = !palavraChaveAtivaRef.current;
          alternar();
          const msg = ativando
            ? RESPOSTAS_CONFIGURACAO.palavraChaveAtivada(PALAVRA_CHAVE)
            : RESPOSTAS_CONFIGURACAO.palavraChaveDesativada;
          setResultado({ ...res, mensagem: msg });
          falar(msg);
          return;
        }
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
    [falar, vozes, proximaVoz, proximaVelocidade, alternar],
  );

  const processarTexto = useCallback(
    (capturado: string) => {
      if (!capturado) return;
      setTextoLegenda(capturado);
      aplicarResultado(processarComando(capturado));
    },
    [aplicarResultado],
  );

  const mudarFase = useCallback((proxima: FaseEscutaTipo) => {
    faseRef.current = proxima;
    setFase(proxima);
  }, []);

  const finalizarGravacao = useCallback(() => {
    if (faseRef.current !== 'gravando') return;
    if (silencioRef.current) {
      clearTimeout(silencioRef.current);
      silencioRef.current = null;
    }
    const capturado = `${comandoAcumuladoRef.current} ${parcialRef.current}`.trim();
    comandoAcumuladoRef.current = '';
    mudarFase('ocioso');
    processarTexto(capturado);
    if (!ouvindoRef.current) iniciar();
  }, [mudarFase, processarTexto, iniciar]);

  const agendarSilencio = useCallback(() => {
    if (silencioRef.current) clearTimeout(silencioRef.current);
    silencioRef.current = setTimeout(finalizarGravacao, TEMPO_SILENCIO_GRAVACAO_MS);
  }, [finalizarGravacao]);

  const retomarOcioso = useCallback(() => {
    if (!palavraChaveAtivaRef.current) return;
    mudarFase('ocioso');
    if (!ouvindoRef.current) iniciar();
  }, [mudarFase, iniciar]);

  const tratarResultadoFinal = useCallback(
    (transcricao: string) => {
      // O próprio TTS não pode ser captado como comando.
      if (falandoRef.current) return;

      if (faseRef.current === 'gravando') {
        comandoAcumuladoRef.current = `${comandoAcumuladoRef.current} ${transcricao}`.trim();
        agendarSilencio();
        return;
      }
      if (faseRef.current !== 'ocioso') return;

      const comando = extrairComandoAposPalavraChave(transcricao, PALAVRA_CHAVE);
      if (comando === null) return;
      if (comando) {
        // Palavra-chave e comando na mesma frase.
        processarTexto(comando);
        if (!ouvindoRef.current) iniciar();
        return;
      }
      // Só a palavra-chave: a partir daqui, capturar o comando.
      comandoAcumuladoRef.current = '';
      mudarFase('gravando');
      agendarSilencio();
    },
    [agendarSilencio, processarTexto, iniciar, mudarFase],
  );
  aoResultadoFinalRef.current = tratarResultadoFinal;

  // Processa a captura pendente (só pode rodar UMA vez por soltada do micro).
  const processarCaptura = useCallback(() => {
    if (!aguardandoResultadoRef.current) return;
    aguardandoResultadoRef.current = false;
    if (esperaResultadoRef.current) {
      clearTimeout(esperaResultadoRef.current);
      esperaResultadoRef.current = null;
    }
    // prefere o resultado final; sem ele, cai no parcial congelado na soltada
    const capturado = textoRef.current || baseCapturaRef.current;
    processarTexto(capturado);
    retomarOcioso();
  }, [processarTexto, retomarOcioso]);

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

  // Liga/desliga o modo palavra-chave (botão ou comando de voz).
  useEffect(() => {
    if (palavraChaveAtiva) {
      mudarFase('ocioso');
      if (!ouvindoRef.current) iniciar();
    } else {
      if (faseRef.current === 'ocioso' || faseRef.current === 'gravando') {
        mudarFase('desligado');
        parar();
      }
      if (silencioRef.current) {
        clearTimeout(silencioRef.current);
        silencioRef.current = null;
      }
    }
  }, [palavraChaveAtiva, iniciar, parar, mudarFase]);

  // Sessão terminou no modo ocioso (silêncio do reconhecidor): recomeça.
  useEffect(() => {
    if (ouvindo) return;
    if (!palavraChaveAtivaRef.current) return;
    if (erro && erro !== 'no-speech') return;
    if (faseRef.current === 'ocioso') iniciar();
  }, [ouvindo, erro, iniciar]);

  // Parciais na fase 'gravando' reiniciam o cronômetro de silêncio.
  useEffect(() => {
    if (faseRef.current === 'gravando' && textoParcial) agendarSilencio();
  }, [textoParcial, agendarSilencio]);

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
    aguardandoResultadoRef.current = false;
    if (esperaResultadoRef.current) {
      clearTimeout(esperaResultadoRef.current);
      esperaResultadoRef.current = null;
    }
    if (silencioRef.current) {
      clearTimeout(silencioRef.current);
      silencioRef.current = null;
    }
    comandoAcumuladoRef.current = '';
    mudarFase('desligado');
    pararFala();
    // Com a escuta ociosa ligada a sessão já está ativa: só limpar a exibição
    // e assumir (chamar start() de novo o Android costuma recusar).
    limparTexto();
    if (!ouvindoRef.current) iniciar();
  }, [pararFala, iniciar, limparTexto, mudarFase]);

  const handleParar = useCallback(() => {
    aguardandoResultadoRef.current = true;
    baseCapturaRef.current = textoRef.current;
    parar();
    if (texto || !ouvindo) {
      // resultado final já tinha chegado, ou a sessão já encerrou (silêncio/
      // erro): nada mais vem, processa já.
      processarCaptura();
      return;
    }
    esperaResultadoRef.current = setTimeout(processarCaptura, TEMPO_ESPERA_RESULTADO_MS);
  }, [parar, texto, ouvindo, processarCaptura]);

  // O resultado final chegou (evento `result` com isFinal) antes do timeout.
  useEffect(() => {
    if (aguardandoResultadoRef.current && texto) processarCaptura();
  }, [texto, processarCaptura]);

  // A sessão encerrou (evento `end`): depois dele não vem mais nada.
  useEffect(() => {
    if (aguardandoResultadoRef.current && !ouvindo) processarCaptura();
  }, [ouvindo, processarCaptura]);

  const handleEnviarTexto = useCallback(() => {
    if (textoDigitado.trim()) {
      processarTexto(textoDigitado.trim());
      setTextoDigitado('');
    }
    setEditando(false);
  }, [textoDigitado, processarTexto]);

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
          palavraChaveAtiva={palavraChaveAtiva}
          aoEscolherTopico={falarTopico}
          aoTrocarVoz={handleProximaVoz}
          aoTrocarVelocidade={handleProximaVelocidade}
          aoAlternarPalavraChave={alternar}
        />
      )}

      <AreaTranscricao
        cores={cores}
        ouvindo={gravandoAgora}
        editando={editando}
        textoExibicao={textoExibicao}
        textoLegenda={textoLegenda}
        textoDigitado={textoDigitado}
        dica={palavraChaveAtiva ? `Diga "${PALAVRA_CHAVE}" e depois o comando` : undefined}
        aoDigitado={setTextoDigitado}
        aoEnviar={handleEnviarTexto}
        aoEditar={() => setEditando(true)}
        aoSairDaEdicao={() => setEditando(false)}
      />

      <VisorResultado cores={cores} resultado={resultado} />

      <BotaoMicrofone
        cores={cores}
        ouvindo={gravandoAgora}
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
