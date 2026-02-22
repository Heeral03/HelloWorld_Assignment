import { Contract, ContractProvider, Sender, SendMode, Cell, contractAddress, Address, beginCell } from '@ton/core';



export function helloWorldConfigToCell(greeting: Cell): Cell {
    return beginCell()
        .storeRef(greeting).endCell();
}

export class HelloWorld implements Contract {
   

    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}


    static createFromConfig(greeting:Cell, code: Cell, workchain = 0) {
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