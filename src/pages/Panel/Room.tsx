import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player/lazy';
import { usePeerService } from '../../hooks/usePeerService';
import { Socket } from 'socket.io-client';
import { useSocket } from '../../contexts/SocketProvider';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import Share2 from '../../icons/Share';
import { Send } from '../../icons/Send';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Download, Users, X } from 'lucide-react';
import "./Panel.css"

interface RoomProps {
    stream: MediaStream | null;
    stopMediaStream: () => void;
    onClickStartMedia: () => void;
}

interface UserMessageObject {
    from: string;
    message: string;
}

const Room: React.FC<RoomProps> = ({ stream, stopMediaStream, onClickStartMedia }) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const chatRef = useRef<HTMLDivElement>(null);
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [isFileSending, setIsFileSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const {
        socket,
        remoteSocketId,
        setRemoteSocketId,
        remoteStream,
        currentUser,
        currentUserSocketId,
        room,
        setRoom
    } = useSocket();

    const {
        remoteUser,
        isDisabled,
        buttonMessage,
        handleCallUser,
        handleSendFile,
        downloadLink,
        setReceivedChunks,
        setDownloadLink,
        roomUsers,
        setRemoteStreams,
        receivedChunks,
        remoteStreams,
        setMessage,
        message,
        handleSendMessage,
        roomMessages
    } = usePeerService(socket as Socket, remoteSocketId, setRemoteSocketId);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            console.log(e.target.files[0]);
        }
    };

    const handleRefClick = () => {
        if (fileRef.current) {
            fileRef.current.click();
        }
    };

    const onClickSendMessage = () => {
        console.log('Sending message:', message);
        if (selectedFile && !message) {
            handleSendFileClick();
            return;
        }
        handleSendFileClick()
        handleSendMessage(message as string, room as string, currentUser!);
        setMessage('');
    };

    const handleSendFileClick = async () => {
        if (!selectedFile) return;
        setIsFileSending(true);
        await handleSendFile(selectedFile as File);
        setIsFileSending(false);
    };

    useEffect(() => {
        console.log('Room messages:', roomMessages);
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [roomMessages]);

    useEffect(() => {
        console.log("remote streams", remoteStreams);
    }, [remoteStreams]);

    return (
        <div className="h-screen text-white bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center mb-4"
            >
                <div className='flex gap-2'>
                    <Button
                        onClick={onClickStartMedia}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold p-2 rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                        {stream ? <CameraOff size={24} /> : <Camera size={24} />}
                    </Button>
                    <Button
                        onClick={() => setIsUserListOpen(!isUserListOpen)}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold p-2 rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                        {isUserListOpen ? <X size={24} /> : <Users size={24} />}
                    </Button>
                </div>

                <AnimatePresence>
                    {downloadLink && receivedChunks?.metadata && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="flex justify-center"
                        >
                            <a
                                href={downloadLink}
                                onClick={() => {
                                    setTimeout(() => {
                                        setReceivedChunks(null);
                                        setDownloadLink(null);
                                    }, 500);
                                }}
                                download={receivedChunks.metadata.name}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
                            >
                                <Download size={24} color='white'/>
                            </a>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {isUserListOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="fixed z-50 left-0 top-0 h-full w-64 bg-gray-800 p-4 overflow-x-hidden overflow-y-auto"
                    >
                        <h2 className="text-xl font-bold mb-4">Users</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {roomUsers.filter(usr => usr.socketId !== currentUserSocketId).map((user, idx) => (
                                <motion.div
                                    key={user.socketId}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`p-2 rounded-lg cursor-pointer ${selectedUser === user.socketId ? 'bg-purple-500' : 'bg-gray-700'}`}
                                    onClick={() => {
                                        setSelectedUser(user.socketId);
                                        handleCallUser(user.socketId);
                                    }}
                                >
                                    <img src={require("../../assets/img/placeholder.svg")} alt={user.nameId} className="w-full h-auto rounded-full mb-2" />
                                    <p className="text-center">
                                        {buttonMessage[user.socketId]}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                        {isUserListOpen && (
                            <Button
                                style={{
                                    position: 'absolute',
                                    top: "1rem",
                                    right: -12,
                                }}
                                onClick={() => setIsUserListOpen(!isUserListOpen)}
                            >
                                <X size={24} />
                            </Button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 overflow-y-auto">
                {stream && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative rounded-lg overflow-hidden shadow-lg"
                        style={{ aspectRatio: 4 / 3 }}
                    >
                        <ReactPlayer
                            url={stream}
                            playing
                            width="100%"
                            height="100%"
                            className="rounded-lg"
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                            {currentUser}
                        </div>
                    </motion.div>
                )}
                {Object.entries(remoteStreams).map(([usr, streamUrl], idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="relative rounded-lg overflow-hidden shadow-lg"
                        style={{ aspectRatio: 4 / 3 }}
                    >
                        <ReactPlayer
                            url={streamUrl}
                            playing
                            width="100%"
                            height="100%"
                            className="rounded-lg"
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                            {roomUsers.find((user) => user.socketId === usr)?.nameId || 'Unknown'}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div ref={chatRef} className="h-36 overflow-y-auto mb-4 bg-gray-800 rounded-lg p-2">
                {roomMessages.map((msg: UserMessageObject, idx: number) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="bg-gray-700 p-2 my-1 rounded-lg shadow-sm"
                    >
                        <p className="text-gray-300">
                            <span className="font-bold mr-1">
                                <span>{msg.from} :</span>
                            </span>
                            {msg.message}
                        </p>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 p-4 rounded-lg shadow-lg"
            >
                <div className="flex space-x-2">
                    <Input
                        type="text"
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === "Enter" && onClickSendMessage()}
                        value={message as string}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                        className="flex-1 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                    />
                    <Button
                        onClick={onClickSendMessage}
                        disabled={isFileSending}
                        className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-2 transition-all duration-300 transform hover:scale-105"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                    <Button
                        onClick={handleRefClick}
                        onKeyPress={(e) => e.key === "Enter" && onClickSendMessage()}
                        className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-2 transition-all duration-300 transform hover:scale-105"
                    >
                        <Share2 className="h-5 w-5" />
                    </Button>
                </div>
            </motion.div>

            <input className='hidden' ref={fileRef} type="file" onChange={(e) => handleFileChange(e)} />
        </div>
    );
};

export default Room;