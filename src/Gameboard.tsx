import { useEffect, useState, useSyncExternalStore, useCallback } from "react";
import { SnapshotFrom, AnyActorRef, createActor } from "xstate";

import { ChildControllerMachine } from "./playerControllerMachineXstate";

type childSnapshot = SnapshotFrom<typeof ChildControllerMachine>

interface GameboardProps {
    MachineLogic: any
}

export default function Gameboard({MachineLogic: MachineLogic}: GameboardProps){

    // Set up intial actor and actor system.
    const [[actorRef, system], setActorRef] = useState(() => {
        let actor = createActor(MachineLogic, {
            systemId: 'root-id',
            inspect: (inspectionEvent) => {
                console.log(inspectionEvent);
            }
        }); 
        let system = actor.start();
        return [actor, system];
    });

    // When Machine Logic updates, recreate the actor and system.
    useEffect(() => {
        let actor = createActor(MachineLogic);
        let system = actor.start();
        setActorRef([actor, system]);
    }, [MachineLogic]);

    // Create React callback which calls xstate snapshot.
    const getSnapshot = useCallback(() => {
        return actorRef.getSnapshot();
    }, [actorRef]);

    // Create React callback which passes a React callback to xstate's subscribe function.
    // When xstate handles a change, it will call the React callback
    //      and React will call the getSnapshot callback and rerender.
    const subscribe = useCallback((handleStoreChange: () => void) => {
        const { unsubscribe } = actorRef.subscribe(handleStoreChange);
        return unsubscribe;
    }, [actorRef]);

    // Set up the subscriber and getSnapshot callbacks
    const snapshot = useSyncExternalStore(subscribe, getSnapshot);

    const [players, setPlayers] = useState<Record<string, childSnapshot>>({})

    // Get child snapshots and save them as players state
    useEffect(() => {
        const subscription = actorRef.subscribe((snapshot) => {
            setPlayers(Object.fromEntries(Object.entries(snapshot.children)
                .map(([key, value]) => {
                    let childRef = (value as AnyActorRef);
                    return [key, childRef.getSnapshot()];
                })
            ))
        });
        return subscription.unsubscribe;
      }, [actorRef]);
    
    // UI Elements

    // Player Scores
    const playerScores = Object.entries(players).map(([playerid, player]) => {
        return (<li key={playerid}>
            <pre>
                score: {player.context.controller.score}
            </pre>
        </li>)
    })

    // Player Buttons
    const PlayerButtons = snapshot.context.childMachineRefs.map((child: AnyActorRef) => 
        <li key={child.id}>
            <button 
                // somehow this updates when also getting child snapshots with useEffect
                disabled={ child.getSnapshot().value === 'waiting' }
                onClick={() => { child.send({type: 'playButton' })}}>
                {child.id}
            </button>
        </li>)

    return (
        <main> 
            <button onClick={() => { system.send({ type: 'start' })  }}>
                start
            </button>

            <ul> {playerScores} </ul>

            <ul> {PlayerButtons} </ul>

            <p>{snapshot.events}</p>

        </main>
    )
}