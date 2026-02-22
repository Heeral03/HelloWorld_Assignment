
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