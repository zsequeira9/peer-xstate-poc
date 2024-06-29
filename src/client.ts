import { DataConnection, Peer } from 'peerjs'

class Client {
    peer: Peer | undefined = undefined;

    connection: DataConnection | undefined = undefined;

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
    
    join(hostId: string) {
        if (this.connection) {
            this.connection.close();
        }
    
        this.connection = this.peer?.connect(hostId, {
            reliable: true
        });
    
        this.connection?.on('open', () => {
            console.log("Connected to: " + this.connection?.peer);
        });
    
        this.connection?.on('data', (data) => {
            console.log(data);
        });
        this.connection?.on('close', () => {
            console.log("connection closed")
        });
    
    }
    
    send(data: string) {
        if (this.connection && this.connection.open) {
            this.connection.send(data);
            console.log(data + " data sent");
        } else {
            console.log('Connection is closed');
        }
    }
    
}

export const client = new Client();
