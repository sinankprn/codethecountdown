// Tiny pub/sub for decoupled cross-component events (cell births → audio engine).
type Handler<T> = (payload: T) => void;

export class EventBus<EventMap extends Record<string, unknown>> {
  private handlers: { [K in keyof EventMap]?: Set<Handler<EventMap[K]>> } = {};

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): () => void {
    let set = this.handlers[event];
    if (!set) {
      set = new Set();
      this.handlers[event] = set;
    }
    set.add(handler);
    return () => set!.delete(handler);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const set = this.handlers[event];
    if (!set) return;
    for (const h of set) h(payload);
  }
}

export type CountdownEvents = {
  births: { indices: number[]; cols: number; rows: number };
  digit: number;
  bigbang: void;
};

export const bus = new EventBus<CountdownEvents>();
