// import { AnyEventObject } from "xstate"
import { v4 as uuidv4 } from "uuid"

export type MessageType = "controllerEvent" | "controllerSync" | "joinGame" 
    |  "validControllerEvent" | "controllerReset" | "faceDownSync" | "incrementEventAction"

export interface Message {
    id: string;
    type: MessageType
    data: any
}

export class IncrementEventAction implements Message {
    id: string = uuidv4();
    type: MessageType = "incrementEventAction";
    data = null
}

export class JoinGameMessage implements Message {
    id: string = uuidv4();
    type: MessageType = "joinGame";
    data: {};
    constructor(name: string) {
        this.data = {
            name: name
        }
    }
}

export class ControllerResetMessage implements Message {
    id: string = uuidv4();
    type: MessageType = "controllerReset";
    data: {};
    constructor(names: string[]) {
        this.data = {
            names: names
        }
    }
}


// export class ControllerEventMessage implements Message {
//     id: string = uuidv4();
//     type = "controllerEvent";
//     data: AnyEventObject = 
// }

// export interface ControllerSyncMessage extends Message {
//     type: "controllerSync"
//     data: null
// }

// export interface ValidControllerMessage extends Message {
//     type: "validControllerEvent",
//     data: AnyEventObject,
// }