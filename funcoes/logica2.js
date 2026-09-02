const PALAVRAS_NUMEROS = {
    "zero": 0, "um": 1, "uma": 1, "dois": 2, "duas": 2, "tres": 3, "quatro": 4,
    "cinco": 5, "seis": 6, "sete": 7, "oito": 8, "nove": 9, "dez": 10,
    "onze": 11, "doze": 12, "treze": 13, "catorze": 14, "quinze": 15,
    "vinte": 20, "trinta": 30, "quarenta": 40, "cinquenta": 50,
    "sessenta": 60, "setenta": 70, "oitenta": 80, "noventa": 90,
    "cem": 100, "duzentos": 200, "trezentos": 300, "quatrocentos": 400, "quinhentos": 500,
    "cento": 100, "mil": 1000,
  };
  
  const OPERACOES = {
    "mais": '+',
    "menos": '-', "subtrair": '-',
    "vezes": '*', 'x': '*', "multiplicar": '*',
    "dividir": '/', "dividido": '/',
  };
  
  function normalizar(texto){
    return texto
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove acentos
  }
  
  function substituirPalavrasNumeros(texto) {
    let resultado = texto;

    for (let palavra of Object.keys(PALAVRAS_NUMEROS)) {
      resultado = resultado.replace(palavra, PALAVRAS_NUMEROS[palavra]);
    }
  
    let palavras = resultado.split(/\s+/);
    let index = 0;
    for (let palavra of palavras){
      if (palavra == "e"){
        palavras[index-1] = "(" + palavras[index-1];
        palavras[index] = "+";
        palavras[index+1] = palavras[index+1] + ")";
      }
      index += 1;
    }

    resultado = ""
    for (let palavra of palavras){
        resultado += palavra + " "
    }
  
    return resultado;
  }

  function substituirOperacoes(texto) {
    let resultado = texto;

    for (const palavra of Object.keys(OPERACOES)) {
      resultado = resultado.replace(palavra, OPERACOES[palavra]);
    }

    return resultado;
  }

  function processarComando(texto){
    let resultado = normalizar(texto);
    resultado = substituirPalavrasNumeros(resultado);
    resultado = substituirOperacoes(resultado);

    return resultado
  }
  
console.log(processarComando("mil e quinhentos e vinte e dois menos tres"))
