import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './Panel.css';
import Room from './Room';
import { io, Socket } from 'socket.io-client';
import { useMedia } from '../../hooks/useMedia';
import { useSocket } from '../../contexts/SocketProvider';
import { usePeerService } from '../../hooks/usePeerService';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

const Panel = () => {
  const [currentPage, setCurrentPage] = useState('');
  const [nameId, setNameId] = useState("");
  const { socket, remoteSocketId, room, setRoom, setRemoteSocketId, setCurrentUserSocketId, setCurrentUser } = useSocket()

  const handleSubmit = useCallback((e: any) => {
    e.preventDefault();

    if (!nameId || !room) return;
    console.log("Joining room...");
    setCurrentUser(nameId);
    socket?.emit('room:join', { nameId, room });
    setCurrentPage('room');
    setRoom(room);
    setCurrentUserSocketId(socket?.id as string);
  }, [socket, nameId, room]);


  const { startMedia, stopMediaStream, onClickStartMedia } = useMedia();
  const { sendStream } = usePeerService(socket as Socket, remoteSocketId, setRemoteSocketId)
  const { mediaStream } = useSocket();

  useEffect(() => {
    const streamIsOpen = localStorage.getItem("isStreamOpen") === "true";
    if (streamIsOpen) {
      startMedia();
    }
  }, [])

  // Send message to background script for permissions
  useEffect(() => {
    chrome.runtime.sendMessage({ action: "startStream" }, (response) => {
      console.log("Message sent to background:", response);
    });
  }, []);


  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 space-y-8">
      {currentPage === 'room' ? <Room
        stream={mediaStream}
        stopMediaStream={stopMediaStream}
        onClickStartMedia={onClickStartMedia}
        /> :
        <>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
            StreamSync
          </h1>
          <p className="text-gray-400 text-xl">Watch together. Anytime. Anywhere.</p>
          <div className="w-full max-w-md space-y-4">
            <Input
              type="text"
              placeholder="Enter your username"
              value={nameId}
              onChange={(e) => setNameId(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 transition-all duration-300"
            />
            <Input
              type="text"
              placeholder="Enter room code"
              value={room!}
              onChange={(e) => setRoom(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 transition-all duration-300"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
            <Button style={{paddingRight: 62, paddingLeft: 62}} onClick={handleSubmit} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-12 rounded-full transition-all duration-300 transform hover:scale-105">
              Join
            </Button>
          </div>
        </>
      }
    </div >
  );
};

export default Panel;