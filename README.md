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
- A [TON wallet](https://docs.ton.org/ecosystem/wallet-apps/tonkeeper) with
  [testnet Toncoin](https://docs.ton.org/ecosystem/wallet-apps/get-coins)
- [Node.js v22 or later](https://nodejs.org) — verify your installation:
```bash
  node -v
  npm -v
```

---

## What you'll build

A smart contract written in Tolk that stores a "Hello World" greeting
on the TON testnet. Once deployed, anyone can read the greeting by
calling a getter — no transaction, no gas fee.

---

## Set up your environment

### 1. Install Blueprint

We'll use [Blueprint](https://docs.ton.org/contract-dev/blueprint/overview),
TON's official smart contract development toolkit.

Run this command to create a new project:
```bash
npm create ton@latest -- hello-world --contractName HelloWorld --type tolk-empty
```

> **Warning:** Contract names must be PascalCase — letters only, no
> underscores, numbers, or special characters. `HelloWorld` is correct;
> `Hello_World` will throw an error.

After the command runs, you'll notice the contract file is named
`hello_world.tolk`, not `HelloWorld.tolk`. This is expected — Blueprint
automatically converts your PascalCase contract name to snake_case for
the filename.

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

A smart contract is a program that lives on the blockchain. 
On TON, every smart contract has two things:

- **Code** — what the contract can do
- **Storage** — what the contract remembers between calls

In this tutorial, your `HelloWorld` contract will store one piece of data
— a greeting — and expose one way to read it.

---

## Write the contract

The contract is written in [Tolk](https://docs.ton.org/languages/tolk/overview),
TON's modern smart contract language.

Open `contracts/hello_world.tolk` and replace its contents with:
```tolk
struct Storage {
    greeting: cell;
}

fun Storage.load() {
    return Storage.fromCell(contract.getData());
}

fun Storage.save(self) {
    contract.setData(self.toCell());
}

get fun getGreeting(): cell {
    val storage = lazy Storage.load();
    return storage.greeting;
}

fun onInternalMessage(in: InMessage) {
}
```

### Contract details

**`Storage`** is where your contract remembers things. It holds one
value: the greeting, stored as a `cell`.

&nbsp;

> **Note:** Cell is TON's fundamental data storage unit.
> Everything on-chain  is encoded into cells.

&nbsp;

**`Storage.load()`** reads the contract's current data from the chain and
returns it as a `Storage` struct. **`Storage.save()`** does the reverse —
converts the struct back into a cell and writes it to persistent storage.

&nbsp;

**`getGreeting()`** is marked with `get fun`, making it a read-only getter.
It returns the greeting with no transaction needed and no gas charged.


&nbsp;

**`onInternalMessage()`** is the entry point for incoming messages. This
contract sets the greeting at deploy time, so no messages need to be
handled here.

&nbsp;

> **Warning:** Common mistakes to avoid:
>
> - The data type is `cell`, not `Cell` — Tolk is case-sensitive
> - The functions are `fromCell()` and `toCell()` — not `FromCell` or `tocell`
> - The keyword is `contract`, not `Contract` — lowercase throughout

---

## Compile the contract

Compile the contract into bytecode for execution by the
[TVM](https://docs.ton.org/tvm/overview).

Run:
```bash
npx blueprint build HelloWorld
```

Expected output:
```
Build script running, compiling HelloWorld
Using tolk version 1.2.0...

Compiled successfully! Cell BOC result:

{
  "hash": "30aed5f442f41ea58732214f73cd65369cde9dafb80ec3c8dd8557df7819f82d",
  "hashBase64": "MK7V9EL0HqWHMiFPc81lNpzena+4DsPI3YVX33gZ+C0=",
  "hex": "b5ee9c72410104010024000114ff00f4a413f4bcf2c80b010201620203000cd030f891f240000fa06707da89a1ae99c49503b8"
}

Wrote compilation artifact to build/HelloWorld.compiled.json
```


The compiled output is saved to `build/HelloWorld.compiled.json`.
This file contains the contract bytecode and is required for deployment.

&nbsp;

> **Warning:** If the build fails, re-check `contracts/hello_world.tolk`
> against the code in the previous step — a missing `}`, syntax error,
> or typo in a function name is the most common cause.

&nbsp;

> **Warning:** If you see `Contract 'HelloWorld' not found`, the contract
> name in the build command must exactly match your `--contractName` from
> setup. If you used `HelloWorld`, the command is
> `npx blueprint build HelloWorld`.

&nbsp;

> **Checkpoint:** Your hash matches, `build/HelloWorld.compiled.json`
> exists, and the terminal shows no errors. Move on to deployment.

---

## Deploy the contract

Deployment involves two steps: creating a wrapper and running a deploy
script.

### 1. Create the wrapper

The wrapper is a TypeScript class that bridges your scripts and your
deployed contract.

Open `wrappers/HelloWorld.ts` and replace its contents with:
```typescript
import {
    Contract,
    ContractProvider,
    Sender,
    SendMode,
    Cell,
    contractAddress,
    Address,
    beginCell,
} from '@ton/core';

export function helloWorldConfigToCell(greeting: Cell): Cell {
    return beginCell()
        .storeRef(greeting)
        .endCell();
}

export class HelloWorld implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromConfig(greeting: Cell, code: Cell, workchain = 0) {
        const data = helloWorldConfigToCell(greeting);
        const init = { code, data };
        return new HelloWorld(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
```

### Wrapper class details

- **`helloWorldConfigToCell()`** — converts your greeting `cell` into
  the initial storage layout the contract expects.

&nbsp;

- **`createFromConfig()`** — static factory method for creating a new
  undeployed contract instance.

&nbsp;

- **`sendDeploy()`** — sends the deployment transaction on-chain using
  `provider.internal()` with:
  - `SendMode.PAY_GAS_SEPARATELY` — gas is paid from the attached value
  - An empty body — no message needed, the greeting is in the initial storage

> **Note:** `provider` here is `ContractProvider` — scoped to this
> specific contract.

&nbsp;

> **Warning:** Never set `value` to `0`. The contract needs TON attached
> to cover gas. `toNano('0.05')` is the minimum safe amount — any unused
> portion is returned to your wallet automatically.

---

### 2. Create the deployment script


&nbsp;

Open `scripts/deployHelloWorld.ts` and replace its contents with:
```typescript
import { beginCell, toNano } from '@ton/core';
import { HelloWorld } from '../wrappers/HelloWorld';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const greeting = beginCell()
        .storeStringTail('Hello, TON!')
        .endCell();

    const helloWorld = provider.open(
        HelloWorld.createFromConfig(greeting, await compile('HelloWorld'))
    );

    await helloWorld.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(helloWorld.address);
}
```

### Deployment script details

- **`export async function run(provider: NetworkProvider)`** — the entry
  point Blueprint calls when you run the script. 

- **`beginCell().storeStringTail('Hello, TON!').endCell()`** — converts
  your string into a `cell`.

- **`await compile('HelloWorld')`** — compiles the contract and returns
  the bytecode as a `Cell`.

- **`HelloWorld.createFromConfig(greeting, code)`** — builds the contract
  instance from your greeting and bytecode, and computes its address.

- **`provider.open()`** — connects the contract to the network so you
  can call methods on it.

- **`helloWorld.sendDeploy(provider.sender(), toNano('0.05'))`** — sends
  the deployment transaction. `provider.sender()` is your wallet,
  `toNano('0.05')` is the gas attached.


---

### 3. Run the deployment script
This tutorial uses the Testnet Network.

&nbsp;

Before running the command, make sure:

> **Warning:** Your wallet must be set to testnet. If it's on mainnet,
> the deployment will spend real TON. In Tonkeeper: Settings → Dev →
> Switch to Testnet.

&nbsp;

> **Warning:** You need at least 0.05 TON in your testnet wallet. If
> you're running low, see
> [how to get testnet Toncoin](https://docs.ton.org/ecosystem/wallet-apps/get-coins)
> or request directly from the
> [Testnet Faucet](https://t.me/testgiver_ton_bot) on Telegram.

&nbsp;

Run:
```bash
npx blueprint run deployHelloWorld --testnet --tonconnect --tonviewer
```

Scan the QR code displayed in your terminal with your wallet app and
approve the transaction.

Expected output:
```
Using file: deployHelloWorld
Connected to wallet at address: 0QD...
Sending transaction. Approve in your wallet...
Sent transaction
Contract deployed at address kQAyPdkp...
You can view it at https://testnet.tonviewer.com/kQAyPdkp...
```

&nbsp;

> **Warning:** If you see `Contract was not deployed`, testnet can be
> slow. Check [testnet.tonscan.io](https://testnet.tonscan.io) — if your
> transaction appears there, the contract deployed successfully. If not,
> wait 15–30 seconds and try again.

&nbsp;

> **Checkpoint:** Your contract address is printed in the terminal and
> visible on [testnet.tonscan.io](https://testnet.tonscan.io). Copy it
> — you'll need it in the next step.

---

## Read the greeting

With the contract deployed, read the greeting back from the chain.
First, update the wrapper with two new methods.

### 1. Update the wrapper

Open `wrappers/HelloWorld.ts` and replace its contents with:
```typescript
import {
    Contract,
    ContractProvider,
    Sender,
    SendMode,
    Cell,
    contractAddress,
    Address,
    beginCell,
} from '@ton/core';

export function helloWorldConfigToCell(greeting: Cell): Cell {
    return beginCell()
        .storeRef(greeting)
        .endCell();
}

export class HelloWorld implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromConfig(greeting: Cell, code: Cell, workchain = 0) {
        const data = helloWorldConfigToCell(greeting);
        const init = { code, data };
        return new HelloWorld(contractAddress(workchain, init), init);
    }

    static createFromAddress(address: Address) {
        return new HelloWorld(address);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getGreeting(provider: ContractProvider): Promise<string> {
        const result = await provider.get('getGreeting', []);
        const cell = result.stack.readCell();
        return cell.beginParse().loadStringTail();
    }
}
```

### Updated wrapper details

Two methods are added to the existing wrapper:

**`createFromAddress()`** — creates a wrapper instance from an existing
contract address. Unlike `createFromConfig()`, this is used when the
contract is already deployed and you just need to talk to it.

**`getGreeting()`** — calls the `get fun getGreeting()` getter on your
deployed contract, reads the returned `cell`, parses it, and returns
a plain JavaScript string.

---

### 2. Create the interaction script

Create a new file `scripts/readGreeting.ts` and add the following:
```typescript
import { Address } from '@ton/core';
import { HelloWorld } from '../wrappers/HelloWorld';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const contractAddress = Address.parse('YOUR_CONTRACT_ADDRESS');

    const helloWorld = provider.open(
        HelloWorld.createFromAddress(contractAddress)
    );

    const greeting = await helloWorld.getGreeting();
    console.log('Greeting:', greeting);
}
```

Replace `YOUR_CONTRACT_ADDRESS` with the address you copied after
deployment.

### Script details

- **`Address.parse()`** — converts your contract address string into
  a TON `Address` object.
- **`createFromAddress()`** — creates a wrapper instance for an
  already-deployed contract.
- **`provider.open()`** — connects the wrapper to the network and
  injects `ContractProvider` into wrapper methods automatically.
- **`helloWorld.getGreeting()`** — calls the getter and returns the
  greeting as a plain string.
- **`console.log()`** — prints the result to your terminal.

---

### 3. Run the interaction script

Before running, make sure:

&nbsp;

> **Warning:** Use the exact contract address from your deployment
> output. Copy it carefully — a single wrong character will cause the
> script to fail silently or throw an address error.

&nbsp;

> **Note:** Can't find your contract address? Check your terminal output
> from the deploy step, or look up your wallet on
> [testnet.tonscan.io](https://testnet.tonscan.io) — the deployed
> contract will appear in your recent transactions.

&nbsp;

Run:
```bash
npx blueprint run readGreeting --testnet --tonconnect
```

Expected output:
```
Using file: readGreeting
Connected to wallet at address: 0QD...
Greeting: Hello, TON!
```


&nbsp;

> **Warning:** If you see an address parsing error, make sure you
> replaced `YOUR_CONTRACT_ADDRESS` in `readGreeting.ts` with your
> actual contract address before running.

&nbsp;

> **Checkpoint:** `Greeting: Hello, TON!` is printed in your terminal.
> Your contract is live, deployed, and readable on the TON testnet.

&nbsp;

> You just deployed your first smart contract on TON
> testnet. Your greeting is permanently stored on-chain, readable by
> anyone. Paste your contract address into
> [testnet.tonviewer.com](https://testnet.tonviewer.com) to see it live
> in the explorer.


---

## What's next

You've completed the full workflow — write, compile, deploy, and read
a smart contract on TON testnet. Here's where to go from here:

- **[Counter Contract](https://docs.ton.org/contract-dev/first-smart-contract)** —
  a more complex example introducing message handlers, opcodes, and
  on-chain state updates.
- **[Jettons](https://docs.ton.org/standard/tokens/jettons/overview)** —
  TON's fungible token standard. Build your own token on-chain.
- **[NFTs](https://docs.ton.org/standard/tokens/nft/overview)** —
  TON's non-fungible token standard.
- **[TON Documentation](https://docs.ton.org)** — complete reference
  for everything in the TON ecosystem.

---

## Rationale

This tutorial targets developers who are new to TON but comfortable
with CLI, Git, and TypeScript. Blueprint was chosen because it provides
a single interface for compilation, deployment, and interaction —
without requiring the reader to learn low-level TON tooling.

Tolk was chosen over FunC for its readable syntax, automatic
serialization, and active development.

The greeting contract was chosen deliberately over a more complex
example. The goal is to give a new developer a complete end-to-end
picture of how smart contracts work on TON without introducing
unnecessary complexity.

The tutorial includes inline explanations, callouts, and warnings to
give the reader a deeper understanding of the flow rather than just
copy-pasting code. Troubleshooting callouts are placed inline at each
step rather than in a dedicated section — so the reader sees the
relevant warning exactly when they need it.

With more time, I would add a dedicated Testing section, a
workflow diagram showing the full message
flow during deployment and deeper explanations of alternative approaches
and trade-offs for each implementation decision

---
## Footer

**Last reviewed:** February 23, 2026

**Versions used:**
- Node.js v22.14.0
- `@ton/blueprint` v0.43.0
- `@ton/tolk-js` v1.2.0
- `@ton/core` v0.63.1
- TON testnet

**Changelog:**
- 2026-02-22 — Initial release. Validated end-to-end on TON testnet
  with Blueprint v0.43.0 and Tolk v1.2.0.
