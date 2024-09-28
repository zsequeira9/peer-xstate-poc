import { useEffect, useState, useSyncExternalStore, useCallback } from "react";
import { SnapshotFrom, AnyActorRef, createActor, ActorOptions, InspectionEvent } from "xstate";

import { ChildControllerMachine } from "./playerControllerMachineXstate";
import { client } from "./client";
import { XstateEventAction } from "./message";

type childSnapshot = SnapshotFrom<typeof ChildControllerMachine>

interface GameboardProps {
    MachineLogic: any
}

const inspectionProcessor = (inspectionEvent: InspectionEvent) => {
    if (inspectionEvent.type === '@xstate.event') {
        console.group("XSTATE updated - inspection event")
        if (inspectionEvent.actorRef.getSnapshot().systemId == 'root_id' ) {
            console.log("ROOT")
        } else {
            console.log("Not Root")
        }
        if (inspectionEvent.event.type.includes('xstate')) {
            console.log("ignoring Internal xstate event", inspectionEvent.event)
        } else if (inspectionEvent.event.value) {
            console.log("This is a replayed event, don't bubble it");
        } else {
            console.log("Event triggered by a human (client didn't add the ID when receiving)");
            const message = new XstateEventAction()
            message.data = inspectionEvent.event
            client.send(message)
        }
        console.groupEnd()
    }
}
const actorOptions: ActorOptions<any> = {
    systemId: 'root-id',
    inspect: inspectionProcessor
}

export default function Gameboard({MachineLogic: MachineLogic}: GameboardProps){

    // Set up intial actor and actor system.
    const [[actorRef, system], setActorRef] = useState(() => {
        // noinspection TypeScriptValidateTypes
        let actor = createActor(MachineLogic,actorOptions);
        let system = actor.start();
        return [actor, system];
    });

    // Update the machine referenced by the replication client when it changes
    useEffect(() => {
        client.xstate = actorRef;
    }, [actorRef])

    // When Machine Logic updates, recreate the actor and system.
    useEffect(() => {
        // noinspection TypeScriptValidateTypes
        let actor = createActor(MachineLogic, actorOptions);
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