export type CategoriaUnidade =
  | 'tempo'
  | 'comprimento'
  | 'velocidade'
  | 'massa'
  | 'area'
  | 'dados'
  | 'volume';

export type UnidadeTipo = {
  categoria: CategoriaUnidade;
  sigla: string;
  nome: string;
  plural: string;
  fator: number;
};

type DefinicaoUnidadeTipo = UnidadeTipo & { aliases?: string[] };

// Fator = quanto vale 1 unidade na unidade-base da própria categoria.
// Dados usam a escala binária (1 KB = 1024 B), conforme o resto do app/sistema.
const DEFINICOES: DefinicaoUnidadeTipo[] = [
  { categoria: 'tempo', sigla: 'ms', nome: 'milissegundo', plural: 'milissegundos', fator: 0.001 },
  { categoria: 'tempo', sigla: 's', nome: 'segundo', plural: 'segundos', fator: 1, aliases: ['seg'] },
  { categoria: 'tempo', sigla: 'min', nome: 'minuto', plural: 'minutos', fator: 60 },
  { categoria: 'tempo', sigla: 'h', nome: 'hora', plural: 'horas', fator: 3600 },
  { categoria: 'tempo', sigla: 'd', nome: 'dia', plural: 'dias', fator: 86400 },
  { categoria: 'tempo', sigla: 'semana', nome: 'semana', plural: 'semanas', fator: 604800 },
  { categoria: 'tempo', sigla: 'mês', nome: 'mês', plural: 'meses', fator: 2592000 },
  { categoria: 'tempo', sigla: 'ano', nome: 'ano', plural: 'anos', fator: 31536000 },

  { categoria: 'comprimento', sigla: 'mm', nome: 'milímetro', plural: 'milímetros', fator: 0.001 },
  { categoria: 'comprimento', sigla: 'cm', nome: 'centímetro', plural: 'centímetros', fator: 0.01 },
  { categoria: 'comprimento', sigla: 'dm', nome: 'decímetro', plural: 'decímetros', fator: 0.1 },
  { categoria: 'comprimento', sigla: 'm', nome: 'metro', plural: 'metros', fator: 1 },
  { categoria: 'comprimento', sigla: 'km', nome: 'quilômetro', plural: 'quilômetros', fator: 1000 },

  {
    categoria: 'velocidade', sigla: 'm/s', nome: 'metro por segundo',
    plural: 'metros por segundo', fator: 1, aliases: ['m por segundo', 'metros por segundo'],
  },
  {
    categoria: 'velocidade', sigla: 'km/h', nome: 'quilômetro por hora',
    plural: 'quilômetros por hora', fator: 1 / 3.6, aliases: ['km por hora', 'quilometros por hora'],
  },

  { categoria: 'massa', sigla: 'mg', nome: 'miligrama', plural: 'miligramas', fator: 0.001 },
  { categoria: 'massa', sigla: 'g', nome: 'grama', plural: 'gramas', fator: 1 },
  {
    categoria: 'massa', sigla: 'kg', nome: 'quilo', plural: 'quilos',
    fator: 1000, aliases: ['quilograma', 'quilogramas'],
  },
  { categoria: 'massa', sigla: 't', nome: 'tonelada', plural: 'toneladas', fator: 1000000 },

  {
    categoria: 'area', sigla: 'mm²', nome: 'milímetro quadrado',
    plural: 'milímetros quadrados', fator: 0.000001, aliases: ['mm2'],
  },
  {
    categoria: 'area', sigla: 'cm²', nome: 'centímetro quadrado',
    plural: 'centímetros quadrados', fator: 0.0001, aliases: ['cm2'],
  },
  {
    categoria: 'area', sigla: 'm²', nome: 'metro quadrado',
    plural: 'metros quadrados', fator: 1, aliases: ['m2'],
  },
  { categoria: 'area', sigla: 'ha', nome: 'hectare', plural: 'hectares', fator: 10000 },
  {
    categoria: 'area', sigla: 'km²', nome: 'quilômetro quadrado',
    plural: 'quilômetros quadrados', fator: 1000000, aliases: ['km2'],
  },

  { categoria: 'dados', sigla: 'bit', nome: 'bit', plural: 'bits', fator: 0.125 },
  { categoria: 'dados', sigla: 'B', nome: 'byte', plural: 'bytes', fator: 1, aliases: ['b'] },
  {
    categoria: 'dados', sigla: 'KB', nome: 'kilobyte', plural: 'kilobytes',
    fator: 1024, aliases: ['kb', 'quilobyte', 'quilobytes'],
  },
  { categoria: 'dados', sigla: 'MB', nome: 'megabyte', plural: 'megabytes', fator: 1048576, aliases: ['mb'] },
  {
    categoria: 'dados', sigla: 'GB', nome: 'gigabyte', plural: 'gigabytes',
    fator: 1073741824, aliases: ['gb'],
  },
  {
    categoria: 'dados', sigla: 'TB', nome: 'terabyte', plural: 'terabytes',
    fator: 1099511627776, aliases: ['tb'],
  },

  { categoria: 'volume', sigla: 'ml', nome: 'mililitro', plural: 'mililitros', fator: 0.001 },
  { categoria: 'volume', sigla: 'l', nome: 'litro', plural: 'litros', fator: 1 },
  {
    categoria: 'volume', sigla: 'cm³', nome: 'centímetro cúbico',
    plural: 'centímetros cúbicos', fator: 0.001, aliases: ['cm3'],
  },
  {
    categoria: 'volume', sigla: 'dm³', nome: 'decímetro cúbico',
    plural: 'decímetros cúbicos', fator: 1, aliases: ['dm3'],
  },
  {
    categoria: 'volume', sigla: 'm³', nome: 'metro cúbico',
    plural: 'metros cúbicos', fator: 1000, aliases: ['m3'],
  },
];

function chave(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export const UNIDADES: Record<string, UnidadeTipo> = {};

for (const { aliases, ...unidade } of DEFINICOES) {
  for (const alias of [unidade.sigla, unidade.nome, unidade.plural, ...(aliases ?? [])]) {
    UNIDADES[chave(alias)] = unidade;
  }
}
