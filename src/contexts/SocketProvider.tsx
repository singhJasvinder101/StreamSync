"use client"

import React, { useState, useMemo, createContext, useContext, FC, ReactNode, SetStateAction, Dispatch } from "react";
import { Socket, io } from "socket.io-client";

// Define an interface for the context value to include socket, remoteSocketId, and setRemoteSocketId
interface SocketContextValue {
    socket: Socket | null;
    remoteSocketId: string | null;
    setRemoteSocketId: Dispatch<React.SetStateAction<string | null>>;
    remoteStream: MediaStream | null;
    setRemoteStream: Dispatch<React.SetStateAction<MediaStream | null>>;
    mediaStream: MediaStream | null;
    setMediaStream: Dispatch<React.SetStateAction<MediaStream | null>>;
    currentUser: string | null;
    setCurrentUser: Dispatch<SetStateAction<string>>;
}

// Create the Socket context with the appropriate type
const SocketContext = createContext<SocketContextValue | null>(null);

// SocketProvider component to provide socket and remoteSocketId to children components
export const SocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const socket = useMemo(() => io("http://localhost:8000"), []);
    const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
    const [currentUser, setCurrentUser] = useState('');

    // Pass socket, remoteSocketId, and setRemoteSocketId as an object to the provider
    return (
        <SocketContext.Provider value={{
            socket,
            remoteSocketId,
            setRemoteSocketId,
            remoteStream,
            setRemoteStream,
            mediaStream,
            setMediaStream,
            currentUser,
            setCurrentUser
        }}>
            {children}
        </SocketContext.Provider>
    );
}

// Custom hook to use the Socket context
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}
