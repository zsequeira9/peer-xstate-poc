import { assign, setup, createMachine, enqueueActions, sendTo, log } from 'xstate';

interface scoreCard {
    score: number
}

export const ChildControllerMachine = setup({
    types: {
        context: {} as {controller: scoreCard},
        input: {} as scoreCard,
        events: {} as 
            | { type: 'playButton' }
            | { type: 'startTurn' }
    },
    actions: {
        addRandomScore: assign(({context}) => {
            context.controller.score += Math.floor(Math.random()*100);
            return context;
        }),
    },
  }).createMachine({
    id: 'PlayerController',
    context: ({input}) => (
        {controller: input}
    ),
    initial: 'waiting',
    states: {
        myTurn: {
            on: {
                'playButton': {
                    actions: enqueueActions(({ enqueue }) => {
                        enqueue( log(({self}) => self))
                        enqueue({type: 'addRandomScore'});
                        enqueue.sendParent(({self})=> ({ type: `${self.id}.done` }));
                    }),
                    target: 'waiting',
                },
            }
        },
        waiting: {
            on: {
                'startTurn': {
                    target: 'myTurn'
                }
            }
        }
    }
  });


export const ParentMachine = createMachine({
    entry: [
        assign({
                childMachineRefs: ({ spawn }) => [
                  spawn(ChildControllerMachine, { id: 'player1', input: {score: 0} as scoreCard }),
                  spawn(ChildControllerMachine, { id: 'player2', input: {score: 0} as scoreCard}),
                ],
              })
    ],
    on: {
        'player1.done': {
            actions: sendTo('player2', {type: 'startTurn'}),
        },
        'player2.done': {
                actions: sendTo('player1', { type: 'startTurn' }),
        },
        'start': {
            actions: sendTo('player1', { type: 'startTurn' }),
        }
    }
  });
