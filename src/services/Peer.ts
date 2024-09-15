class PeerService {
    public peer: RTCPeerConnection | null = null;
    public fileChannel: RTCDataChannel | undefined;
    public remoteSocketId: string | null = null;

    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: "stun:stun4.l.google.com:19302",
                    },
                ],
            });
            this.fileChannel = this.peer.createDataChannel(
                `file-transfer-${Date.now()}`
            );
        }
    }

    async getAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
        if (this.peer) {
            console.log(offer);
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;
        }
        throw new Error("Peer connection not initialized");
    }

    async setLocalDescription(ans: RTCSessionDescriptionInit): Promise<void> {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        } else {
            throw new Error("Peer connection not initialized");
        }
    }

    async getOffer(): Promise<RTCSessionDescriptionInit> {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
        throw new Error("Peer connection not initialized");
    }
}

export default new PeerService();

