import { v4 as uuidv4 } from 'uuid';
import { EventManager } from './EventStore/EventManager';
import {
  assemblingFoobarFailure,
  assemblingFoobarSuccess,
  buyingNewBotFailure,
  buyingNewBotSuccess,
  missionAccomplished,
  reportInventoryState,
  RobotOrder,
  sellingFoobarFailure,
  sellingFoobarSuccess,
  reportRobotStateSend,
  newBotArrived,
} from './EventStore/events';
import { FleetSupervisor } from './FleetSupervisor';
import { Robot, SerializedRobot } from './Robot';
import { Bar, Foo, Foobar } from './Foobar';
import { GameEvent } from './EventStore/events';

const ROBOT_EUROS_PRICE: number = 3;
const ROBOT_FOOS_PRICE: number = 6;

export type SerializedWarehouse = {
  numberOfRobots: number;
  numberOfFoos: number;
  numberOfBars: number;
  numberOfFoobars: number;
  bank: number;
  moneySpent: number;
  numberOfWastedFoos: number;
};

export class Warehouse {
  private robots: Robot[] = [];
  private readonly foos: Foo[] = [];
  private readonly bars: Bar[] = [];
  private readonly foobars: Foobar[] = [];
  private readonly robotAmountGoal: number;
  private readonly listenerId = uuidv4();
  private bank: number = 0;
  private moneySpent = 0;
  private numberOfWastedFoos = 0;
  readonly eventManager: EventManager = new EventManager();
  readonly fleetSupervisor: FleetSupervisor = new FleetSupervisor(this);

  static createWarehouse(robotAmountGoal: number): Warehouse {
    const warehouse = new Warehouse(robotAmountGoal);
    warehouse.setup();
    return warehouse;
  }

  constructor(robotAmountGoal: number) {
    this.robotAmountGoal = robotAmountGoal;
    this.eventManager.hookEvents(this.listenerId, this.eventHandler.bind(this));
  }

  private setup(): void {
    this.robots = this.initRobots();
  }

  private stopWarehouse(): void {
    this.eventManager.dispatch(reportInventoryState(this.serialize()));
    this.eventManager.dispatch(missionAccomplished());
    this.eventManager.unhookEvents(this.listenerId);
  }

  private initRobots(): Robot[] {
    // We initialize the two first robots both mining, one Foos & the other Bars
    // The one mining Bars will be our Generalist bot
    return [
      Robot.buildRobot(this, 'MINE_FOO', true),
      Robot.buildRobot(this, 'MINE_BAR', false),
    ];
  }

  /**
   * Send robot information to the interface
   */
  private sendRobotState(robot: SerializedRobot): void {
    this.eventManager.dispatch(reportRobotStateSend(robot));
  }

  private createFoobarElement(): Foo | Bar {
    return { identifier: uuidv4() };
  }

  private serialize(): SerializedWarehouse {
    return {
      numberOfBars: this.numberOfBars,
      numberOfFoos: this.numberOfFoos,
      numberOfFoobars: this.numberOfFoobars,
      bank: this.bank,
      numberOfRobots: this.numberOfRobots,
      moneySpent: this.moneySpent,
      numberOfWastedFoos: this.numberOfWastedFoos,
    };
  }

  /**
   * Send the inventory state to the interface
   */
  private reportInventory(): void {
    this.eventManager.dispatch(reportInventoryState(this.serialize()));
  }

  /**
   * Listen to events and dispatch to the according Warehouse method
   */
  private eventHandler(event: GameEvent): void {
    switch (event.type) {
      case 'REPORT_ROBOT_STATE_ASKED':
        this.sendRobotState(event.robot);
        break;
      case 'FOO_MINING_SUCCESS':
        this.addFoo();
        this.reportInventory();
        break;
      case 'BAR_MINING_SUCCESS':
        this.addBar();
        this.reportInventory();
        break;
      case 'ASSEMBLING_FOOBAR_TRY':
        this.addFoobar(event.robotId);
        this.reportInventory();
        break;
      case 'SELLING_FOOBAR_TRY':
        this.sellFoobars(event.robotId, event.amount);
        this.reportInventory();
        break;
      case 'BUYING_NEW_ROBOT_TRY':
        this.addRobot(event.robotId, event.order);
        this.reportInventory();
        break;
    }
  }

  start(): void {
    this.robots.forEach(robot => {
      this.eventManager.dispatch(newBotArrived(robot.serialize()));
      robot.start();
    });
  }

  canAssembleFoobar(): boolean {
    return this.numberOfFoos > 6 && this.numberOfBars > 0;
  }

  canSellFoobars(amount: number): boolean {
    return this.numberOfFoobars >= amount;
  }

  canBuyRobot(): boolean {
    return (
      this.bank >= ROBOT_EUROS_PRICE && this.numberOfFoos >= ROBOT_FOOS_PRICE
    );
  }

  addFoo(): void {
    this.foos.push(this.createFoobarElement());
  }

  addBar(): void {
    this.bars.push(this.createFoobarElement());
  }

  /**
   * Try to Assemble a Foobar
   * Dispatch a Failure Event if the Foo element break
   * Dispatch a Failure Event if there is not enough ressources
   */
  addFoobar(robotId: string): void {
    if (!this.canAssembleFoobar()) {
      this.eventManager.dispatch(
        assemblingFoobarFailure(robotId, 'Not enough ressources'),
      );
      return;
    }
    if (Math.random() < 0.6) {
      const foo = this.foos.pop();
      const bar = this.bars.pop();
      if (bar && foo) {
        this.foobars.push({ foo: foo, bar: bar });
        this.eventManager.dispatch(assemblingFoobarSuccess(robotId));
      }
    } else {
      this.eventManager.dispatch(
        assemblingFoobarFailure(robotId, 'Our foo element broke'),
      );
      // since the assembling failed we destroy the foo element in the inventory
      this.foos.pop();
      // we register the failure
      this.numberOfWastedFoos++;
    }
  }

  /**
   * Try to buy a new robot
   * Dispatch a failure in case of a lack of ressources
   */
  addRobot(robotId: string, order: RobotOrder): void {
    if (!this.canBuyRobot()) {
      this.eventManager.dispatch(
        buyingNewBotFailure(robotId, 'Not enough ressources'),
      );
      return;
    }
    this.moneySpent += ROBOT_EUROS_PRICE;
    this.foos.splice(0, ROBOT_FOOS_PRICE);
    this.bank -= ROBOT_EUROS_PRICE;
    const newRobot = Robot.buildRobot(this, order, true);
    this.robots.push(newRobot);
    newRobot.start();
    this.eventManager.dispatch(buyingNewBotSuccess(robotId));
    this.eventManager.dispatch(newBotArrived(newRobot.serialize()));
    // we dispatch an event saying the goal is reached
    if (this.numberOfRobots === this.robotAmountGoal) this.stopWarehouse();
  }

  /**
   * Try to sell amount foobars
   * Dispatch a failure in case of a lack of ressources
   */
  sellFoobars(robotId: string, amount: number): void {
    if (!this.canSellFoobars(amount)) {
      this.eventManager.dispatch(
        sellingFoobarFailure(robotId, 'Not enough ressources'),
      );
      return;
    }
    this.foobars.splice(0, amount);
    this.bank += amount;
    this.eventManager.dispatch(sellingFoobarSuccess(robotId, amount));
  }

  get storedFoos(): Foo[] {
    return this.foos;
  }

  get storedBars(): Bar[] {
    return this.bars;
  }

  get storedFoobars(): Foobar[] {
    return this.foobars;
  }

  get robotsFleet(): Robot[] {
    return this.robots;
  }

  get numberOfFoos(): number {
    return this.foos.length;
  }

  get numberOfBars(): number {
    return this.bars.length;
  }

  get numberOfFoobars(): number {
    return this.foobars.length;
  }

  get numberOfRobots(): number {
    return this.robots.length;
  }

  get money(): number {
    return this.bank;
  }
}
