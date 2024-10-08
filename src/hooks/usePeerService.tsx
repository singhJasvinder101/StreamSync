
import { useCallback, useEffect, useRef, useState } from 'react';
import peer from '../services/Peer';
import { Socket } from 'socket.io-client';
import { useSocket } from '../contexts/SocketProvider';

type FileMetadata = {
  name: string;
  size: number;
  type: string;
};

interface roomUsersTypes {
  nameId: string;
  socketId: string;
}

interface MessageObject {
  [key: string]: string;
}
interface mediaStreamsObject {
  [key: string]: MediaStream;
}
interface UserMessageObject {
  from: string;
  message: string;
}


export const usePeerService = (socket: Socket, remoteSocketId: string | null, setRemoteSocketId: (data: string) => void) => {
  const [remoteUser, setRemoteUser] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [buttonMessage, setButtonMessage] = useState<MessageObject>({});
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [receivedChunks, setReceivedChunks] = useState<{ metadata: FileMetadata | null; chunks: ArrayBuffer[] } | null>(null);
  const [roomUsers, setRoomUsers] = useState<roomUsersTypes[]>([])
  const [remoteStreams, setRemoteStreams] = useState<mediaStreamsObject>({})
  const [message, setMessage] = useState<string | null>("")
  const [roomMessages, setRoomMessages] = useState<UserMessageObject[]>([])

  const { mediaStream } = useSocket();

  const chunkSize = 16 * 1024; // 16 KB chunks


  const handleRoomJoined = (data: any) => {
    // console.log(`NameId ${data.nameId} joined room`);
    setRemoteSocketId(data.id);
    setRemoteUser(data.nameId);
  };

  useEffect(() => {
    socket.on('room:users', (data) => {
      setRoomUsers(data.users);

      console.log(data.users)

      // for newly added users setting button message
      const newMessages: MessageObject = {};
      data.users?.forEach((usr: any) => {
        newMessages[usr.socketId] = `Call ${usr.nameId}`;
      });

      setButtonMessage(prevMessages => ({
        ...prevMessages,
        ...newMessages
      }));
    })
  }, [socket])

  useEffect(() => {
    console.log(roomUsers)
  }, [roomUsers])

  const handleCallUser = useCallback(async (remoteSocketId: string) => {
    const offer = await peer.getOffer();
    socket?.emit("user:call", { to: remoteSocketId, offer });
    // setButtonMessage("Call Sent!! Yupp");

    console.log(remoteSocketId)
    setButtonMessage(prevMessages => ({
      ...prevMessages,
      [remoteSocketId]: "Call Sent!! Yupp"
    }));

    setIsDisabled(true);
  }, [remoteSocketId, socket]);

  useEffect(() => {
    // todo: done later to use peer.remotesocketid
    peer.remoteSocketId = remoteSocketId;
  }, [remoteSocketId]);

  const handleIncomingCall = useCallback(async (data: any) => {
    const { from, offer, nameId } = data;
    setRemoteSocketId(from);
    const ans = await peer.getAnswer(offer);
    setRemoteUser(nameId);
    setButtonMessage(prevMessages => ({
      ...prevMessages,
      [from]: "Accept Call!!"
    }));
    // jisse call aayi usse bhej do
    socket?.emit("call:accepted", { to: from, ans });
  }, [socket]);

  const handleCallAccepted = useCallback(
    (data: any) => {
      const { from, ans } = data;
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStream();
      setIsDisabled(true);
    },
    []
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket?.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    // @ts-ignore
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      // @ts-ignore
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async (data: any) => {
      const { from, offer } = data;
      const ans = await peer.getAnswer(offer);
      socket?.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async (data: any) => {
    const { ans } = data;
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    console.log(peer.fileChannel);
  }, [peer.fileChannel]);



  type FileMetadata = {
    name: string;
    size: number;
    type: string;
  };

  const handleSendFile = async (file: File) => {
    if (file && peer.fileChannel) {

      // Reading the entire file as an ArrayBuffer
      const arrayBuffer: ArrayBuffer = await readFileAsArrayBuffer(file);
      const metadata: FileMetadata = {
        name: `${file.name}`,
        size: file.size,
        type: file.type,
      };

      if (peer.fileChannel.readyState === 'open') {
        peer.fileChannel.send(JSON.stringify(metadata));

        for (let offset = 0; offset < arrayBuffer.byteLength; offset += chunkSize) {
          const chunk = arrayBuffer.slice(offset, offset + chunkSize);
          peer.fileChannel.send(chunk);
        }
      } else {
        console.log('RTCDataChannel not in open state');
      }
    } else {
      return;
    }
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target && e.target.result && e.target.result instanceof ArrayBuffer) {
          resolve(e.target.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer.'));
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const handleReceiveFile = useCallback((data: any) => {
    if (typeof data === 'string') {
      const metadata = JSON.parse(data);
      setReceivedChunks((prevChunks) => prevChunks ? { ...prevChunks, metadata } : { metadata, chunks: [] });
    } else if (data instanceof ArrayBuffer) {
      setReceivedChunks((prevChunks) => prevChunks ? { ...prevChunks, chunks: [...prevChunks.chunks, data] } : { metadata: null, chunks: [data] });
    }
  }, []);

  useEffect(() => {
    if (receivedChunks && receivedChunks.metadata && receivedChunks.chunks.length === Math.ceil(receivedChunks.metadata.size / chunkSize)) {
      const fileData = new Blob(receivedChunks.chunks, {
        type: receivedChunks.metadata.type,
      });
      const downloadLink = URL.createObjectURL(fileData);
      console.log(receivedChunks.metadata);
      console.log(downloadLink);
      setDownloadLink(downloadLink);
    }
  }, [receivedChunks]);

  useEffect(() => {
    if (peer.peer) {
      peer.peer.ondatachannel = (e: any) => {
        //@ts-ignore
        peer.remoteDataChanel = e.channel;
        //@ts-ignore
        peer.remoteDataChanel.onmessage = (e) => {
          let data = e.data;
          handleReceiveFile(data);
        };
      };
    }

    return () => {
      peer.fileChannel?.removeEventListener('message', handleReceiveFile);
    };
  }, [peer.fileChannel, peer]);


  const sendStream = () => {
    mediaStream?.getTracks().forEach((track) =>
      peer.peer?.addTrack(track, mediaStream)
    );
  }

  const { setRemoteStream } = useSocket();

  const handleStreamTrackEvent = useCallback((event: RTCTrackEvent) => {
    const streams = event.streams;
    const remoteStream = streams[0];
    console.log('Receiving remote stream:', streams[0]);
    setRemoteStreams((prevStreams) => ({
      ...prevStreams,
      [peer.remoteSocketId!]: remoteStream,
    }));
  }, [socket, peer.peer]);


  useEffect(() => {
    peer.peer?.addEventListener('track', handleStreamTrackEvent);

    return () => {
      peer.peer?.removeEventListener('track', handleStreamTrackEvent);
    };
  }, [peer.peer, handleStreamTrackEvent]);

  const handleSendMessage = (message: string, room: string, from: string) => {
    socket.emit('user:message', { message, room, from });
  }

  useEffect(() => {
    socket.on('room:message', (data) => {
      console.log('Message received:', data);
      setRoomMessages(prevMessages => [...prevMessages, { from: data.from, message: data.message }]);
    });

    return () => {
      socket.off('room:message');
    };
  }, [socket]);


  useEffect(() => {
    socket?.on('user:joined', handleRoomJoined);
    socket?.on("incoming:call", handleIncomingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:nego:needed", handleNegoNeedIncomming);
    socket?.on("peer:nego:final", handleNegoNeedFinal);
    return () => {
      socket?.off("user:joined", handleRoomJoined);
      socket?.off("incoming:call", handleIncomingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("peer:nego:needed", handleNegoNeedIncomming);
      socket?.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleRoomJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);


  return {
    remoteUser,
    isDisabled,
    buttonMessage,
    handleCallUser,
    handleSendFile,
    downloadLink,
    sendStream,
    roomUsers,
    remoteStreams,
    setRemoteStreams,
    setDownloadLink,
    setReceivedChunks,
    receivedChunks,
    handleSendMessage,
    setMessage,
    message,
    roomMessages,
    setRoomMessages
  };
};

