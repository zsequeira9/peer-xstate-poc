import { AnyEventObject } from "xstate"
import { Controller } from "./controller"

export type clientMessageType = "controllerEvent" | "controllerSync" | "joinGame"

export type hostMessageType = "validControllerEvent" | "controllerReset" | "faceDownSync"

export interface Message {
    type: clientMessageType | hostMessageType
}

export interface ClientMessage extends Message {
    type: clientMessageType
}

export interface ControllerEventMessage extends ClientMessage {
    type: "controllerEvent",
    data: AnyEventObject,
}

export interface ControllerSyncMessage extends ClientMessage {
    type: "controllerSync"
}

export interface JoinGameMessage extends ClientMessage {
    type: "joinGame",
    data: {
        name: string,     
    }
}

export interface HostMessage extends Message {
    type: hostMessageType
}

export interface ValidControllerMessage extends HostMessage {
    type: "validControllerEvent",
    data: AnyEventObject,
}

export interface ControllerResetMessage extends HostMessage {
    type: "controllerReset",
    data: Controller
}