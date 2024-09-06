import Gameboard from './Gameboard';
import { host } from "./host";
import { client } from "./client";
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useActor, useActorRef } from '@xstate/react';
import { StateMachine, AnyActorLogic } from 'xstate';
import { createGameMachine, getGameMachine } from './playerControllerMachineXstate';

let hostId = '';
let name = '';

export default function App() {

    // function useOnlineStatus() {
    //     // ✅ Good: Subscribing to an external store with a built-in Hook
    //     return useSyncExternalStore(
    //       subscribe, // React won't resubscribe for as long as you pass the same function
    //       () => getGameMachine, // How to get the value on the client
    //     );
    //   }

    // const [state, send, actorRef] = useActor(__gameMachine);

    // const [machineState, setMachineState] = useState(state);
    // const [machineSend, setMachineSend] = useState(send);
    // const [machineActorRef, setMachineActorRef] = useState(actorRef);

    const [ParentMachine, setParentMachine] = useState<StateMachine>(getGameMachine());
    const [snapshot, send, actorRef] = useActor(ParentMachine);

    // const [names, setNames] = useState<string[]>([]);
    // client.setParentMachine = setParentMachine;

    useEffect(() => {
        function doit(e: CustomEvent) {
            // const [state, send, actorRef] = useActor(e.detail);
            // setMachineState(state);
            // setMachineSend(send);
            // setMachineActorRef(actorRef);
            console.log("App parent machine", getGameMachine().children);
            setParentMachine(getGameMachine());
        }
        window.addEventListener('newMachine', doit);
        return () => {
            window.removeEventListener('newMachine', doit);
        };
    }, []);

    const [isNetworkSetup, setIsNetworkSetup] = useState(true);
    const [isHost, setIsHost] = useState(false);

    const hostButton = <button onClick={() => {
        // loading_spinner = true
        let hostInitialized = host.initialize()
        let clientInitialized = client.initialize()
        Promise.all([hostInitialized, clientInitialized])
            .then(([_hostId, _]) => {
                hostId = _hostId;
                client.join(hostId, name);
                setIsHost(true);
                setIsNetworkSetup(false);
                // loading_spinning = false
            })
    }}>
        Start a lobby
    </button>

    const clientButton = <button onClick={() => {
        client.initialize();
        setIsHost(false);
        setIsNetworkSetup(false);
    }}>
        Join a lobby
    </button>

    return (
        <main>
            {
                isNetworkSetup ?
                    <div>
                        <label>
                            Name: <input name="name"
                                onChange={e => {
                                    name = e.target.value;
                                }}
                                type="text" />
                        </label>
                        {hostButton}
                        {clientButton}
                    </div>
                    : null
            }

            {!isNetworkSetup && !isHost ?
                <div>
                    <label>
                        Lobby Id: <input name="hostId"
                            onChange={e => {
                                hostId = e.target.value;
                            }}
                            type="text" />
                    </label>
                    <button onClick={() => {
                        // console.log("Host id", hostId)
                        client.join(hostId, name);
                    }}>
                        Join the lobby
                    </button>
                </div>
                : null}

            {!isNetworkSetup && isHost ?
                <div> host Id: {hostId} </div>
                : null
            }
            <Gameboard snapshot={snapshot} send={send}></Gameboard>
            {/* <Gameboard state={machineState}
            send={machineSend}
            actorRef={machineActorRef}></Gameboard> */}

        </main>
    )
}