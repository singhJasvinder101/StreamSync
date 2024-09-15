import React from 'react';
import { usePeerService } from './usePeerService';
import { useSocket } from '../contexts/SocketProvider';
import { Socket } from 'socket.io-client';

export const useMedia = () => {
    const { socket, remoteSocketId, setRemoteSocketId } = useSocket();
    const { sendStream, setRemoteStreams } = usePeerService(socket as Socket, remoteSocketId, setRemoteSocketId)
    const { mediaStream, setMediaStream } = useSocket()

    const startMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            });
            localStorage.setItem("isStreamOpen", "true");
            console.log("Media stream started:", stream);
            setMediaStream(stream);
            // setRemoteStreams(prev => ({ ...prev, [socket?.id as string]: stream }));
            return stream;
        } catch (err) {
            console.error("Media stream not working:", err);
            throw new Error("Media stream not working");
        }
    };

    const stopMediaStream = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            setMediaStream(null);
            console.log("Media stream stopped.");
        } else {
            console.log("No media stream to stop.");
        }
    };

    const onClickStartMedia = async () => {
        try {
            if (mediaStream) {
                stopMediaStream();
                return;
            }
            else await startMedia();
        } catch (error) {
            console.error("Error starting media:", error);
        }
    };

    return {
        startMedia,
        stopMediaStream,
        onClickStartMedia
    };
};
