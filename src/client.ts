import { DataConnection, Peer } from 'peerjs'
import { Message, JoinGameMessage } from './message';
import { AnyActorRef, AnyEventObject} from "xstate";

class Client {
    peer!: Peer;

    connection!: DataConnection;

    name: string = '';

    names: string[] = [];
    eventLog: AnyEventObject[] = [];

    outMessages: Message[] = [];
    inMessages: Message[] = [];

    #xstate?: AnyActorRef;

    previousActionId: string = '';

    setNamesFunction: React.Dispatch<React.SetStateAction<string[]>>

    constructor(setNamesFunction: any) {
        this.setNamesFunction = setNamesFunction;
    }

    initialize() {
        this.peer = new Peer();

        const clientInitializedPromise = new Promise<string>((resolve) => {
            this.peer.on('open', (id) => {
                console.log('My peer ID is: ' + id);
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
        console.log("Joining host with id: ", hostId);
        if (this.connection) {
            this.connection.close();
        }
    
        this.connection = this.peer.connect(hostId, {
            reliable: true
        });
    
        this.connection.on('open', () => {
            console.log("Client connected to: " + this.connection.peer);

            this.connection.on('data', (data) => {
                console.group("connection.onData")
                console.log('raw', data)
                this.receive(data);
                console.groupEnd()
            });

            this.connection.on('close', () => {
                console.log("Connection to host closed")
            });

            this.send(new JoinGameMessage(this.name))
        });

    }
    
    send(data: Message) {
        this.previousActionId = data.id;
        if (this.connection && this.connection.open) {
            this.outMessages.push(data)
            this.connection.send(data);
            console.log("Client sending data ", JSON.stringify(data, null, 4));
        } else {
            console.log('Unable to send, no open connection');
        }
    }

    receive(message: Message) {
        console.log("Client received message ", message);
        if (this.outMessages.map(message => message.id).includes(message.id)) {
            const lastSent = this.outMessages[this.outMessages.length -1]
            console.debug("My Message!", message);
            console.debug("fyi last sent", lastSent);
            return;
        }
        switch(message.type) {
            case "controllerReset":
                // console.log("Resetting controller", message.data.names);
                // set names in main App 
                this.setNamesFunction(message.data.names);

                this.names = message.data.names;
                break;
            case "xstate":
                console.group("replaying xstate message")
                console.log(message)
                message.data.value = message.id
                this.eventLog.push(message.data)
                this.xstate?.send(message.data);
                console.groupEnd()
                break;
        }
    }

    set xstate(actor: AnyActorRef) {
        // Any setup code you want
        this.eventLog = [];  // Reset replication log
        this.#xstate = actor;
    }
    get xstate() {
        // Any setup code you want
        return this.#xstate;
    }
}

export const client = new Client(null);