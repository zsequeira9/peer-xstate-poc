import { DataConnection, Peer } from 'peerjs'
import { Message, JoinGameMessage } from './message';
import { createGameMachine, getGameMachine } from './playerControllerMachineXstate';
import { StateMachine } from 'xstate';

export class Client {
    peer!: Peer;

    connection!: DataConnection;

    name: string = '';

    names: string[] = [];

    // machine: StateMachine = __gameMachine;

    previousActionId: string = '';

    // setParentMachine: any

    initialize() {
        this.peer = new Peer();

        const clientInitializedPromise = new Promise<string>((resolve) => {
            this.peer.on('open', (id) => {
                // console.log('My peer ID is: ' + id);
                resolve(id);
            });
        });
    
        this.peer.on('connection', (connection) => {
            // Disallow incoming connections
            connection.on('open', () => {
                connection.send("Client does not accept incoming connections");
                setTimeout(() => { connection.close(); }, 500);
            });
        });
    
        this.peer.on('disconnected', () => {
            console.log('Connection lost. Please reconnect');
        });
    
        this.peer.on('close', () => {
            console.log('Connection destroyed');
        });
    
        this.peer.on('error', (err) => {
            console.log(err);
        });

        return clientInitializedPromise;
    }
    
    join(hostId: string, name: string) {
        this.name = name;
        
        // console.log("Client connection upon join", this.connection)
        // console.log("Joining host with id: ", hostId);
        if (this.connection) {
            this.connection.close();
        }
    
        this.connection = this.peer.connect(hostId, {
            reliable: true
        });
    
        this.connection.on('open', () => {
            // console.log("Client connected to: " + this.connection.peer);

            this.connection.on('data', (data) => {
                const message = data as Message;
                this.receive(message);
            });

            this.connection.on('close', () => {
                console.log("Connection to host closed")
            });

            this.send(new JoinGameMessage(this.name))
        });

        // console.log("me connection", this.connection);
    }
    
    send(data: Message) {
        this.previousActionId = data.id;
        if (this.connection && this.connection.open) {
            this.connection.send(data);
            console.log("Client sending data ", JSON.stringify(data, null, 4));
        } else {
            console.log('Unable to send, no open connection');
        }
    }

    receive(message: Message) {
        // console.log("Client received message ", message.type);
        if (message.id === this.previousActionId) {
            console.log("Received own message, ignoring.")
            return;
        }
        switch(message.type) {
            case "controllerReset":
                console.log("Resetting controller", message.data.names);

                this.names = message.data.names;

                createGameMachine(this.names);

                console.log(getGameMachine());
                // PlayerControllerActor.send(
                //     { type: "resetController", 
                //     controller:  new PlayerController(message.data.names, this.name)})
                break;
            case "incrementEventAction":
                getGameMachine().send(
                    {type: "increment"}
                )
        }
    }
}

export const client = new Client();
