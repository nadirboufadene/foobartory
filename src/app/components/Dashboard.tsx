import { useEffect, ReactElement, useState } from 'react';
import {
  GameEvent,
  ReportInventoryState,
  SubscribeEvent,
  UnsubscribeEvent,
} from '../../GameMechanics/EventStore/events';
import { Stack, Paper as Item } from '@mui/material';
import { v4 as uuid } from 'uuid';

export interface DashboardProps {
  subscribeEvent: SubscribeEvent;
  unsubscribeEvent: UnsubscribeEvent;
}

function Dashboard({
  subscribeEvent,
  unsubscribeEvent,
}: DashboardProps): ReactElement<DashboardProps> {
  const [inventoryState, setInventoryState] = useState<
    ReportInventoryState | undefined
  >(undefined);

  useEffect(() => {
    const listenerId = uuid();
    subscribeEvent(listenerId, (event: GameEvent) => {
      if (event.type === 'REPORT_INVENTORY_STATE') {
        setInventoryState(event);
      }
      if (event.type === 'MISSION_ACCOMPLISHED') unsubscribeEvent(listenerId);
    });
    return () => {
      unsubscribeEvent(listenerId);
    };
  });

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      direction="row"
      spacing={2}
    >
      <Item>foos: {inventoryState ? inventoryState.numberOfFoos : 0} </Item>
      <Item>bars: {inventoryState ? inventoryState.numberOfBars : 0} </Item>
      <Item>
        foobars: {inventoryState ? inventoryState.numberOfFoobars : 0}{' '}
      </Item>
      <Item>
        wasted foos: {inventoryState ? inventoryState.numberOfWastedFoos : 0}{' '}
      </Item>
      <Item>bank: {inventoryState ? inventoryState.bank : 0} </Item>
      <Item>
        money spent: {inventoryState ? inventoryState.moneySpent : 0}{' '}
      </Item>
      <Item>
        money won:{' '}
        {inventoryState ? inventoryState.moneySpent + inventoryState.bank : 0}{' '}
      </Item>
      <Item>robots: {inventoryState ? inventoryState.numberOfRobots : 0} </Item>
    </Stack>
  );
}

export default Dashboard;
