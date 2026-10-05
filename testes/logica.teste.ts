import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatarParaFala, processarComando, ResultadoProcessamento } from '../funcoes/logica';

function calcular(texto: string): ResultadoProcessamento {
  return processarComando(texto);
}

function expressaoDe(texto: string): string {
  const resultado = processarComando(texto);
  assert.equal(resultado.tipo, 'conta', `"${texto}" deveria ser uma conta`);
  return String(resultado.expressao);
}

describe('operacoes basicas', () => {
  it('respeita precedencia de multiplicacao sobre soma', () => {
    assert.equal(contar('cinco mais tres vezes dois'), 11);
    assert.equal(expressaoDe('cinco mais tres vezes dois'), '5 + 3 * 2');
  });

  it('respeita associatividade da esquerda', () => {
    assert.equal(contar('dez menos quatro menos dois'), 4);
    assert.equal(contar('vinte dividido por cinco mais um'), 5);
  });

  it('aceita conta digitada sem espacos', () => {
    assert.equal(contar('2+3'), 5);
    assert.equal(contar('2+3*4'), 14);
  });

  it('aceita resultados negativos', () => {
    assert.equal(contar('zero menos cinco'), -5);
    assert.equal(contar('100 menos 200'), -100);
  });

  it('conhece os operadores por extenso', () => {
    assert.equal(contar('cem menos um'), 99);
    assert.equal(contar('sete vezes tres menos quatro'), 17);
    assert.equal(contar('dois multiplicar tres'), 6);
    assert.equal(contar('oito subtrair dois'), 6);
    assert.equal(contar('dois mais tres'), 5);
    assert.equal(contar('quatro x cinco'), 20);
  });
});

describe('numeros por extenso', () => {
  it('soma termos ligados por "e"', () => {
    assert.equal(contar('cento e vinte'), 120);
    assert.equal(contar('um milhao e duzentos mil'), 1200000);
  });

  it('resolve milhares compostos', () => {
    assert.equal(contar('mil e quinhentos e vinte dividido por dois'), 760);
    assert.equal(contar('dois mil'), 2000);
  });

  it('funciona junto com operadores', () => {
    assert.equal(contar('duzentos dividido por quatro'), 50);
  });
});

describe('decimais', () => {
  it('aceita virgula digitada', () => {
    assert.equal(contar('2,5 mais 1'), 3.5);
  });

  it('aceita virgula falada', () => {
    assert.equal(contar('dois virgula cinco mais um'), 3.5);
  });

  it('aceita ponto falado', () => {
    assert.equal(contar('dois ponto cinco mais um'), 3.5);
  });

  it('nao confunde decimal com separador de milhar', () => {
    assert.equal(contar('0.125 mais 1'), 1.125);
    assert.equal(contar('1.500 menos 1'), 1499);
  });

  it('resolve mistura de milhar e decimal', () => {
    assert.equal(contar('1.500,75 mais 0,25'), 1501);
  });
});

describe('potencias e raizes', () => {
  it('resolve potencia pelo quadrado e pelo cubo', () => {
    assert.equal(contar('cinco ao quadrado'), 25);
    assert.equal(contar('vinte e cinco ao cubo'), 15625);
  });

  it('resolve potencia com expoente', () => {
    assert.equal(contar('dois elevado a tres'), 8);
  });

  it('resolve raizes', () => {
    assert.equal(contar('raiz quadrada de dezesseis'), 4);
    assert.equal(contar('raiz cubica de oito'), 2);
  });
});

describe('conversao de temperatura', () => {
  it('converte celsius para fahrenheit', () => {
    const resultado = calcular('trinta graus celsius para fahrenheit');
    assert.equal(resultado.tipo, 'temperatura');
    assert.equal(resultado.resultado, 86);
    assert.equal(resultado.expressao, '30°C → °F');
    assert.equal(resultado.unidadeSaida, '°F');
  });

  it('converte os seis pares possiveis', () => {
    assert.equal(contarTemperatura('0 celsius para kelvin'), 273.15);
    assert.equal(contarTemperatura('100 kelvin para celsius'), -173.15);
    assert.equal(contarTemperatura('32 fahrenheit para celsius'), 0);
    assert.equal(contarTemperatura('0 kelvin para fahrenheit'), -459.67);
    assert.equal(contarTemperatura('100 celsius para kelvin'), 373.15);
    assert.equal(contarTemperatura('32 fahrenheit para kelvin'), 273.15);
  });
});

describe('conversao de unidades', () => {
  it('converte tempo', () => {
    assert.equal(contarConversao('duas horas para minutos'), 120);
    assert.equal(contarConversao('3 dias para horas'), 72);
    assert.equal(contarConversao('uma semana para dias'), 7);
    assert.equal(contarConversao('1 mes para dias'), 30);
    assert.equal(contarConversao('1 ano para dias'), 365);
    assert.equal(contarConversao('cinquenta minutos para segundos'), 3000);
  });

  it('converte comprimento', () => {
    assert.equal(contarConversao('5 m para cm'), 500);
    assert.equal(contarConversao('2,5 km para m'), 2500);
    assert.equal(contarConversao('100 centimetros para metros'), 1);
    assert.equal(contarConversao('5 metros em centimetros'), 500);
  });

  it('converte velocidade', () => {
    assert.equal(contarConversao('36 km/h para m/s'), 10);
    assert.equal(contarConversao('10 m/s para km/h'), 36);
    assert.equal(contarConversao('72 quilometros por hora para metros por segundo'), 20);
    assert.equal(contarConversao('5 m/s para km/h'), 18);
  });

  it('converte massa', () => {
    assert.equal(contarConversao('2 kg para g'), 2000);
    assert.equal(contarConversao('0,5 tonelada para quilos'), 500);
    assert.equal(contarConversao('cinquenta quilos para gramas'), 50000);
  });

  it('converte area', () => {
    assert.equal(contarConversao('1 hectare para metros quadrados'), 10000);
    assert.equal(contarConversao('2 km2 para m2'), 2000000);
    assert.equal(contarConversao('2500 centimetros quadrados para metros quadrados'), 0.25);
  });

  it('converte dados na escala binaria', () => {
    assert.equal(contarConversao('1 GB para MB'), 1024);
    assert.equal(contarConversao('1 TB para GB'), 1024);
    assert.equal(contarConversao('1 KB para B'), 1024);
    assert.equal(contarConversao('8 bits para bytes'), 1);
    assert.equal(contarConversao('2,5 KB para B'), 2560);
    assert.equal(contarConversao('1 B para KB'), 0.0009765625);
  });

  it('converte volume', () => {
    assert.equal(contarConversao('2 litros para mililitros'), 2000);
    assert.equal(contarConversao('500 ml para litros'), 0.5);
    assert.equal(contarConversao('1 metro cubico para litros'), 1000);
  });

  it('nao corta milissegundos nem mililitros no "mil"', () => {
    assert.equal(contarConversao('500 milissegundos para segundos'), 0.5);
    assert.equal(contarConversao('1000 mililitros para litros'), 1);
  });

  it('aceita o conector "p"', () => {
    assert.equal(contarConversao('5 m p cm'), 500);
  });

  it('ignora preambulo antes do numero', () => {
    assert.equal(contarConversao('quanto é 5 metros em centimetros'), 500);
  });

  it('mostra a unidade de saida no visor', () => {
    const resultado = calcular('5 m para cm');
    assert.equal(resultado.tipo, 'conversao');
    assert.equal(resultado.expressao, '5 m → cm');
    assert.equal(resultado.unidadeSaida, 'cm');
    assert.equal(resultado.resultado, 500);
  });

  it('le a conversao por extenso', () => {
    assert.equal(
      formatarParaFala(calcular('5 m para cm')),
      '5 metros para centímetros é 500',
    );
  });

  it('recusa unidade desconhecida ou repetida', () => {
    assert.equal(calcular('5 bananas para macas').tipo, 'nao_entendi');
    assert.equal(calcular('5 metros para metros').tipo, 'nao_entendi');
  });

  it('recusa categorias diferentes', () => {
    assert.equal(calcular('5 metros para horas').tipo, 'nao_entendi');
    assert.equal(calcular('2 kg para cm').tipo, 'nao_entendi');
  });

  it('sem conector continua sendo conta', () => {
    assert.equal(calcular('5 metros').tipo, 'conta');
    assert.equal(calcular('cinco mais tres').tipo, 'conta');
  });
});

describe('constantes matematicas', () => {
  it('resolve pi e o simbolo π', () => {
    assert.equal(contar('pi'), Math.PI);
    assert.equal(contar('π'), Math.PI);
    assert.ok(Math.abs(contar('pi vezes 2') - 2 * Math.PI) < 1e-10);
  });

  it('resolve euler', () => {
    assert.equal(contar('euler'), Math.E);
    assert.ok(Math.abs(contar('euler mais um') - (Math.E + 1)) < 1e-10);
  });

  it('funciona com potencias e raizes', () => {
    assert.ok(Math.abs(contar('pi ao quadrado') - Math.PI ** 2) < 1e-6);
    assert.ok(Math.abs(contar('raiz quadrada de pi') - Math.sqrt(Math.PI)) < 1e-6);
  });

  it('nao substitui dentro de outras palavras', () => {
    assert.equal(calcular('piramide mais um').tipo, 'nao_entendi');
  });

  it('nao confunde o "e" da soma com euler', () => {
    assert.equal(contar('dois e tres'), 5);
    assert.equal(contar('mil e quinhentos'), 1500);
  });
});

describe('ajuda', () => {
  it('reconhece os gatilhos de cada topico', () => {
    assert.equal(topicoDe('como usar'), 'como-usar');
    assert.equal(topicoDe('lista de operacoes'), 'operacoes');
    assert.equal(topicoDe('lista de conversoes'), 'conversoes');
    assert.equal(topicoDe('lista de comandos'), 'comandos');
    assert.equal(topicoDe('repetir'), 'repetir');
    assert.equal(topicoDe('boas vindas'), 'boas-vindas');
  });

  it('entende sinônimos dos gatilhos', () => {
    assert.equal(topicoDe('como funciona'), 'como-usar');
    assert.equal(topicoDe('temperaturas'), 'conversoes');
    assert.equal(topicoDe('ouvir de novo'), 'repetir');
  });

  it('nao confunde conversa comum com ajuda', () => {
    assert.equal(calcular('ola tudo bem').tipo, 'nao_entendi');
  });
});

describe('entradas invalidas', () => {
  it('reporta texto vazio', () => {
    const resultado = calcular('   ');
    assert.equal(resultado.tipo, 'erro');
    assert.equal(resultado.mensagem, 'Nenhum texto capturado');
  });

  it('reporta operador sem operando', () => {
    assert.equal(calcular('cinco mais').tipo, 'nao_entendi');
    assert.equal(calcular('quatro vezes x dois').tipo, 'nao_entendi');
  });

  it('reporta divisao por zero', () => {
    assert.equal(calcular('dez dividido por zero').tipo, 'erro');
  });

  it('reporta texto que nao e conta nem ajuda', () => {
    assert.equal(calcular('50% de 80').tipo, 'nao_entendi');
  });
});

describe('formatarParaFala', () => {
  it('le a conta por extenso', () => {
    assert.equal(
      formatarParaFala(calcular('cinco mais tres vezes dois')),
      '5 mais 3 vezes 2 é 11',
    );
  });

  it('le o resultado quando a expressao e so um numero', () => {
    assert.equal(formatarParaFala(calcular('cinco ao quadrado')), 'O resultado é 25');
  });

  it('le a conversao de temperatura com os nomes das unidades', () => {
    assert.equal(
      formatarParaFala(calcular('trinta graus celsius para fahrenheit')),
      '30 graus Celsius para Fahrenheit é 86 graus Fahrenheit',
    );
  });

  it('le a mensagem quando nao ha resultado', () => {
    assert.equal(formatarParaFala(calcular('ola tudo bem')), 'Erro, tente novamente');
  });
});

function contar(texto: string): number {
  return contarComTipo(texto, 'conta');
}

function contarTemperatura(texto: string): number {
  return contarComTipo(texto, 'temperatura');
}

function contarConversao(texto: string): number {
  return contarComTipo(texto, 'conversao');
}

function contarComTipo(texto: string, tipo: ResultadoProcessamento['tipo']): number {
  const resultado = processarComando(texto);
  assert.equal(resultado.tipo, tipo, `"${texto}" deveria ser do tipo ${tipo}`);
  assert.ok(resultado.resultado !== undefined);
  return Number(resultado.resultado);
}

function topicoDe(texto: string): string | undefined {
  return processarComando(texto).topico;
}
