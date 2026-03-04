import { describe, expect, it, vi } from 'vitest';

import { createCoreEventBus } from '../core/eventBus';

describe('createCoreEventBus', () => {
  it('returns unsubscribe handlers for on()', () => {
    const emitter = {
      on: vi.fn(),
      once: vi.fn(),
      removeListener: vi.fn(),
    };

    const bus = createCoreEventBus(emitter);
    const listener = vi.fn();
    const unsubscribe = bus.on('event', listener);

    expect(emitter.on).toHaveBeenCalledWith('event', listener);
    unsubscribe();
    expect(emitter.removeListener).toHaveBeenCalledWith('event', listener);
  });
});
