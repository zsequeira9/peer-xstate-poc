import { host } from "./host";
import { client } from "./client";
import { useState } from 'react';
import { PlayerControllerActor } from "./playerControllerMachine";
import { IncrementEventAction } from "./message";

let hostId = '';
let name = '';

export default function App() {
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

            <div>
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
                            console.log("Host id", hostId)
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

                <button onClick={() => {
                    PlayerControllerActor.send({ type: "increment"})
                    client.send(new IncrementEventAction())
                }}>
                    Increment
                </button>
            </div>

        </main>
    )
}