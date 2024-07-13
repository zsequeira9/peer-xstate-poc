import { DataConnection, Peer } from 'peerjs'
import { ClientMessage, ControllerResetMessage, HostMessage, JoinGameMessage } from './message';
import { Controller } from './controller';

class Client {
    peer: Peer | undefined;

    connection: DataConnection | undefined;

    controller: Controller | undefined;

    initialize() {
        this.peer = new Peer();
    
        this.peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
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
    }
    
    join(hostId: string, name: string) {
        console.log("Client connection upon join", this.connection)
        console.log("Joining host with id: ", hostId);
        if (this.connection) {
            this.connection.close();
        }
    
        this.connection = this.peer?.connect(hostId, {
            reliable: true
        });
    
        this.connection?.on('open', () => {
            console.log("Client connected to: " + this.connection?.peer);

            this.connection?.on('data', (data) => {
                const message = data as HostMessage;
                this.receive(message);
            });

            this.connection?.on('close', () => {
                console.log("Connection to host closed")
            });

            this.send({type: "joinGame", data: {name: name}} as JoinGameMessage)
        });

        console.log("me connection", this.connection);
    }
    
    send(data: ClientMessage) {
        if (this.connection && this.connection.open) {
            this.connection.send(data);
            console.log(data + " data sent");
        } else {
            console.log('Unable to send, no open connection');
        }
    }

    receive(message: HostMessage) {
        console.log(message);
        console.log(message.type);
        switch(message.type) {
            case "controllerReset":
                this.controller = (message as ControllerResetMessage).data
                console.log(this.controller.names);
        }
    }
    
}

export const client = new Client();
