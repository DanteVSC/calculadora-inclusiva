const PALAVRAS_NUMEROS: Record<string, number> = {
  zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4,
  cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10,
  onze: 11, doze: 12, treze: 13, catorze: 14, quinze: 15,
  vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50,
  sessenta: 60, setenta: 70, oitenta: 80, noventa: 90,
  cem: 100, cento: 100,
};

const OPERACOES: Record<string, string> = {
  mais: '+', 'e': '+', plus: '+',
  menos: '-', subtrair: '-',
  vezes: '*', 'x': '*', multiplicar: '*',
  dividir: '/', 'dividido': '/',
};

function palavraParaNumero(palavra: string): number | null {
  const p = palavra.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (PALAVRAS_NUMEROS[p] !== undefined) {
    return PALAVRAS_NUMEROS[p];
  }

  const num = parseFloat(p);
  if (!isNaN(num)) return num;

  return null;
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function substituirPalavrasNumeros(texto: string): string {
  let resultado = normalizar(texto);

  const compostos: Record<string, number> = {
    'onze': 11, 'doze': 12, 'treze': 13, 'catorze': 14, 'quinze': 15,
    'dezesseis': 16, 'dezessete': 17, 'dezoito': 18, 'dezenove': 19,
    'vinte': 20, 'trinta': 30, 'quarenta': 40, 'cinquenta': 50,
    'sessenta': 60, 'setenta': 70, 'oitenta': 80, 'noventa': 90,
    'cem': 100, 'cento': 100,
    'duzentos': 200, 'trezentos': 300, 'quatrocentos': 400,
    'quinhentos': 500, 'seiscentos': 600, 'setecentos': 700,
    'oitocentos': 800, 'novecentos': 900,
  };

  for (const [palavra, valor] of Object.entries(compostos)) {
    resultado = resultado.replace(new RegExp(`\\b${palavra}\\b`, 'g'), String(valor));
  }

  for (const [palavra, valor] of Object.entries(PALAVRAS_NUMEROS)) {
    resultado = resultado.replace(new RegExp(`\\b${palavra}\\b`, 'g'), String(valor));
  }

  resultado = resultado.replace(/(\d+(?:\s*e\s*\d+)*)\s*mil\s+e\s+(\d+)/g, (_, compound, resto) => {
    const sum = compound.split(/\s*e\s*/).reduce((acc: number, n: string) => acc + Number(n), 0);
    return String(sum * 1000 + Number(resto));
  });
  resultado = resultado.replace(/(\d+(?:\s*e\s*\d+)*)\s*mil\b/g, (_, compound) => {
    const sum = compound.split(/\s*e\s*/).reduce((acc: number, n: string) => acc + Number(n), 0);
    return String(sum * 1000);
  });
  resultado = resultado.replace(/(?<!\d)\s*mil\s+e\s+(\d+)/g, (_, resto) => String(1000 + Number(resto)));
  resultado = resultado.replace(/(?<!\d)\s*mil\b/g, '1000');

  let anterior = '';
  while (anterior !== resultado) {
    anterior = resultado;
    resultado = resultado.replace(/(\d+)\s*e\s*(\d+)/g, (_, a, b) => String(Number(a) + Number(b)));
  }

  return resultado;
}

export type ResultadoProcessamento = {
  tipo: 'conta' | 'temperatura' | 'erro' | 'nao_entendi';
  expressao?: string;
  resultado?: number | string;
  mensagem?: string;
};

const UNIDADES_TEMP: Record<string, string> = {
  celsius: 'C', c: 'C', centigrado: 'C', centigrados: 'C',
  fahrenheit: 'F', f: 'F',
  kelvin: 'K', kelvins: 'K', k: 'K',
};

const SIMBOLOS_TEMP: Record<string, string> = {
  C: '°C', F: '°F', K: 'K',
};

function converterTemperatura(texto: string): ResultadoProcessamento | null {
  const t = substituirPalavrasNumeros(texto);

  const match = t.match(
    /(\d+(?:[.,]\d+)?)\s*(?:graus\s*)?(celsius|fahrenheit|kelvin|c|f|k)\s*(?:para|em|p|pro|pra)\s*(celsius|fahrenheit|kelvin|c|f|k)/i
  );

  if (!match) return null;

  const valor = parseFloat(match[1].replace(',', '.'));
  const de = UNIDADES_TEMP[match[2].toLowerCase()];
  const para = UNIDADES_TEMP[match[3].toLowerCase()];

  if (!de || !para || de === para) return null;

  let resultado: number;
  const expressao = `${valor}${SIMBOLOS_TEMP[de]} → ${para}`;

  switch (`${de}${para}`) {
    case 'CF': resultado = valor * 1.8 + 32; break;
    case 'CK': resultado = valor + 273.15; break;
    case 'FC': resultado = (valor - 32) / 1.8; break;
    case 'FK': resultado = (valor - 32) / 1.8 + 273.15; break;
    case 'KC': resultado = valor - 273.15; break;
    case 'KF': resultado = (valor - 273.15) * 1.8 + 32; break;
    default: return null;
  }

  return { tipo: 'temperatura', expressao, resultado: Number(resultado.toFixed(2)) };
}

export function processarComando(texto: string): ResultadoProcessamento {
  if (!texto || texto.trim().length === 0) {
    return { tipo: 'erro', mensagem: 'Nenhum texto capturado' };
  }

  const temp = converterTemperatura(texto);
  if (temp) return temp;

  let processado = substituirPalavrasNumeros(texto);

  processado = processado
    .replace(/mais/g, '+')
    .replace(/menos/g, '-')
    .replace(/vezes/g, '*')
    .replace(/\bx\b/g, '*')
    .replace(/dividido/g, '/')
    .replace(/dividir/g, '/')
    .replace(/multiplicar/g, '*')
    .replace(/subtrair/g, '-')
    .replace(/por(?=\s*\d)/g, '*');

  processado = processado.replace(/[^0-9+\-*/().]/g, ' ').replace(/\s+/g, ' ').trim();

  const partes = processado.split(' ').filter(Boolean);

  if (partes.length < 3) {
    return { tipo: 'nao_entendi', mensagem: 'Erro, tente novamente' };
  }

  const numeros: number[] = [];
  const operadores: string[] = [];

  for (const parte of partes) {
    if (['+', '-', '*', '/'].includes(parte)) {
      operadores.push(parte);
    } else {
      const n = parseFloat(parte);
      if (!isNaN(n)) {
        numeros.push(n);
      }
    }
  }

  if (numeros.length < 2 || operadores.length < 1) {
    return { tipo: 'nao_entendi', mensagem: 'Erro, tente novamente"' };
  }

  const expressao = numeros.map((n, i) => `${n} ${operadores[i] || ''}`).join(' ').trim();

  try {
    let resultado = numeros[0];
    for (let i = 0; i < operadores.length; i++) {
      const proximo = numeros[i + 1];
      if (proximo === undefined) break;

      switch (operadores[i]) {
        case '+': resultado += proximo; break;
        case '-': resultado -= proximo; break;
        case '*': resultado *= proximo; break;
        case '/':
          if (proximo === 0) {
            return { tipo: 'erro', mensagem: 'Divisao por zero' };
          }
          resultado /= proximo;
          break;
      }
    }

    return { tipo: 'conta', expressao, resultado };
  } catch {
    return { tipo: 'erro', mensagem: 'Erro ao calcular' };
  }
}
