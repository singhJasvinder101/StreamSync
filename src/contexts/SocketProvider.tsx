"use client"

import React, { useState, useMemo, createContext, useContext, FC, ReactNode, SetStateAction, Dispatch } from "react";
import { Socket, io } from "socket.io-client";

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
    currentUserSocketId: string | null;
    setCurrentUserSocketId: Dispatch<SetStateAction<string>>;
    room: string | null;
    setRoom: Dispatch<SetStateAction<string>>;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // const socket = useMemo(() => io("http://localhost:8000"), []);

    // production
    const socket = useMemo(() => io("http://ec2-13-60-225-135.eu-north-1.compute.amazonaws.com"), []);
    const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
    const [currentUser, setCurrentUser] = useState('');
    const [currentUserSocketId, setCurrentUserSocketId] = useState('')
    const [room, setRoom] = useState("")

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
            setCurrentUser,
            currentUserSocketId,
            setCurrentUserSocketId,
            room,
            setRoom
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}
