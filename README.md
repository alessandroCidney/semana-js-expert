# Desenvolvimento do Projeto

## Aula 1

### Instalando as dependências necessárias
- Em `gdrive-webapp`, usamos `npm install`
- Em `gdrive-webapi`, inicializamos com `npm init -y --scope @username` e depois instalamos o `pino`, o `pino-pretty`, o `socket.io` e o `jest` (o `nodemon` também, mas depois foi removido).

### Inicializado o JEST
- Em `gdrive-webapi`, usamos `npx jest --init` (ordem das respostas da configuração: yes, no, node, yes, v8, yes)

### Configuração do arquivo `jest.config.mjs` (que fica em `gdrive-webapi`)
```javascript

export default {
  clearMocks: true,

  // Para limpeza dos Mocks
  restoreMocks: true,
  
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: [
    "text",
    "lcov"
  ],
  testEnvironment: "node",
  
  // Definindo a cobertura dos testes (porcentagem para cada item)
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },

  // Não observar a pasta node_modules
  watchPathIgnorePatterns: [
    "node_modules"
  ],

  // Ignorar transformações no JEST no node_modules
  transformIgnorePatterns: [
    "node_modules"
  ],

  // De onde virá a coverage ("cobertura" dos testes)
  // Consideraremos qualquer arquivo JS, exceto arquivos index.js
  collectCoverageFrom: [
    "src/**/*.js", "!src/**/index.js"
  ]
};
```

### Criando o primeiro teste
- Criamos o diretório `test` em `gdrive-webapi`
- Dentro, criamos o teste `example.test.js`, com o seguinte conteúdo:

```javascript
import { 
    describe,
    test,
    expect
} from '@jest/global';

describe('Teste inicial do projeto', () => {
    test('Primeiro teste', () => {
        expect(true).toBeTruthy();
    })
});
```

- Para ativar o teste, usamos `npm t` (também podemos rodar `npm run test:watch` e `npm run test:cov`)

#### Configuração do package.json até o momento
```json
{
  "name": "@alessandroCidney/gdrive-webapi",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "test": "set NODE_OPTIONS=--experimental-vm-modules && npx jest --runInBand",
    "test:watch": "set NODE_OPTIONS=--experimental-vm-modules && npx jest --watchAll --runInBand",
    "test:cov": "set NODE_OPTIONS=--experimental-vm-modules && npx jest --no-cache --runInBand --coverage"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "jest": "^27.1.0"
  },
  "dependencies": {
    "pino": "6.8",
    "pino-pretty": "5.1",
    "socket.io": "4.1"
  }
}
```

### Formatando o tamanho do arquivo
- Utilizamos o pretty-bytes (instale com `npm i pretty-bytes@5.6`)

# README.md original abaixo:

# Google Drive Clone - Semana JS Expert 5.0

Seja bem vindo(a) à quinta Semana Javascript Expert. Este é o código inicial para iniciar nossa jornada.

Marque esse projeto com uma estrela 🌟

## Preview

![](./resources/demo.gif)


## Checklist Features

- Web API
    - [] Deve listar arquivos baixados
    - [] Deve receber stream de arquivos e salvar em disco 
    - [] Deve notificar sobre progresso de armazenamento de arquivos em disco 
    - [] Deve permitir upload de arquivos em formato image, video ou audio
    - [] Deve atingir 100% de cobertura de código em testes

- Web App 
    - [] Deve listar arquivos baixados
    - [] Deve permitir fazer upload de arquivos de qualquer tamanho
    - [] Deve ter função de upload via botão
    - [] Deve exibir progresso de upload 
    - [] Deve ter função de upload via drag and drop



## Desafios para alunos pós projeto

1. *Backend*: Salvar o arquivo na AWS ou qualquer serviço de storage
     - Nosso projeto hoje armazena arquivos em disco. o desafio é você via Stream, fazer upload para algum serviço na nuvem
     - Como plus, manter 100% de code coverage, ou seja, crie testes para sua nova feature
2. *Frontend*: Adicionar testes no frontend e alcançar 100% de code coverage
    - Você aprendeu como fazer testes no backend. Usar o mesmo processo para criar testes unitários no frontend com Jest 
    - Caso tenha duvidas, acesse o [exemplo](https://github.com/ErickWendel/tdd-frontend-example) e deixe uma estrela!
3. *Infraestrutura*: Publicar aplicação com seu SSL customizado em máquina virtual
    - Você aprendeu a gerar SSL local, o desafio é você criar um certificado (pode ser com o *Let's Encrypt*) e adicionar na sua aplicação

### Considerações
- Tire suas dúvidas sobre os desafios em nossa comunidade, o objetivo é você aprender de forma divertida. Surgiu dúvidas? Pergunte por lá!

- Ao completar qualquer um dos desafios, envie no canal **#desafios** da comunidade no **Discord**

## Créditos ao Layout <3

- O Layout foi adaptado a partir do projeto do brasileiro [Leonardo Santo](https://github.com/leoespsanto) disponibilizado no [codepen](https://codepen.io/leoespsanto/pen/KZMMKG). 

## FAQ 
- `NODE_OPTIONS` não é um comando reconhecido pelo sistema, o que fazer?
    - Se você estiver no Windows, a forma de criar variáveis de ambiente é diferente. Você deve usar a palavra `set` antes do comando. 
    - Ex: `    "test": "set NODE_OPTIONS=--experimental-vm-modules && npx jest --runInBand",`

- Certificado SSL é inválido, o que fazer?
    - Esse erro acontece porque gerei um certificado atrelado ao usuário da minha máquina.
    - Você pode clicar em prosseguir no browser e usar o certificado invalido que o projeto vai continuar funcionando, mas se quiser gerar o seu próprio, escrevi o passo a passo em [./certificates](./certificates)

- Rodei `npm test` mas nada acontece, o que fazer?
    - Verifique a versão do seu Node.js. Estamos usando na versão 16.8. Entre no [site do node.js](https://nodejs.org) e baixe a versão mais recente.