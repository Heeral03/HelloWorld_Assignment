import { Address } from '@ton/core';
import { HelloWorld } from '../wrappers/HelloWorld';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const contractAddress = Address.parse('kQAyPdkpHHVKUllXuTEN4zP9Qju-eGIUx9wYnjDKBhnWZ9l-');

    const helloWorld = provider.open(
        HelloWorld.createFromAddress(contractAddress)
    );

    const greeting = await helloWorld.getGreeting();
    console.log('Greeting:', greeting);
}