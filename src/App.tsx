import { useEffect, useState } from "react";
import { SnapshotFrom, AnyActorRef } from "xstate";
import { useActor } from '@xstate/react';

import { ParentMachine, ChildControllerMachine } from "./playerControllerMachineXstate";

type childSnapshot = SnapshotFrom<typeof ChildControllerMachine>

export default function App() {

    const [state, send, actorRef] = useActor(ParentMachine);
    
    const [players, setPlayers] = useState<Record<string, childSnapshot>>({})

    useEffect(() => {
        const subscription = actorRef.subscribe((snapshot) => {
            console.log(snapshot);
            // Get child snapshots
            setPlayers(Object.fromEntries(
                Object.entries(snapshot.children).map(
                    ([key, value]) => [key, value.getSnapshot()]))
                )
        });
      
        return subscription.unsubscribe;
      }, [actorRef]);
    
    // Player Scores
    const playerScores = Object.entries(players).map(([playerid, player]) => {
        return (<li key={playerid}>
            <pre>
                score: {player.context.controller.score}
            </pre>
        </li>)
    })

    // Player Buttons
    const PlayerButtons = state.context.childMachineRefs.map((child: AnyActorRef) => 
        <li key={child.id}>
            <button 
                disabled={ child.getSnapshot().value === 'waiting' }
                onClick={() => { child.send({type: 'playButton' })}}>
                {child.id}
            </button>
        </li>)

    return (
        <main> 
            <button onClick={() => { send({ type: 'start' }) }}>
                start
            </button>

            <ul> {playerScores} </ul>

            <ul> {PlayerButtons} </ul>

        </main>
    )
}