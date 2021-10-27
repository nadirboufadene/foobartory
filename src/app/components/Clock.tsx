import { useEffect, ReactElement, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import {
  GameEvent,
  SubscribeEvent,
  UnsubscribeEvent,
} from '../../GameMechanics/EventStore/events';
import { v4 as uuid } from 'uuid';
import { GAME_CLOCK_MS_MULTIPLIER } from '../../GameMechanics/config';

export interface ClockProps {
  subscribeEvent: SubscribeEvent;
  unsubscribeEvent: UnsubscribeEvent;
}

function Clock({ subscribeEvent, unsubscribeEvent }: ClockProps): ReactElement {
  const [timerState, setTimerState] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  let timerID: NodeJS.Timer;
  useEffect(() => {
    if (isRunning) {
      timerID = setInterval(
        () => setTimerState(() => timerState + 1),
        1 * GAME_CLOCK_MS_MULTIPLIER,
      );
    }
    return () => {
      clearInterval(timerID);
    };
  }, [isRunning, timerState]);

  useEffect(() => {
    const listenerId = uuid();
    subscribeEvent(listenerId, (event: GameEvent) => {
      if (event.type === 'MISSION_ACCOMPLISHED') {
        setIsRunning(false);
      }
    });
    return () => {
      unsubscribeEvent(listenerId);
    };
  });

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Box sx={{ width: '100%', maxWidth: 500, flexGrow: 1 }}>
        <Typography
          style={{ flexGrow: 1 }}
          align="center"
          variant="h1"
          component="div"
          gutterBottom
        >
          {timerState}
        </Typography>
      </Box>
    </Grid>
  );
}

export default Clock;
