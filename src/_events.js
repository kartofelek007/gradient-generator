class EventObserver {
    constructor() {
        this.subscribers = [];
    }

    on(fn) {
        //subskrypcja - dodawanie funkcji do tablicy
        this.subscribers.push(fn);
    }

    off(fn) {
        //usuwanie
        this.subscribers = this.subscribers.filter((el) => el !== fn);
    }

    emit(data) {
        //wywoływanie wszystkich funkcji w tablicy
        this.subscribers.forEach((fn) => fn(data));
    }
}

export const events = {
    deleteGradient: new EventObserver(),
    setBg: new EventObserver(),
    addNewGradient: new EventObserver(),
    clearAllWork: new EventObserver(),
};
