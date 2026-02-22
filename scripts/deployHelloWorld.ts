import { beginCell, toNano } from '@ton/core';
import { HelloWorld } from '../wrappers/HelloWorld';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const greeting = beginCell().storeStringTail("Hello World!").endCell();
    const helloWorld=provider.open(
        HelloWorld.createFromConfig(greeting ,await compile('HelloWorld'))
    );

    await helloWorld.sendDeploy(provider.sender(),toNano('0.05'));
    await provider.waitForDeploy(helloWorld.address);


}
