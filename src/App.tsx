import { host } from "./host";
import { client } from "./client";
import { useState } from 'react';

let hostId = '';
let name = '';

export default function App() {
    const [isNetworkSetup, setIsNetworkSetup] = useState(true);
    const [isHost, setIsHost] = useState(false);
    const [isClient, setIsClient] = useState(false);

    return (
        <main>
            {
            isNetworkSetup ? 
            <div>
                <button onClick={() => {
                    host.initialize();
                    setIsHost(true);
                    setIsNetworkSetup(false);
                }}>
                    Start a lobby
                </button>

                <button onClick={() => {
                    client.initialize();
                    setIsClient(true);
                    setIsNetworkSetup(false);
                }}>
                    Join a lobby
                </button>
                </div> : null
            }

            {
            isClient ? 
            <div>
                <label>
                    Lobby Id: <input name="hostId"
                        onChange={e => {
                            hostId = e.target.value;
                        }}
                    type="text" />
                </label>

                <label>
                    Name: <input name="name"
                        onChange={e => {
                            name = e.target.value;
                        }}
                        type="text" />
                </label>

                <button onClick={() => {
                    client.join(hostId, name);
                }}>
                    Join the lobby
                </button>
            </div> : null
            }

            {
            isHost ?
            (<div>
                You are da host
            </div>) : null
            }

        </main>
    )
}