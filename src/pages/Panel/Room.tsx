import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { usePeerService } from '../../hooks/usePeerService';
import { Socket } from 'socket.io-client';
import { useSocket } from '../../contexts/SocketProvider';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import Share2 from '../../components/Share';
import { Send } from '../../components/Send';

interface RoomProps {
    stream: MediaStream | null;
    stopMediaStream: () => void;
    onClickStartMedia: () => void;
}

const Room: React.FC<RoomProps> = ({ stream, stopMediaStream, onClickStartMedia }) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState<string | null>("")

    const { socket, remoteSocketId, setRemoteSocketId, remoteStream, currentUser } = useSocket();

    const {
        remoteUser,
        isDisabled,
        buttonMessage,
        handleCallUser,
        handleFileChange,
        handleSendFile,
        downloadLink,
    } = usePeerService(socket as Socket, remoteSocketId, setRemoteSocketId);

    const peers = [
        { id: 1, name: 'Alice', stream: '../../assets/img/placeholder.svg' },
        { id: 2, name: 'Bob', stream: '../../assets/img/placeholder.svg' },
        { id: 3, name: 'Charlie', stream: '../../assets/img/placeholder.svg' },
        { id: 4, name: 'David', stream: '../../assets/img/placeholder.svg' },
    ]

    const handleRefClick = () => {
        if (fileRef.current) {
            fileRef.current.click();
        }
    };
    console.log(remoteUser)

    return (
        <div className="text-white">

            <div className=" text-white flex justify-between">
                <Button onClick={onClickStartMedia}>{stream ? 'Stop' : 'Start'} Camera</Button>
                {remoteSocketId && (
                    <Button
                        disabled={isDisabled}
                        className={`btn text-white ${isDisabled ? 'disabled:cursor-not-allowed' : ''}`}
                        onClick={handleCallUser}
                    >
                        {buttonMessage}
                    </Button>
                )}
            </div>
            {/* <h4 >{remoteSocketId ? "Connected" : "No one in room"}</h4> */}
            <input className='hidden' ref={fileRef} type="file" onChange={handleFileChange} />

            <div className="min-h-screen bg-gray-900 flex flex-col">
                <div className="grid xs:gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-4">
                    <div className="relative my-1 h-[10rem] w-[10rem] xs:h-auto xs:w-auto ">
                        {stream && <ReactPlayer
                            url={stream}
                            playing
                            height={200}
                            width={200}
                            alt={`${currentUser}'s stream`}
                            className="w-full h-auto rounded-lg shadow-lg"
                        />}
                        <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                            {currentUser}
                        </span>
                    </div>
                    <div className="relative my-1 h-[10rem] w-[10rem] xs:h-auto xs:w-auto ">
                        {remoteStream && <ReactPlayer
                            url={remoteStream}
                            playing
                            height={200}
                            width={200}
                            alt={`${remoteUser}'s stream`}
                            className="w-full h-auto rounded-lg shadow-lg"
                        />}
                        <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                            {remoteUser}
                        </span>
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex space-x-2">
                        <Input
                            type="text"
                            placeholder="Type your message..."
                            value={message as string}
                            onChange={(e: any) => setMessage(e.target.value)}
                            className="flex-1 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                        />
                        <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-2 transition-all duration-300 transform hover:scale-105">
                            <Send className="h-5 w-5" />
                        </Button>
                        <Button onClick={handleRefClick} className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-2 transition-all duration-300 transform hover:scale-105">
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
            {/* <button className='btn' onClick={handleSendFile}>Send File</button> */}

            {/* {downloadLink && (
                <a className='btn' href={downloadLink} download="file">
                    Download File
                </a>
            )} */}
        </div>
    );
};

export default Room;

