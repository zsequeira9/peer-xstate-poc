import { useEffect, useState } from "react";
import { SnapshotFrom, AnyActorRef, AnyActorLogic, AnyMachineSnapshot } from "xstate";
import { useActor } from '@xstate/react';

import { ChildControllerMachine } from "./playerControllerMachineXstate";

type childSnapshot = SnapshotFrom<typeof ChildControllerMachine>

interface GameboardProps {
    snapshot: AnyMachineSnapshot
    send: () => any
}

interface Props {
    state: any
    send: any
    actorRef: any
}

export default function Gameboard({snapshot, send}: GameboardProps){
//  export default function Gameboard({state, send, actorRef}: Props){

    // console.log("Parent Machine", ParentMachine);

    // console.log("gameboard machine children", ParentMachine.children);

    // const [state, send, actorRef] = useActor(ParentMachine);
    console.log("inside gameboard children", snapshot.context);
    console.log("inside gameboard parentMachine", snapshot.events);
    console.log("aaa", snapshot.events);
    
    const [players, setPlayers] = useState<Record<string, childSnapshot>>({})

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
    //   }, [actorRef]);
    
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

            <p>{snapshot.events}</p>

        </main>
    )
}