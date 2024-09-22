import { useEffect, useState, useSyncExternalStore, useCallback } from "react";
import { SnapshotFrom, AnyActorRef, createActor } from "xstate";

import { ChildControllerMachine } from "./playerControllerMachineXstate";

type childSnapshot = SnapshotFrom<typeof ChildControllerMachine>

interface GameboardProps {
    ParentMachineLogic: any
}

export default function Gameboard({ParentMachineLogic: ParentMachine}: GameboardProps){

    const [[actorRef, system], setActorRef] = useState(() => {
        let actor = createActor(ParentMachine, {
            systemId: 'root-id',
            inspect: (inspectionEvent) => {
                console.log(inspectionEvent);
            }
        }); 
        let system = actor.start();
        return [actor, system];
    });

    const [players, setPlayers] = useState<Record<string, childSnapshot>>({})

    useEffect(() => {
        let actor = createActor(ParentMachine);
        let system = actor.start();
        setActorRef([actor, system]);
    }, [ParentMachine]);

    const getSnapshot = useCallback(() => {
        const newSnapshot = actorRef.getSnapshot();

        return newSnapshot
    }, [actorRef]);

    const subscribe = useCallback((handleStoreChange: () => void) => {
        const { unsubscribe } = actorRef.subscribe(handleStoreChange);
        return unsubscribe;
    }, [actorRef]);

    const snapshot = useSyncExternalStore(subscribe, getSnapshot);
    
    // useEffect(() => {
    //     const subscription = actorRef.subscribe((snapshot) => {
    //         console.log("Use effect snapshot", snapshot);
    //         // Get child snapshots
    //         setPlayers(Object.fromEntries(
    //             Object.entries(snapshot.children).map(
    //                 ([key, value]) => [key, value.getSnapshot()]))
    //             )
    //     });
      
    //     return subscription.unsubscribe;
    //   }, [snapshot]);
    
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
                // disabled={ child.getSnapshot().value === 'waiting' }
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