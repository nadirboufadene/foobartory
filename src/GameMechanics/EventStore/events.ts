import { SerializedRobot } from '../Robot';
import { SerializedWarehouse } from '../Warehouse';

export type RobotOrder =
  | 'ASSEMBLE_FOOBAR'
  | 'SELL_FOOBAR'
  | 'MINE_BAR'
  | 'MINE_FOO'
  | 'BUY_ROBOT'
  | 'CHANGE_TASK'
  | 'WAITING_RESSOURCES'
  | 'RESUME_MISSION';

export type SubscribeEvent = (
  listenerId: string,
  onEvent: (event: GameEvent) => void,
) => void;

export type UnsubscribeEvent = (listenerId: string) => void;

export type GameEvent =
  | BuyingNewBotStart
  | BuyingNewBotTry
  | BuyingNewBotSuccess
  | BuyingNewBotFailure
  | BarMiningStart
  | BarMiningSuccess
  | FooMiningStart
  | FooMiningSuccess
  | AssemblingFoobarStart
  | AssemblingFoobarTry
  | AssemblingFoobarSuccess
  | AssemblingFoobarFailure
  | SellingFoobarStart
  | SellingFoobarTry
  | SellingFoobarSuccess
  | SellingFoobarFailure
  | ChangingOrderStart
  | ChangingOrderSuccess
  | GameStarted
  | ReportInventoryState
  | ReportRobotStateSend
  | ReportRobotStateAsk
  | MissionAccomplished
  | WaitingOrders
  | NewBotArrived;

type BaseEvent = {
  type: string;
};

type RobotEvent = BaseEvent & {
  robotId: string;
};

type GameStarted = BaseEvent & {
  type: 'GAME_STARTED';
};
export function gameStarted(): GameStarted {
  return { type: 'GAME_STARTED' };
}

type BuyingNewBotStart = RobotEvent & {
  type: 'BUYING_NEW_ROBOT_START';
};
export function buyingNewBotStart(robotId: string): BuyingNewBotStart {
  return { robotId: robotId, type: 'BUYING_NEW_ROBOT_START' };
}

type BuyingNewBotTry = RobotEvent & {
  type: 'BUYING_NEW_ROBOT_TRY';
  order: RobotOrder;
};
export function buyingNewBotTry(
  robotId: string,
  order: RobotOrder,
): BuyingNewBotTry {
  return { robotId: robotId, type: 'BUYING_NEW_ROBOT_TRY', order: order };
}

type BuyingNewBotSuccess = RobotEvent & {
  type: 'BUYING_NEW_ROBOT_SUCCESS';
};
export function buyingNewBotSuccess(robotId: string): BuyingNewBotSuccess {
  return { robotId: robotId, type: 'BUYING_NEW_ROBOT_SUCCESS' };
}

type BuyingNewBotFailure = RobotEvent & {
  type: 'BUYING_NEW_ROBOT_FAILURE';
  error: string;
};
export function buyingNewBotFailure(
  robotId: string,
  error: string,
): BuyingNewBotFailure {
  return { robotId: robotId, type: 'BUYING_NEW_ROBOT_FAILURE', error: error };
}

type FooMiningStart = RobotEvent & {
  type: 'FOO_MINING_START';
};
export function fooMiningStart(robotId: string): FooMiningStart {
  return { robotId: robotId, type: 'FOO_MINING_START' };
}

type FooMiningSuccess = RobotEvent & {
  type: 'FOO_MINING_SUCCESS';
};
export function fooMiningSuccess(robotId: string): FooMiningSuccess {
  return { robotId: robotId, type: 'FOO_MINING_SUCCESS' };
}

type BarMiningStart = RobotEvent & {
  type: 'BAR_MINING_START';
};
export function barMiningStart(robotId: string): BarMiningStart {
  return { robotId: robotId, type: 'BAR_MINING_START' };
}

type BarMiningSuccess = RobotEvent & {
  type: 'BAR_MINING_SUCCESS';
};
export function barMiningSuccess(robotId: string): BarMiningSuccess {
  return { robotId: robotId, type: 'BAR_MINING_SUCCESS' };
}

type AssemblingFoobarStart = RobotEvent & {
  type: 'ASSEMBLING_FOOBAR_START';
};
export function assemblingFoobarStart(robotId: string): AssemblingFoobarStart {
  return { robotId: robotId, type: 'ASSEMBLING_FOOBAR_START' };
}

type AssemblingFoobarTry = RobotEvent & {
  type: 'ASSEMBLING_FOOBAR_TRY';
};
export function assemblingFoobarTry(robotId: string): AssemblingFoobarTry {
  return { robotId: robotId, type: 'ASSEMBLING_FOOBAR_TRY' };
}

type AssemblingFoobarSuccess = RobotEvent & {
  type: 'ASSEMBLING_FOOBAR_SUCCESS';
};
export function assemblingFoobarSuccess(
  robotId: string,
): AssemblingFoobarSuccess {
  return { robotId: robotId, type: 'ASSEMBLING_FOOBAR_SUCCESS' };
}

type AssemblingFoobarFailure = RobotEvent & {
  type: 'ASSEMBLING_FOOBAR_FAILURE';
  error: string;
};
export function assemblingFoobarFailure(
  robotId: string,
  error: string,
): AssemblingFoobarFailure {
  return { robotId: robotId, type: 'ASSEMBLING_FOOBAR_FAILURE', error: error };
}

type SellingFoobarStart = RobotEvent & {
  type: 'SELLING_FOOBAR_START';
};
export function sellingFoobarStart(robotId: string): SellingFoobarStart {
  return { robotId: robotId, type: 'SELLING_FOOBAR_START' };
}

type SellingFoobarTry = RobotEvent & {
  type: 'SELLING_FOOBAR_TRY';
  amount: number;
};
export function sellingFoobarTry(
  robotId: string,
  amount: number,
): SellingFoobarTry {
  return { robotId: robotId, type: 'SELLING_FOOBAR_TRY', amount: amount };
}

type SellingFoobarSuccess = RobotEvent & {
  type: 'SELLING_FOOBAR_SUCCESS';
  amount: number;
};
export function sellingFoobarSuccess(
  robotId: string,
  amount: number,
): SellingFoobarSuccess {
  return { robotId: robotId, type: 'SELLING_FOOBAR_SUCCESS', amount: amount };
}

type SellingFoobarFailure = RobotEvent & {
  type: 'SELLING_FOOBAR_FAILURE';
  error: string;
};
export function sellingFoobarFailure(
  robotId: string,
  error: string,
): SellingFoobarFailure {
  return { robotId: robotId, type: 'SELLING_FOOBAR_FAILURE', error: error };
}

type ChangingOrderStart = RobotEvent & {
  type: 'CHANGING_ORDER_START';
  newOrder: RobotOrder;
};
export function changingOrderStart(
  robotId: string,
  newOrder: RobotOrder,
): ChangingOrderStart {
  return { robotId: robotId, type: 'CHANGING_ORDER_START', newOrder: newOrder };
}

type ChangingOrderSuccess = RobotEvent & {
  type: 'CHANGING_ORDER_SUCCESS';
};
export function changingOrderSuccess(robotId: string): ChangingOrderSuccess {
  return { robotId: robotId, type: 'CHANGING_ORDER_SUCCESS' };
}

export type ReportInventoryState = SerializedWarehouse &
  BaseEvent & {
    type: 'REPORT_INVENTORY_STATE';
  };
export function reportInventoryState(
  report: SerializedWarehouse,
): ReportInventoryState {
  return { type: 'REPORT_INVENTORY_STATE', ...report };
}

type RobotState = {
  robot: SerializedRobot;
};

type NewBotArrived = RobotState & {
  type: 'NEW_ROBOT_ARRIVED';
};
export function newBotArrived(robot: SerializedRobot): NewBotArrived {
  return { type: 'NEW_ROBOT_ARRIVED', robot: robot };
}

export type ReportRobotStateSend = RobotState &
  BaseEvent & {
    type: 'REPORT_ROBOT_STATE_SENT';
  };
export function reportRobotStateSend(
  robot: SerializedRobot,
): ReportRobotStateSend {
  return { type: 'REPORT_ROBOT_STATE_SENT', robot: robot };
}

export type ReportRobotStateAsk = RobotState & {
  type: 'REPORT_ROBOT_STATE_ASKED';
};
export function reportRobotStateAsk(
  robot: SerializedRobot,
): ReportRobotStateAsk {
  return { type: 'REPORT_ROBOT_STATE_ASKED', robot: robot };
}

export type MissionAccomplished = {
  type: 'MISSION_ACCOMPLISHED';
};
export function missionAccomplished(): MissionAccomplished {
  return { type: 'MISSION_ACCOMPLISHED' };
}

export type WaitingOrders = RobotEvent & {
  type: 'WAITING_ORDERS';
};
export function waitingOrders(robotId: string): WaitingOrders {
  return { type: 'WAITING_ORDERS', robotId: robotId };
}
