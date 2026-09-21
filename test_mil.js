function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function substituirPalavrasNumeros(texto) {
  let resultado = normalizar(texto);

  const compostos = {
    'onze': 11, 'doze': 12, 'treze': 13, 'catorze': 14, 'quinze': 15,
    'dezesseis': 16, 'dezessete': 17, 'dezoito': 18, 'dezenove': 19,
    'vinte': 20, 'trinta': 30, 'quarenta': 40, 'cinquenta': 50,
    'sessenta': 60, 'setenta': 70, 'oitenta': 80, 'noventa': 90,
    'cem': 100, 'cento': 100,
    'duzentos': 200, 'trezentos': 300, 'quatrocentos': 400,
    'quinhentos': 500, 'seiscentos': 600, 'setecentos': 700,
    'oitocentos': 800, 'novecentos': 900,
  };

  const PALAVRAS_NUMEROS = {
    zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4,
    cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10,
    onze: 11, doze: 12, treze: 13, catorze: 14, quinze: 15,
    vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50,
    sessenta: 60, setenta: 70, oitenta: 80, noventa: 90,
    cem: 100, cento: 100,
  };

  for (const [palavra, valor] of Object.entries(compostos)) {
    resultado = resultado.replace(new RegExp(`\\b${palavra}\\b`, 'g'), String(valor));
  }

  for (const [palavra, valor] of Object.entries(PALAVRAS_NUMEROS)) {
    resultado = resultado.replace(new RegExp(`\\b${palavra}\\b`, 'g'), String(valor));
  }

  resultado = resultado.replace(/(\d+(?:\s*e\s*\d+)*)\s*(?:milhao|milhoes)\b/g, (_, compound) => {
    const sum = compound.split(/\s*e\s*/).reduce((acc, n) => acc + Number(n), 0);
    return String(sum * 1000000);
  });
  resultado = resultado.replace(/(?<!\d)\s*(?:milhao|milhoes)\b/g, '1000000');

  resultado = resultado.replace(/(\d{1,6}(?:\s*e\s*\d{1,6})*)\s*mil\s+e\s+(\d+)/g, (_, compound, resto) => {
    const sum = compound.split(/\s*e\s*/).reduce((acc, n) => acc + Number(n), 0);
    return String(sum * 1000 + Number(resto));
  });
  resultado = resultado.replace(/(\d{1,6}(?:\s*e\s*\d{1,6})*)\s*mil\b/g, (_, compound) => {
    const sum = compound.split(/\s*e\s*/).reduce((acc, n) => acc + Number(n), 0);
    return String(sum * 1000);
  });
  resultado = resultado.replace(/(?<!\d)\s*mil\s+e\s+(\d+)/g, (_, resto) => String(1000 + Number(resto)));
  resultado = resultado.replace(/(?<!\d)\s*mil\b/g, '1000');

  let anterior = '';
  while (anterior !== resultado) {
    anterior = resultado;
    resultado = resultado.replace(/(\d+)\s*e\s*(\d+)/g, (_, a, b) => String(Number(a) + Number(b)));
    resultado = resultado.replace(/(\d+)\s+(\d+)/g, (_, a, b) => String(Number(a) + Number(b)));
  }

  return resultado;
}

function processarComando(texto) {
  let processado = substituirPalavrasNumeros(texto);
  console.log('  After substituirPalavrasNumeros:', processado);

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
  console.log('  After operator replacement:', processado);

  processado = processado.replace(/\.(\d{3})(?=\D|$)/g, '$1');
  console.log('  After dot removal:', processado);

  processado = processado.replace(/[^0-9+\-*/().]/g, ' ').replace(/\s+/g, ' ').trim();
  console.log('  After sanitization:', processado);

  return processado;
}

console.log('=== Test 1: 5 milhoes 698.452 + 8956 ===');
processarComando('5 milhoes 698.452 + 8956');

console.log('\n=== Test 2: 5.698.452 + 8.956 ===');
processarComando('5.698.452 + 8.956');

console.log('\n=== Test 3: um milhao 568.984 + 4.568 ===');
processarComando('um milhao 568.984 + 4.568');

console.log('\n=== Test 4: 5 milhoes + 8956 ===');
processarComando('5 milhoes + 8956');
