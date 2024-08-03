import { assign, setup, createActor } from 'xstate';
import { PlayerController } from './controller';

interface resetControllerEvent {type: 'resetController', controller: PlayerController};

const PlayerControllerMachine = setup({
    types: {
        context: {} as {controller: PlayerController},
        input: {} as PlayerController,
        events: {} as 
            | resetControllerEvent
            | { type: 'increment' }
    },
    actions: {
        increment: assign(({context}) => {
            context.controller.increment();
            return context;
        }),
        // resetController: assign((_, event: resetControllerEvent) => {
        //     console.log(event);
        //     return {controller: event.controller};
        // })
    }
  }).createMachine({
    id: 'PlayerController',
    context: ({input}) => (
        {controller: input}
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
                },
                'resetController': {
                    actions: assign(({event}) => {
                        return {controller: event.controller};
                    })
                }
            }
        }
    }
  });

export const PlayerControllerActor = createActor(PlayerControllerMachine, {
    input: new PlayerController([], '')
  }).start();