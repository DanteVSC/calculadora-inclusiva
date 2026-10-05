export type TopicoAjuda =
  | 'boas-vindas'
  | 'como-usar'
  | 'operacoes'
  | 'conversoes'
  | 'comandos'
  | 'repetir';

export const MENSAGENS: Record<TopicoAjuda, string> = {
  'boas-vindas':
    'Bem-vindo à Calculadora Inclusiva. Pressione sobre a tela, diga a conta ou conversão de valores que você quer fazer, e solte. Para mais informações, diga: "como usar"',
  'como-usar':
    'Para calcular, pressione e segure o microfone, fale a conta, e solte quando terminar. O resultado aparece na tela e é lido em voz alta. Para mais informações diga "lista de comandos"',
  operacoes:
    'Operações: soma, subtração, multiplicação e divisão. Por exemplo: cinco mais três vezes dois. Também tem potências e raízes: cinco ao quadrado, dois elevado a três, raiz quadrada de dezesseis.',
  conversoes:
    'Conversões disponíveis: temperatura, "trinta graus celsius para fahrenheit"; tempo, "duas horas para minutos"; comprimento, "dez metros para centímetros"; velocidade, "quarenta quilômetros por hora para metros por segundo"; massa, "cinquenta quilos para gramas"; área, "dois hectares para metros quadrados"; dados, "um gigabyte para megabytes"; volume, "dois litros para mililitros".',
  comandos:
   'Comandos disponiveis: "conversões", para escutar a lista de conversões, "operações" para escutar a lista de operações. "repetir", para repetir o resultado da ultima conta ou conversão feita. Para usar um comando basta pressionar a tela e soltar após dizer o comando.',
  repetir: 'Nenhum resultado para repetir.',
};

export const GATILHOS: Record<TopicoAjuda, string[]> = {
  'boas-vindas': ['boas vindas', 'introducao', 'inicio', 'comeco'],
  'como-usar': ['como usar', 'como funciona', 'instrucoes','alô','oi', 'tutorial'],
  operacoes: ['lista de operacoes', 'operacoes', 'contas'],
  conversoes: ['lista de conversoes', 'conversoes', 'temperaturas'],
  comandos: ['lista de comandos', 'ajuda', 'comandos'],
  repetir: ['repetir', 'de novo', 'ouvir de novo'],
};

export const ROTULOS: Record<TopicoAjuda, string> = {
  'boas-vindas': 'Boas-vindas',
  'como-usar': 'Como usar',
  operacoes: 'Operações',
  conversoes: 'Conversões',
  comandos: 'Comandos',
  repetir: 'Repetir',
};

export const BOTOES_AJUDA: TopicoAjuda[] = [
  'como-usar',
  'operacoes',
  'conversoes',
  'comandos',
  'repetir',
];

export const AMOSTRA_VOZ = 'Esta é uma das vozes da calculadora.';
