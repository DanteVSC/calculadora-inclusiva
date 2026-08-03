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


# Anotações aleatorias sei lá
Os hooks são tipo funções. Para você poder reutilizar em qualquer lugar do código

useState é que nem uma varivel normal aparentemente, mas quando voce muda o valor dela a tela atualiza dinamicamente.

useEffect roda um codigo assim que o componente é renderizado?