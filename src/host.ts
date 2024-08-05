import { DataConnection, Peer } from 'peerjs'
import { Message, ControllerResetMessage } from './message';

class Host {
    peer!: Peer;

    connections: DataConnection[] = [];

    names: string[] = [];

    initialize() {
        this.peer = new Peer();

        const hostInitializedPromise = new Promise<string>((resolve) => {
            this.peer.on('open', (id) => {
                console.log('My peer ID is: ' + id);
                resolve(id);
            });
        })
    
        this.peer.on('connection', (connection: DataConnection) => {
            console.log("Connected to: " + connection.peer);

            connection.on('data', (data) => {
                const message = data as Message;
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

        return hostInitializedPromise;
    }

    send(data: Message) {
        console.log("Host sending data", JSON.stringify(data, null, 4))
        this.connections.forEach((connection) => {
            connection.send(data);
        })
    }

    receive(message: Message) {
        console.log("Host received message ", message.type);
        switch(message.type) {
            case "joinGame":
                const newName = message.data.name;
                this.names.push(newName);
                this.send(new ControllerResetMessage(this.names))
                break;
            default: 
                this.send({
                    id: message.id,
                    type: message.type,
                    data: message.data
                })    
        }
    }
}

export const host = new Host();