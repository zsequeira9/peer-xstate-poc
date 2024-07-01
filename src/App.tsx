import { host } from "./host";
import { client } from "./client";
import { JoinGameMessage } from "./message";

let hostId = '';
let name = '';

export default function App() {
    return (
        <main>
            <button onClick={() => {
                host.initialize()
            }}>
                Start a lobby
            </button>
            <label>
                Lobby Id: <input name="hostId"
                    onChange={e => {
                        hostId = e.target.value;
                    }}
                type="text" />
            </label>
            <button onClick={() => {
                client.initialize();
            }}>
                Join a lobby
            </button>
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
            <button onClick={() => {
                client.send({
                    data: {
                        name: name
                    }
                } as JoinGameMessage)
            }}>
                aaaaaaaaaaa
            </button>
        </main>
    )
}