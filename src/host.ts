import { DataConnection, Peer } from 'peerjs'
import { ClientMessage, ControllerResetMessage, HostMessage, JoinGameMessage } from './message';
import { Controller } from './controller';

class Host {
    peer: Peer | undefined;

    connections: DataConnection[] = [];

    controller: Controller | undefined;

    initialize() {
        this.peer = new Peer();
    
        this.peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
        });
    
        this.peer.on('connection', (connection: DataConnection) => {
            console.log("Connected to: " + connection.peer);
            connection.on('data', (data) => {
                const message = data as ClientMessage;
                this.receive(message);
            })
            this.connections.push(connection);
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

    send(data: HostMessage) {
        this.connections.forEach((connection) => {
            connection.send(data);
        })
    }

    receive(message: ClientMessage) {
        console.log(message);
        console.log(message.type);
        switch(message.type) {
            case "joinGame":
                const currentNames = this.controller ? this.controller.names : [];
                this.controller = new Controller([(message as JoinGameMessage).data.name].concat(currentNames))
                console.log(this.controller.names);
                this.send({
                    type: "controllerReset",
                    data: this.controller
                } as ControllerResetMessage)
        }
    }
}

export const host = new Host();