import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import {
  GameEvent,
  SubscribeEvent,
  UnsubscribeEvent,
} from '../../GameMechanics/EventStore/events';
import { v4 as uuid } from 'uuid';
import RobotCard from './RobotCard';
import { SerializedRobot } from '../../GameMechanics/Robot';

export interface RobotsFleetProps {
  subscribeEvent: SubscribeEvent;
  unsubscribeEvent: UnsubscribeEvent;
}

function RobotsFleet(props: RobotsFleetProps) {
  const { subscribeEvent, unsubscribeEvent } = props;
  const [fleetState, setFleetState] = useState<SerializedRobot[]>([]);

  useEffect(() => {
    const listenerId = uuid();
    subscribeEvent(listenerId, (event: GameEvent) => {
      if (event.type === 'NEW_ROBOT_ARRIVED')
        // we give setFleetState a function to avoid stale closure
        setFleetState(fleetState => [...fleetState, event.robot]);
      if (event.type === 'MISSION_ACCOMPLISHED') unsubscribeEvent(listenerId);
    });
    return () => {
      unsubscribeEvent(listenerId);
    };
  });

  return (
    <Grid container spacing={2} className="Robot">
      {fleetState.map(robot => {
        return (
          <Grid item xs={4} key={robot.identifier}>
            <RobotCard
              subscribeEvent={subscribeEvent}
              unsubscribeEvent={unsubscribeEvent}
              robot={robot}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
export default RobotsFleet;
