import { DataConnection, Peer } from 'peerjs'
import { ClientMessage, ControllerResetMessage, HostMessage, JoinGameMessage } from './message';
import { BaseController } from './controller';

class Host {
    peer!: Peer;

    connections: DataConnection[] = [];

    controller?: BaseController;

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
        console.log("Host sending data", JSON.stringify(data, null, 4))
        this.connections.forEach((connection) => {
            connection.send(data);
        })
    }

    receive(message: ClientMessage) {
        console.log("Host received message ", message.type);
        switch(message.type) {
            case "joinGame":
                const newName = (message as JoinGameMessage).data.name;
                const currentNames = this.controller ? [newName].concat(this.controller.names) : [newName];
                this.controller = new BaseController(currentNames)

                this.send({
                    type: "controllerReset",
                    data: {
                        names: currentNames
                    }
                } as ControllerResetMessage)
        }
    }
}

export const host = new Host();