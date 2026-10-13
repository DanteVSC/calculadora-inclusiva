export type TopicoAjuda =
  | 'boas-vindas'
  | 'como-usar'
  | 'operacoes'
  | 'conversoes'
  | 'comandos'
  | 'repetir'
  | 'configuracoes'
  | 'palavra-chave';

export const MENSAGENS: Record<TopicoAjuda, string> = {
  'boas-vindas':
    'Bem-vindo à Calculadora Inclusiva. Pressione sobre a tela, diga a conta ou conversão de valores que você quer fazer, e solte. Para mais informações, diga: "como usar"',
  'como-usar':
    'Para calcular, pressione e segure o microfone, fale a conta, e solte quando terminar. O resultado aparece na tela e é lido em voz alta. Para mais informações diga "lista de comandos"',
  operacoes:
    'Lista de operações: soma, subtração, multiplicação, divisão, potências, raízes, log, módulo e fatorial. Por exemplo: cinco mais três vezes dois; cinco ao quadrado; raiz quadrada de dezesseis; log de cem; cinco fatorial;',
  conversoes:
    'Conversões disponíveis: temperatura, "trinta graus celsius para fahrenheit"; tempo, "duas horas para minutos"; comprimento, "dez metros para centímetros"; velocidade, "quarenta quilômetros por hora para metros por segundo"; massa, "cinquenta quilos para gramas"; área, "dois hectares para metros quadrados"; dados, "um gigabyte para megabytes"; volume, "dois litros para mililitros".',
  comandos:
   'Lista de comandos. diga: "conversões", para escutar a lista de conversões, "operações" para escutar a lista de operações, "repetir", para repetir o resultado da ultima conta ou conversão feita, "configurações", para escutar a lista de configurações. Para usar um comando basta pressionar a tela e soltar após dizer o comando.',
  repetir: 'Nenhum resultado para repetir.',
  configuracoes:
    'Lista de configurações: Diga "voz", para alterar a voz da calculadora, "velocidade", para alterar a velocidade da voz da calculadora, "palavra chave", para ligar ou desligar a escuta por palavra-chave.',
  'palavra-chave':
    'Modo palavra-chave: com ele ligado, fale a palavra calculadora e depois o comando, sem apertar botão nenhum. A gravação do comando para sozinho depois de dois segundos e meio de silêncio. Ative e desative pelo botão Palavra-chave no painel de ajuda ou dizendo "palavra chave".',
};

export const GATILHOS: Record<TopicoAjuda, string[]> = {
  'boas-vindas': ['boas vindas', 'introducao', 'inicio', 'comeco'],
  'como-usar': ['como usar', 'como funciona', 'instrucoes','alo','oi', 'tutorial'],
  operacoes: ['lista de operacoes', 'operacoes', 'contas'],
  conversoes: ['lista de conversoes', 'conversoes', 'temperaturas'],
  comandos: ['lista de comandos', 'ajuda', 'comandos'],
  repetir: ['repetir', 'de novo', 'ouvir de novo'],
  configuracoes: ['configuracoes', 'configuracao', 'ajustes', 'opcoes'],
  // Só gatilhos longos de propósito: o toggle por voz usa "palavra chave"
  // simples e é testado DEPOIS da ajuda (detectarAjuda roda antes). Não usar
  // "como funciona"/"ajuda" aqui: casam antes com os tópicos genéricos.
  'palavra-chave': ['explicar palavra chave', 'o que e a palavra chave', 'falar sem botao'],
};

export const ROTULOS: Record<TopicoAjuda, string> = {
  'boas-vindas': 'Boas-vindas',
  'como-usar': 'Como usar',
  operacoes: 'Operações',
  conversoes: 'Conversões',
  comandos: 'Comandos',
  repetir: 'Repetir',
  configuracoes: 'Configurações',
  'palavra-chave': 'Palavra-chave',
};

export const BOTOES_AJUDA: TopicoAjuda[] = [
  'como-usar',
  'operacoes',
  'conversoes',
  'comandos',
  'repetir',
  'configuracoes',
  'palavra-chave',
];

export const AMOSTRA_VOZ = 'Esta é uma das vozes da calculadora.';

// Comandos de voz que trocam para a próxima voz / próxima velocidade.
// "velocidade da voz" precisa vir na lista de velocidade e ser testada
// ANTES da de voz, senão o "voz" do fim casaria e trocariam a voz errada.
export const GATILHOS_VOZ: string[] = [
  'voz', 'mudar voz', 'mudar a voz', 'alterar voz', 'alterar a voz',
  'trocar voz', 'trocar de voz', 'outra voz', 'proxima voz',
  'fala', 'mudar fala', 'alterar fala', 'trocar fala', 'outra fala',
];

export const GATILHOS_VELOCIDADE: string[] = [
  'velocidade', 'mudar velocidade', 'mudar a velocidade', 'alterar velocidade',
  'alterar a velocidade', 'trocar velocidade', 'outra velocidade',
  'velocidade da voz', 'velocidade da fala', 'velocidade de reproducao',
];

// Respostas faladas ao trocar voz/velocidade por comando de voz.
export const RESPOSTAS_CONFIGURACAO = {
  vozAlterada: (nome: string) => `Voz alterada para ${nome}.`,
  vozUnica: 'Só existe uma voz disponível neste aparelho.',
  vozIndisponivel: 'Nenhuma voz encontrada neste aparelho.',
  velocidadeAlterada: (taxa: number) =>
    `Velocidade alterada para ${taxa.toFixed(1).replace('.', ',')} vezes.`,
  palavraChaveAtivada: (palavra: string) =>
    `Modo palavra-chave ativado. Diga ${palavra} e depois fale o comando.`,
  palavraChaveDesativada: 'Modo palavra-chave desativado.',
};

// Palavra que aciona a escuta sem botão (modo palavra-chave).
export const PALAVRA_CHAVE = 'calculadora';

// Comandos de voz que ligam/desligam o modo palavra-chave (toggle, como voz).
export const GATILHOS_PALAVRA_CHAVE: string[] = [
  'palavra chave', 'escuta continua', 'modo de escuta', 'escutar sem botao',
  'ativar escuta', 'ativa escuta',
];
