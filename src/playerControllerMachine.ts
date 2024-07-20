import { assign, setup } from 'xstate';
import { PlayerController } from './controller';

export const PlayerControllerMachine = setup({
    types: {
        context: {} as PlayerController,
        input: {} as PlayerController,
        events: {} as
            | { type: 'increment' }
    },
    actions: {
        increment: assign(({context}) => {
            context.increment();
            return context;
        }),
    }
  }).createMachine({
    id: 'PlayerController',
    context: ({input}) => (
        input
    ),
    initial: 'default',
    states: {
        default: {
            on: {
                'increment': {
                    actions: [
                        {
                            type: 'increment'
                        }
                    ]
                }
            }
        }
    }
  });