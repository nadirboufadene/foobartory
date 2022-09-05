import { v4 as uuidv4 } from 'uuid';
import {
  assemblingFoobarTry,
  barMiningSuccess,
  buyingNewBotTry,
  changingOrderStart,
  changingOrderSuccess,
  fooMiningStart,
  fooMiningSuccess,
  reportRobotStateAsk,
  RobotOrder,
  sellingFoobarTry,
  waitingOrders,
} from './EventStore/events';
import { Warehouse } from './Warehouse';
import { GameEvent } from './EventStore/events';
import { GAME_CLOCK_MS_MULTIPLIER } from './config';

export interface SerializedRobot {
  identifier: string;
  processingAction: RobotOrder;
  pendingAction: RobotOrder;
  specialized: boolean;
}
export class Robot {
  processingAction: RobotOrder;
  pendingAction: RobotOrder;
  identifier: string;
  specialized: boolean;
  private readonly warehouse: Warehouse;

  static buildRobot(
    warehouse: Warehouse,
    order: RobotOrder,
    specialized: boolean,
  ): Robot {
    return new Robot(order, warehouse, specialized);
  }

  private constructor(
    order: RobotOrder,
    warehouse: Warehouse,
    specialized: boolean,
  ) {
    this.identifier = uuidv4();
    this.pendingAction = order;
    this.processingAction = 'RESUME_MISSION';
    this.specialized = specialized;
    this.warehouse = warehouse;
  }

  /**
   * Return the time needed to perform a Task
   */
  private getTaskTimer(task: RobotOrder): number {
    function genRand(min: number, max: number, decimalPlaces: number) {
      var rand = Math.random() * (max - min) + min;
      var power = Math.pow(10, decimalPlaces);
      return Math.floor(rand * power) / power;
    }
    switch (task) {
      case 'MINE_BAR':
        return 1 * GAME_CLOCK_MS_MULTIPLIER;
      case 'MINE_FOO':
        return genRand(0.5, 2.5, 1) * GAME_CLOCK_MS_MULTIPLIER;
      case 'ASSEMBLE_FOOBAR':
        return 2 * GAME_CLOCK_MS_MULTIPLIER;
      case 'SELL_FOOBAR':
        return 10 * GAME_CLOCK_MS_MULTIPLIER;
      case 'CHANGE_TASK':
        return 5 * GAME_CLOCK_MS_MULTIPLIER;
      case 'BUY_ROBOT':
        return 0;
      default:
        return 0;
    }
  }

  private processAction(
    processingAction: RobotOrder,
    pendingAction: RobotOrder,
    event: GameEvent,
  ): void {
    this.processingAction = processingAction;
    this.warehouse.eventManager.dispatch(fooMiningStart(this.identifier));
    this.warehouse.eventManager.dispatch(reportRobotStateAsk(this.serialize()));
    setTimeout(() => {
      this.pendingAction = processingAction;
      this.processingAction = pendingAction;
      this.warehouse.eventManager.dispatch(event);
      this.askNewOrders();
    }, this.getTaskTimer(processingAction));
  }

  private askNewOrders(): void {
    this.warehouse.eventManager.dispatch(waitingOrders(this.identifier));
  }

  private shouldIAskNewOrder(counter: number): boolean {
    if (counter > 10 && !this.specialized) {
      this.processingAction = 'RESUME_MISSION';
      this.askNewOrders();
      return true;
    }
    return false;
  }

  start(): void {
    this.askNewOrders();
  }

  /**
   * Serialize the robot to be sent to the interface
   */
  serialize(): SerializedRobot {
    return {
      identifier: this.identifier,
      processingAction: this.processingAction,
      pendingAction: this.pendingAction,
      specialized: this.specialized,
    };
  }

  mineFoo(): void {
    this.processAction(
      'MINE_FOO',
      'RESUME_MISSION',
      fooMiningSuccess(this.identifier),
    );
  }

  mineBar(): void {
    this.processAction(
      'MINE_BAR',
      'RESUME_MISSION',
      barMiningSuccess(this.identifier),
    );
  }

  assembleFoobar(recursivityCounter = 0): void {
    // check for new order in case of a  blocking waitingResources loop
    if (this.shouldIAskNewOrder(recursivityCounter)) return;
    if (!this.warehouse.canAssembleFoobar()) {
      this.processingAction = 'WAITING_RESSOURCES';
      // use setTimeout and recursivity to make non blocking loop
      // until resources are available to process
      setTimeout(this.assembleFoobar.bind(this), 0, ++recursivityCounter);
    } else
      this.processAction(
        'ASSEMBLE_FOOBAR',
        'RESUME_MISSION',
        assemblingFoobarTry(this.identifier),
      );
  }

  sellFoobars(amount: number, recursivityCounter = 0): void {
    // check for new order in case of a  blocking waitingResources loop
    if (this.shouldIAskNewOrder(recursivityCounter)) return;
    if (!this.warehouse.canSellFoobars(amount)) {
      this.processingAction = 'WAITING_RESSOURCES';
      // use setTimeout and recursivity to make non blocking loop
      // until resources are available to process
      setTimeout(this.sellFoobars.bind(this), 0, amount, ++recursivityCounter);
    } else
      this.processAction(
        'SELL_FOOBAR',
        'RESUME_MISSION',
        sellingFoobarTry(this.identifier, amount),
      );
  }

  buyRobot(order: RobotOrder, recursivityCounter = 0): void {
    // check for new order in case of a  blocking waitingResources loop
    if (this.shouldIAskNewOrder(recursivityCounter)) return;
    if (!this.warehouse.canBuyRobot()) {
      this.processingAction = 'WAITING_RESSOURCES';
      // use setTimeout and recursivity to make non blocking loop
      // until resources are available to process
      setTimeout(this.buyRobot.bind(this), 0, order, ++recursivityCounter);
    } else
      this.processAction(
        'BUY_ROBOT',
        'RESUME_MISSION',
        buyingNewBotTry(this.identifier, order),
      );
  }

  changeOrder(newOrder: RobotOrder): void {
    this.pendingAction = newOrder;
    this.processingAction = 'CHANGE_TASK';
    this.warehouse.eventManager.dispatch(
      changingOrderStart(this.identifier, newOrder),
    );
    this.warehouse.eventManager.dispatch(reportRobotStateAsk(this.serialize()));
    setTimeout(() => {
      this.processingAction = 'RESUME_MISSION';
      this.pendingAction = newOrder;
      this.warehouse.eventManager.dispatch(
        changingOrderSuccess(this.identifier),
      );
      this.askNewOrders();
    }, this.getTaskTimer('CHANGE_TASK'));
  }
}

export default Robot;
