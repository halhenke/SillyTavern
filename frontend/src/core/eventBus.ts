import { CoreEventBus, EventListener, EventPayload } from './contracts';

export type LegacyEmitter = {
  on(eventName: string, listener: EventListener): void;
  once(eventName: string, listener: EventListener): void;
  removeListener(eventName: string, listener: EventListener): void;
  emit?(eventName: string, ...payload: EventPayload): Promise<void> | void;
};

export function createCoreEventBus(emitter: LegacyEmitter): CoreEventBus {
  return {
    on(eventName, listener) {
      emitter.on(eventName, listener);
      return () => emitter.removeListener(eventName, listener);
    },
    once(eventName, listener) {
      emitter.once(eventName, listener);
      return () => emitter.removeListener(eventName, listener);
    },
    off(eventName, listener) {
      emitter.removeListener(eventName, listener);
    },
    async emit(eventName, ...payload) {
      if (typeof emitter.emit === 'function') {
        await emitter.emit(eventName, ...payload);
      }
    },
  };
}
