import { GameEvent } from './events';

export class EventManager {
  private readonly hooks: Record<string, (event: GameEvent) => void> = {};

  hookEvents(listenerId: string, onEvent: (event: GameEvent) => void): void {
    this.hooks[listenerId] = onEvent;
  }

  unhookEvents(listenerId: string): void {
    delete this.hooks[listenerId];
  }

  dispatch(event: GameEvent): void {
    setTimeout(() => {
      Object.values(this.hooks).forEach(callback => callback(event));
    });
  }
}
