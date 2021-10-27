import Dashboard from './components/Dashboard';
import Clock from './components/Clock';
import RobotsFleet from './components/RobotsFleet';
import {
  SubscribeEvent,
  UnsubscribeEvent,
} from '../GameMechanics/EventStore/events';
import { useEffect } from 'react';

interface AppProps {
  startGame: () => void;
  subscribeEvent: SubscribeEvent;
  unsubscribeEvent: UnsubscribeEvent;
}

export function App(props: AppProps) {
  const { startGame, subscribeEvent, unsubscribeEvent } = props;
  useEffect(() => {
    startGame();
  }, []);

  return (
    <>
      <Clock
        subscribeEvent={subscribeEvent}
        unsubscribeEvent={unsubscribeEvent}
      />
      <Dashboard
        subscribeEvent={subscribeEvent}
        unsubscribeEvent={unsubscribeEvent}
      />
      <RobotsFleet
        subscribeEvent={subscribeEvent}
        unsubscribeEvent={unsubscribeEvent}
      />
    </>
  );
}
