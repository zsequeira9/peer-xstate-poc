import Gameboard from './Gameboard';
import { host } from "./host";
import { Client } from "./client";
import { useEffect, useState } from 'react';
import { AnyActorLogic } from 'xstate';
import { createGameMachine, getGameMachine } from './playerControllerMachineXstate';

let hostId = '';
let name = '';

export default function App() {

    const [machineLogic, setMachineLogic] = useState<AnyActorLogic>(getGameMachine());

    const [names, setNames] = useState<string[]>([]);

    const client = new Client(setNames);

    // When client updates list of names, recreate the machine logic
    useEffect(() => {
        const logic = createGameMachine(names);
        console.log("Names in App updated, recreating machine logic");
        setMachineLogic(logic);
    }, [names])

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
                        let clientInitialized = client.initialize();
                        Promise.resolve(clientInitialized)
                            .then(() => {client.join(hostId, name)});
                    }}>
                        Join the lobby
                    </button>
                </div>
                : null}

            {!isNetworkSetup && isHost ?
                <div> host Id: {hostId} </div>
                : null
            }
            <Gameboard key={names.length} MachineLogic={machineLogic}></Gameboard>

        </main>
    )
}