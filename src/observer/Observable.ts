import { EventBusType } from './enum';

type Listener<T> = (param?: T) => void;

class EventBus<T> {
  private listeners: { [eventName: string]: Listener<T>[] } = {};

  on(eventName: EventBusType, listener: Listener<T>): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(listener);
  }

  off(eventName: EventBusType, listener?: Listener<T>): void {
    this.listeners[eventName] = this.listeners[eventName].filter(l => l !== listener);
  }

  emit(eventName: EventBusType, param?: T): void {
    if (!this.listeners[eventName]) {
      return;
    }
    for (const listener of this.listeners[eventName]) {
      if (param) {
        listener(param);
      } else {
        listener();
      }
    }
  }
}

export default new EventBus();
