import { GameEvent, RobotOrder } from './EventStore/events';
import { Robot } from './Robot';
import { Warehouse } from './Warehouse';
import { v4 as uuidv4 } from 'uuid';

const SELL_AMOUNT_STRATEGY = 5;

export class FleetSupervisor {
  private readonly warehouse: Warehouse;
  private readonly listenerId = uuidv4();

  constructor(warehouse: Warehouse) {
    this.warehouse = warehouse;
    this.warehouse.eventManager.hookEvents(
      this.listenerId,
      this.eventHandler.bind(this),
    );
  }

  private eventHandler(event: GameEvent): void {
    if (event.type === 'WAITING_ORDERS') this.getNewOrders(event.robotId);
    if (event.type === 'MISSION_ACCOMPLISHED')
      this.warehouse.eventManager.unhookEvents(this.listenerId);
  }

  /**
   * Return the ratio between the amount of two types of Specialists
   * This method is used in the second phase of the strategy
   */
  private getSpecialistRatio(
    firstJob: RobotOrder,
    secondJob: RobotOrder,
  ): number {
    return (
      this.warehouse.robotsFleet.filter(
        robot =>
          robot.processingAction === firstJob ||
          robot.pendingAction === firstJob,
      ).length /
      this.warehouse.robotsFleet.filter(
        robot =>
          robot.processingAction === secondJob ||
          robot.pendingAction === secondJob,
      ).length
    );
  }

  /**
   * Determine the position of the newly acquired Bot during Phase Two
   * These bots are specialists and will stay on their positions
   * During Phase Two we try to balance ressources with ratio of specialists in the team
   *
   * TODO: fine tune the ratio
   */
  private recruitingStrategyPhaseTwo(): RobotOrder {
    // we want the ratio between foo miner specialist and assembler spec. < 2.5
    if (this.getSpecialistRatio('MINE_FOO', 'ASSEMBLE_FOOBAR') < 2.0)
      return 'MINE_FOO';
    // we want the ratio between bar miner specialist and assembler spec. < 0.7
    if (this.getSpecialistRatio('MINE_BAR', 'ASSEMBLE_FOOBAR') < 0.7)
      return 'MINE_BAR';
    // we want the ratio between assembler specialist and seller spec. to be < 2
    if (this.getSpecialistRatio('ASSEMBLE_FOOBAR', 'SELL_FOOBAR') < 2)
      return 'ASSEMBLE_FOOBAR';
    return 'SELL_FOOBAR';
  }

  /**
   * Determine the position of the newly acquired Bot during Phase One
   * These bots are specialists and will stay on their positions
   * During Phase One we provision every job with at least one specialist
   */
  private recruitingStrategyPhaseOne(): RobotOrder {
    if (
      // check if there is already a bar miner specialist if not ask for one
      !this.warehouse.robotsFleet.find(
        robot =>
          robot.specialized &&
          (robot.processingAction === 'MINE_BAR' ||
            robot.pendingAction === 'MINE_BAR'),
      )
    ) {
      return 'MINE_BAR';
    }
    if (
      // check if there is already a buyer specialist if not ask for one
      !this.warehouse.robotsFleet.find(
        robot =>
          robot.specialized &&
          (robot.processingAction === 'MINE_FOO' ||
            robot.pendingAction === 'MINE_FOO'),
      )
    ) {
      return 'MINE_FOO';
    }
    if (
      // check if there is already an assembler specialist if not ask for one
      !this.warehouse.robotsFleet.find(
        robot =>
          robot.specialized &&
          (robot.processingAction === 'ASSEMBLE_FOOBAR' ||
            robot.pendingAction === 'ASSEMBLE_FOOBAR'),
      )
    ) {
      return 'ASSEMBLE_FOOBAR';
    }
    return 'SELL_FOOBAR';
  }

  private resumeMission(robot: Robot): void {
    switch (robot.pendingAction) {
      case 'ASSEMBLE_FOOBAR':
        robot.assembleFoobar();
        break;
      case 'MINE_FOO':
        robot.mineFoo();
        break;
      case 'MINE_BAR':
        robot.mineBar();
        break;
      case 'BUY_ROBOT':
        robot.buyRobot(this.recruitingStrategyPhaseOne());
        break;
      case 'SELL_FOOBAR':
        robot.sellFoobars(SELL_AMOUNT_STRATEGY);
        break;
    }
  }

  /**
   * During Phase Two we have no generalist Bot anymore
   * All our team positions are provisioned and we keep recruiting new specialists
   */
  private strategyPhaseTwo(robot: Robot): void {
    if (robot.processingAction !== 'RESUME_MISSION') return;
    // we use the recruiting strategy of the second phase
    if (robot.pendingAction === 'BUY_ROBOT') {
      robot.buyRobot(this.recruitingStrategyPhaseTwo());
    } else if (
      // specialize the generalist bot
      !robot.specialized
    ) {
      // Warning: Event Sourcing pattern violation
      // TODO: user event to specialize the bot
      robot.specialized = true;
      robot.changeOrder('BUY_ROBOT');
    } else this.resumeMission(robot);
  }

  /**
   * During Phase One we have only one generalist Bot
   * It will move to the different job to recruit the next Bots
   * These new Bots will be our first specialists
   */
  private strategyPhaseOne(robot: Robot): void {
    // if the robot is not waiting to receive its mission leave
    if (robot.processingAction !== 'RESUME_MISSION') return;
    let changedTask = false;
    // if the bot is not a specialist we determine its new orders
    if (!robot.specialized) {
      if (this.warehouse.canBuyRobot()) {
        if (robot.pendingAction !== 'BUY_ROBOT') {
          robot.changeOrder('BUY_ROBOT');
          changedTask = true;
        }
      } else if (
        // check if there is 5 foobars to be sold
        this.warehouse.canSellFoobars(SELL_AMOUNT_STRATEGY)
      ) {
        if (robot.pendingAction !== 'SELL_FOOBAR') {
          changedTask = true;
          robot.changeOrder('SELL_FOOBAR');
        }
      } else if (
        // check if we can assemble foobars
        this.warehouse.canAssembleFoobar()
      ) {
        if (robot.pendingAction !== 'ASSEMBLE_FOOBAR') {
          changedTask = true;
          robot.changeOrder('ASSEMBLE_FOOBAR');
        }
      }
    }
    // if we didn't give new orders to the bot or the bot is a specialist
    // we tell it to resume its mission
    if (!changedTask) this.resumeMission(robot);
  }

  private getNewOrders(robotId: string): void {
    const robot = this.warehouse.robotsFleet.find(
      robot => robot.identifier === robotId,
    );
    if (!robot) return;
    if (this.warehouse.numberOfRobots <= 5) this.strategyPhaseOne(robot);
    else this.strategyPhaseTwo(robot);
  }
}

export default FleetSupervisor;
