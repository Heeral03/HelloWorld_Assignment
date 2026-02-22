# Hello World on TON Blockchain
## Deploy your first smart contract to testnet in 45 minutes

In this tutorial, you'll build, deploy, and interact with a real "Hello World"
smart contract written in Tolk — step by step, with copy-paste commands and
clear validation at every stage.

By the end, you'll have a working, live smart contract on the TON testnet.

---

## Prerequisites

- Basic programming background: variables, functions, if/else, loops
- Basic familiarity with the command line and Git
- [Node.js v22 or later](https://nodejs.org) — verify your installation:
```bash
  node -v
  npm -v
```

- A [TON wallet](https://docs.ton.org/ecosystem/wallet-apps/tonkeeper) with
  [testnet Toncoin](https://docs.ton.org/ecosystem/wallet-apps/get-coins)

---

## What you'll build

A smart contract written in Tolk that:
- stores a "Hello World" greeting on the
TON testnet.
- Once deployed, anyone can read the greeting by calling a getter —
no transaction, no gas fee.


---

## Set up your environment

### 1. Setup
We'll use [Blueprint](https://docs.ton.org/contract-dev/blueprint/overview),
TON's official smart contract development toolkit.

Run this command to create a new project:
```bash
npm create ton@latest -- hello-world --contractName HelloWorld --type tolk-empty
```
> 
>  **Contract names must be PascalCase** — letters only, no underscores,
> numbers, or special characters. `HelloWorld` is correct; `Hello_World`
> will throw an error.
>

This creates the following structure:
```
hello-world/
├── contracts/                    # Smart contract source code
│   └── hello_world.tolk          # Your Tolk contract
├── scripts/                      # Deployment and interaction scripts
│   └── deployHelloWorld.ts       # Deploys the contract to testnet
├── tests/                        # Test specifications
│   └── HelloWorld.spec.ts        # Contract tests
├── wrappers/                     # TypeScript bindings
│   ├── HelloWorld.ts             # Wrapper class for contract interaction
│   └── HelloWorld.compile.ts     # Compilation config
└── build/                        # Compiled output (generated after build)
```

### 2. Move into the project directory
```bash
cd hello-world
```

---

## What is a smart contract?
(Definition of smart contract in context of TON and what are we gonna write in our contract today)

---

## Write a contract
(end to end tutorial - with errors expected, warnings, things to keep in mind etc etc)
(The user should know what are we doing and why are we doing it)
(Not detailed but well informed)


---

## Compile contract


---


## Wrapper


---

## Deploy Script


---

## Deploy the contract





