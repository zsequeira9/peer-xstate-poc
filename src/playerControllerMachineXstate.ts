import { assign, setup, createMachine, enqueueActions, sendTo, log, AnyActorLogic } from 'xstate';

var __gameMachine: AnyActorLogic;

interface scoreCard {
    score: number
}

type spawnFunction = (actorBehavior: AnyActorLogic, {}) => {}

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
                    actions: log("myturn"),
                    target: 'myTurn'
                }
            }
        }
    }
  });


export function getGameMachine() {
    if (__gameMachine === undefined) {
        return createGameMachine([]);
    }
    else {
        return __gameMachine;
    }
}


export function createGameMachine(names: string[]){

    const childMachineRefs = ({spawn}: {spawn: spawnFunction}) => 
        names.map((name) => 
            spawn(ChildControllerMachine, {id: name, input: {score: 0} as scoreCard }))

    const on = {} as Record<string, {}>

    for (let i = 0; i< names.length; i++) {
        let nextPlayer;
        if (i === names.length-1) {
            nextPlayer = names[0];
        }
        else {
            nextPlayer = names[i+1];
        }
        on[`${names[i]}.done`] = {actions: sendTo(nextPlayer, {type: 'startTurn'})}
    }

    on['start'] = {actions: sendTo(names[0], {type: 'startTurn'})}
    // on['start'] = {actions: log('start event')};

    __gameMachine =  createMachine({
            entry: [assign({childMachineRefs})], 
            on: on
        });


    return __gameMachine;

}