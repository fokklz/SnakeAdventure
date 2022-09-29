/**
 * @class EventEmitter
 * @author Fokko Vos
 * @description Eventemitter wird zu überwachung & Ausführung von globalen Events genutzt
 */
class EventEmitter {

    private events: Object = {};

    on(event: String, listener: Function) {
        let e = event.toString();
        if (typeof this.events[e] !== 'object') {
            this.events[e] = [];
        }

        this.events[e].push(listener);
    }

    removeListener(event: String, listener: Function) {
        let idx;
        let e = event.toString();

        if (typeof this.events[e] === 'object') {
            idx = indexOf(this.events[e], listener);

            if (idx > -1) {
                this.events[e].splice(idx, 1);
            }
        }
    }

    emit(event: String, ...args) {
        let e = event.toString();
        var i, listeners, length = args;

        if (typeof this.events[e] === 'object') {
            listeners = this.events[e].slice();
            length = listeners.length;

            for (i = 0; i < length; i++) {
                listeners[i].apply(this, args);
            }
        }
    }

    once(event: String, listener: Function) {
        let e = event.toString();
        this.on(e, function g() {
            this.removeListener(event, g);
            listener.apply(this, arguments);
        });
    }

}

if (!(events instanceof EventEmitter)) {
    events = new EventEmitter();
}