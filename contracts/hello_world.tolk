// Defines the contract's persistent storage
// `greeting` holds the on-chain message as a cell
struct Storage {
    greeting: cell;
}

// Reads contract data from the chain and deserializes it into a Storage struct
fun Storage.load() {
    return Storage.fromCell(contract.getData());
}

// Serializes the Storage struct back into a cell and writes it to the chain
fun Storage.save(self) {
    contract.setData(self.toCell());
}

// Read-only getter — returns the greeting cell to external callers
// `lazy` defers loading storage fields until they are actually accessed, saving gas
get fun getGreeting(): cell {
    val storage = lazy Storage.load();
    return storage.greeting;
}

// Entry point for incoming internal messages
// No messages are handled — the greeting is set at deploy time
fun onInternalMessage(in: InMessage) {
}
