# Documentação:
https://docs.expo.dev/

# Comando para iniciar o servidor:
npx expo start

# Estrutura de projeto:
app/                → telas e rotas (Expo Router: cada arquivo = uma rota)
assets/             → imagens, fontes, ícones
components/         → componentes reutilizáveis de UI
constants/          → valores fixos (cores, temas, textos)
hooks/              → hooks customizados (ex: useColorScheme)
node_modules/       → dependências instaladas

O gitignore define quais arquivos não vão pro git e github
O readme é a descrição do projeto

o resto não precisa mexer e serve pra configurações especificas ou para o react e outras coisas funcionarem.

*** Arquivos ***
Constants/cores.ts -> constantes com a paleta de cores do app.


# Anotações aleatorias sei lá
Os hooks são tipo funções. Para você poder reutilizar em qualquer lugar do código

useState é que nem uma varivel normal aparentemente, mas quando voce muda o valor dela a tela atualiza dinamicamente.

useEffect roda um codigo assim que o componente é renderizado?

o _layout.tsx envolve todo o app, o que estiver nele vai aparecer na tela independente da rota em que voce estiver

tem um tipo de recurso do react que é o context, voce cria um dele e cria uma função provedor pra ele.
se voce criar um context, voce pode chamar ele como se fosse um recurso do react e envolver outros componentes do app com o contexto
dai todos os componentes que estiverem envolvidos terão acesso as coisas que o provedor do contexto oferecer.
serve pra poder usar uma mesma "variavel" entre diferentes partes do app.