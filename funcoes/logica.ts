const PALAVRAS_NUMEROS: Record<string, number> = {
  zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4,
  cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10,
  onze: 11, doze: 12, treze: 13, catorze: 14, quinze: 15,
  vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50,
  sessenta: 60, setenta: 70, oitenta: 80, noventa: 90,
  cem: 100, cento: 100, mil: 1000,
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
    'cem': 100, 'cento': 100, 'mil': 1000,
  };

  for (const [palavra, valor] of Object.entries(compostos)) {
    resultado = resultado.replace(new RegExp(palavra, 'g'), String(valor));
  }

  for (const [palavra, valor] of Object.entries(PALAVRAS_NUMEROS)) {
    resultado = resultado.replace(new RegExp(`\\b${palavra}\\b`, 'g'), String(valor));
  }

  resultado = resultado.replace(/(\d+)\s*e\s*(\d+)/g, (_, a, b) => String(Number(a) + Number(b)));

  return resultado;
}

export type ResultadoProcessamento = {
  tipo: 'conta' | 'erro' | 'nao_entendi';
  expressao?: string;
  resultado?: number | string;
  mensagem?: string;
};

export function processarComando(texto: string): ResultadoProcessamento {
  if (!texto || texto.trim().length === 0) {
    return { tipo: 'erro', mensagem: 'Nenhum texto capturado' };
  }

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
