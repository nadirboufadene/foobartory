import { Warehouse } from './GameMechanics/Warehouse';
import { GameEvent, gameStarted } from './GameMechanics/EventStore/events';
import { ROBOT_GOAL_AMOUNT } from './GameMechanics/config';

const warehouse = Warehouse.createWarehouse(ROBOT_GOAL_AMOUNT);

export const startGame = (): void => {
  warehouse.eventManager.dispatch(gameStarted());
  warehouse.start();
};

export const hookEvents = (
  listenerId: string,
  onEvent: (event: GameEvent) => void,
): void => warehouse.eventManager.hookEvents(listenerId, onEvent);

export const unhookEvents = (listenerId: string): void =>
  warehouse.eventManager.unhookEvents(listenerId);
