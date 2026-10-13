export type TopicoAjuda =
  | 'boas-vindas'
  | 'como-usar'
  | 'operacoes'
  | 'conversoes'
  | 'comandos'
  | 'repetir'
  | 'configuracoes';

export const MENSAGENS: Record<TopicoAjuda, string> = {
  'boas-vindas':
    'Bem-vindo à Calculadora Inclusiva. Pressione sobre a tela, diga a conta ou conversão de valores que você quer fazer, e solte. Para mais informações, diga: "como usar"',
  'como-usar':
    'Para calcular, pressione e segure o microfone, fale a conta, e solte quando terminar. O resultado aparece na tela e é lido em voz alta. Para mais informações diga "lista de comandos"',
  operacoes:
    'Lista de operações: soma, subtração, multiplicação e divisão. Por exemplo: cinco mais três vezes dois; Potências e raízes: cinco ao quadrado, dois elevado a três, raiz quadrada de dezesseis.',
  conversoes:
    'Conversões disponíveis: temperatura, "trinta graus celsius para fahrenheit"; tempo, "duas horas para minutos"; comprimento, "dez metros para centímetros"; velocidade, "quarenta quilômetros por hora para metros por segundo"; massa, "cinquenta quilos para gramas"; área, "dois hectares para metros quadrados"; dados, "um gigabyte para megabytes"; volume, "dois litros para mililitros".',
  comandos:
   'Lista de comandos. diga: "conversões", para escutar a lista de conversões, "operações" para escutar a lista de operações, "repetir", para repetir o resultado da ultima conta ou conversão feita, "configurações", para escutar a lista de configurações. Para usar um comando basta pressionar a tela e soltar após dizer o comando.',
  repetir: 'Nenhum resultado para repetir.',
  configuracoes: 'Lista de configurações: Diga "voz", para alterar a voz da calculadora, "velocidade", para alterar a velocidade da voz da calculadora.',
};

export const GATILHOS: Record<TopicoAjuda, string[]> = {
  'boas-vindas': ['boas vindas', 'introducao', 'inicio', 'comeco'],
  'como-usar': ['como usar', 'como funciona', 'instrucoes','alo','oi', 'tutorial'],
  operacoes: ['lista de operacoes', 'operacoes', 'contas'],
  conversoes: ['lista de conversoes', 'conversoes', 'temperaturas'],
  comandos: ['lista de comandos', 'ajuda', 'comandos'],
  repetir: ['repetir', 'de novo', 'ouvir de novo'],
  configuracoes: ['configuracoes', 'configuracao', 'ajustes', 'opcoes'],
};

export const ROTULOS: Record<TopicoAjuda, string> = {
  'boas-vindas': 'Boas-vindas',
  'como-usar': 'Como usar',
  operacoes: 'Operações',
  conversoes: 'Conversões',
  comandos: 'Comandos',
  repetir: 'Repetir',
  configuracoes: 'Configurações',
};

export const BOTOES_AJUDA: TopicoAjuda[] = [
  'como-usar',
  'operacoes',
  'conversoes',
  'comandos',
  'repetir',
  'configuracoes',
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
};
