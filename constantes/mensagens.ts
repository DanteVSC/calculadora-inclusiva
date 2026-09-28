export type TopicoAjuda =
  | 'boas-vindas'
  | 'como-usar'
  | 'operacoes'
  | 'conversoes'
  | 'comandos'
  | 'repetir';

export const MENSAGENS: Record<TopicoAjuda, string> = {
  'boas-vindas':
    'Bem-vindo à Calculadora Inclusiva. Pressione sobre a tela, digite ou diga a conta ou conversão de valores que você quer fazer, e solte. Para mais informações, diga: lista de comandos.',
  'como-usar':
    'Para calcular, pressione e segure o microfone, fale a conta, e solte quando terminar. O resultado aparece na tela e é lido em voz alta. Também dá para tocar na frase acima e digitar. O ícone de sol ou lua troca o tema claro e escuro.',
  operacoes:
    'Operações: soma, subtração, multiplicação e divisão. Por exemplo: cinco mais três vezes dois. Também tem potências e raízes: cinco ao quadrado, dois elevado a três, raiz quadrada de dezesseis. Números por extenso funcionam: mil e quinhentos e vinte.',
  conversoes:
    'Conversões de temperatura: trinta graus celsius para fahrenheit. Também dá para converter de fahrenheit para celsius, celsius para kelvin, e o inverso de cada um.',
  comandos:
    'Comandos: como usar, lista de operações, lista de conversões, repetir resultado, boas-vindas. Todos podem ser ditos no microfone ou tocados nos botões de ajuda.',
  repetir: 'Nenhum resultado para repetir.',
};

export const GATILHOS: Record<TopicoAjuda, string[]> = {
  'boas-vindas': ['boas vindas', 'introducao', 'inicio', 'comeco'],
  'como-usar': ['como usar', 'como funciona', 'instrucoes'],
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
