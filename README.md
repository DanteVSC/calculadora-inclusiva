# Calculadora Inclusiva

App de calculadora para **Android com suporte web** que entende **comandos de voz e texto em português do Brasil** 
O usuario fala a conta por extenso ("cinco mais três vezes dois") e o app calcula, mostra o resultado formatado em pt-BR e **lê em voz alta**.
Voltado para pessoas com deficiencias visuais ou em membros superiores.

## Baixar o APK

Baixe a versão mais recente direto aqui:

**[⬇️ Baixar calculadora-inclusiva.apk](https://github.com/DanteVSC/calculadora-inclusiva/releases/latest/download/calculadora-inclusiva.apk)**

Ou acesse a página de [releases do projeto](https://github.com/DanteVSC/calculadora-inclusiva/releases) para ver as versões. Instale o APK no Android (é preciso permitir a instalação de apps de fontes desconhecidas) e conceda as permissões de **microfone** e **áudio** quando solicitado.

## Rodar na sua máquina

Pré-requisitos: [Node.js](https://nodejs.org) (LTS) e, para o app nativo, o [Android Studio](https://developer.android.com/studio) com o SDK Android configurado.

```bash
npm install      # instala as dependências
npm start        # inicia o Metro (escaneie o QR code com o Expo Go)
npm run web      # roda direto no navegador
npm run android  # build de desenvolvimento no Android (gera a pasta android/)
```

> **Observação:** o reconhecimento de voz nativo (Android) usa o `expo-speech-recognition`, que **não funciona no Expo Go** — para testar a voz no celular é preciso um dev build (`npm run android`). No **navegador** a voz funciona direto, pela Web Speech API.

## Funcionalidades

- **Operações por voz ou texto** "cinco mais três vezes dois", "cem menos um", "quatro x cinco"
- **Números por extenso** até trilhão: "um bilhão e duzentos milhões"
- **Potências e raízes**: "raiz quadrada de 16", "cinco ao quadrado", "dois elevado a 10"
- **Logaritmo** (base 10): "log de 1000"
- **Fatorial**: "cinco fatorial", "5!"
- **Módulo/resto**: "11 modulo 10", "323 vezes 2 modulo 322"
- **Conversão de temperatura**: "30 graus celsius para fahrenheit"
- **Conversão de unidades**  tempo, comprimento, velocidade, massa, área, dados (gb, mb) e volume: "duas horas para minutos", "1 GB para MB"
- **Constantes**: pi e euler
- **Leitura em voz alta** dos resultados
- **Voz e velocidade configuráveis** por comando de voz ("voz", "velocidade") ou pelo painel de ajuda.
- **Guia por voz**: "como usar", "lista de operações", "lista de conversões", "lista de comandos", "boas-vindas"
- **Interface**, transcrição do que está sendo escrito/apurado na tela e microfone por toque e segurar (tocar em qualquer lugar vazio da tela também grava)

## Estrutura do projeto

- **Expo + React Native + TypeScript** — um único app para Android e web
- **expo-router** — navegação; a tela inteira fica em `app/index.tsx`
- **`funcoes/logica.ts`** — toda a lógica do app (comandos, conversões, constantes)
- **`expo-speech-recognition`** — reconhecimento de voz no Android
- **`Web Speech API`** reconhecimento de voz no navegador
- **`expo-speech`** — interpretar fala
- **`@react-native-async-storage/async-storage`** — salvar dados localmente (configurações)
- **`constantes/`** e **`componentes/`** — textos, paleta de cores por tema e componentes de interface
