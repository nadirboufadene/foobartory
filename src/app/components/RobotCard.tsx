import { CardContent, Typography } from '@mui/material';
import {
  GameEvent,
  SubscribeEvent,
  UnsubscribeEvent,
} from '../../GameMechanics/EventStore/events';
import { v4 as uuid } from 'uuid';
import { useEffect, useState } from 'react';
import { SerializedRobot } from '../../GameMechanics/Robot';

export interface RobotProps {
  subscribeEvent: SubscribeEvent;
  unsubscribeEvent: UnsubscribeEvent;
  robot: SerializedRobot;
}

function RobotCard(props: RobotProps) {
  const { robot, subscribeEvent, unsubscribeEvent } = props;
  const [robotState, setRobotState] = useState<SerializedRobot>(robot);

  useEffect(() => {
    const listenerId = uuid();
    subscribeEvent(listenerId, (event: GameEvent) => {
      if (
        event.type === 'REPORT_ROBOT_STATE_SENT' &&
        robotState.identifier === event.robot.identifier
      ) {
        setRobotState(event.robot);
      }
    });
    return () => {
      unsubscribeEvent(listenerId);
    };
  });

  return robotState ? (
    <CardContent>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {robotState.identifier}
      </Typography>
      <Typography variant="h5" component="div">
        {'action: ' + robotState.processingAction}
      </Typography>
      <Typography sx={{ mb: 1.5 }} color="text.secondary">
        {'pending action: ' + robotState.pendingAction}
      </Typography>
      <Typography variant="body2">
        {'is a specialist: ' + robotState.specialized}
      </Typography>
    </CardContent>
  ) : null;
}

export default RobotCard;
