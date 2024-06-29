import { DataConnection, Peer } from 'peerjs'

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
                console.log(data + " Data recieved");
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
}

export const host = new Host();