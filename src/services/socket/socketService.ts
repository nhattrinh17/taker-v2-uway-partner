import { io, Socket } from 'socket.io-client';
import { appStore } from '../../states/app';
import { SOCKET_URL } from '../APIConfig';

class SocketService {
  private setCheckSocket: (val: boolean) => void = () => {};

  private static instance: SocketService | null = null;
  private socket: Socket | undefined;

  private constructor(private token: string) {
    try {
      const { setCheckSocket } = appStore.getState();
      if (setCheckSocket) {
        this.setCheckSocket = setCheckSocket;
      }
      this.socket = io(SOCKET_URL, {
        auth: {
          token: this.token,
        },
        transports: ['websocket'],
        forceNew: true,
        reconnection: true,
        timeout: 60000,
      });

      this.socket.on('connect', () => {
        console.log('🚀 ~ SocketService ~ Socket connected with ID:', this.socket?.id);
      });

      this.socket.on('disconnect', reason => {
        console.log('🚀 ~ SocketService ~ Socket disconnected, reason:', reason);
      });

      this.socket.on('connect_error', error => {
        console.log('🚀 ~ SocketService ~ Socket connection error:', error);
        setCheckSocket(false);
      });
    } catch (error) {
      console.error('🚀 ~ SocketService ~ Error initializing socket:', error);
    }
  }

  public static getInstance(token?: string): SocketService {
    if (!SocketService.instance?.token) {
      console.log('🚀 ~ SocketService ~ getInstance ~ SocketService.instance:', SocketService.instance);
      SocketService.instance = new SocketService(token ?? '');
      console.log('🚀 ~Mowr keets noois');
    }
    return SocketService.instance;
  }

  public on(event: string, callback: (response: any) => void): void {
    if (!this.socket) {
      console.log('Socket is not initialized. Call getInstance() first.');
      return;
    }
    console.log('On event ==>', event);

    this.socket.on(event, (data: any) => {
      console.log('Receive Data socket ==>', { data, event });
      callback(data);
    });
  }
  public emit(event: string, args: any): void {
    if (!this.socket) {
      console.log('Socket is not initialized. Call getInstance() first.');
      return;
    }
    console.log('Emit event ==>', event);
    this.socket.emit(event, args);
  }

  public off(event: string): void {
    if (!this.socket) {
      console.log('Socket is not initialized. Call getInstance() first.');
      return;
    }
    console.log('Off event ==>', event);
    this.socket.off(event);
  }

  public offAny(): void {
    if (!this.socket) {
      console.log('Socket is not initialized. Call getInstance() first.');
      return;
    }
    this.socket.offAny();
  }

  public offAnyOutgoing(): void {
    if (!this.socket) {
      console.log('Socket is not initialized. Call getInstance() first.');
      return;
    }
    this.socket.offAnyOutgoing();
  }

  public once(event: string, callback: (response: any) => void): void {
    if (!this.socket) {
      console.log('Socket is not initialized. Call getInstance() first.');
      return;
    }

    this.socket.once(event, (data: any) => {
      console.log('Receive Data socket ==>', { data, event });
      callback(data);
    });
  }

  public isConnect() {
    return this.socket?.active;
  }

  public static resetInstance() {
    if (SocketService.instance && SocketService.instance.socket) {
      SocketService.instance.socket.disconnect();
    }
    SocketService.instance = null;
  }
}

export default SocketService;
