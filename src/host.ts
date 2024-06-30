import { DataConnection, Peer } from 'peerjs'
import { ClientMessage, HostMessage } from './message';

class Host {
    peer: Peer | undefined = undefined;

    connections: DataConnection[] = [];

    initialize() {
        this.peer = new Peer();
    
        this.peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
        });
    
        this.peer.on('connection', (connection: DataConnection) => {
            console.log("Connected to: " + connection.peer);
            this.connections.push(connection);
            connection.on('data', (data) => {
                const message = data as ClientMessage;
                this.receive(message);
            })
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
    }
}

export const host = new Host();