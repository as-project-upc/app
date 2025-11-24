import {BASE_WS_URL} from "./env";

enum Actions {
  SendMessage = "SendMessage",
  ReceiveMessage = "ReceiveMessage",
  SubscribeUser = "SubscribeUser",
  UnsubscribeUser = "UnsubscribeUser",
}

type Payload = {
  action: Actions;
  data?: ReceiveMessage | any;
  token: string;
};


type ReceiveMessage = {
  fromUserId: string;
  message: string;
  timestamp: Date;
}

export class ChatService {
  private ws: WebSocket;
  private readonly token: string;
  private messageCallbacks: Map<string, (message: ReceiveMessage) => void>;
  
  
  constructor(token: string) {
    this.ws = new WebSocket(BASE_WS_URL);
    this.token = token;
    this.messageCallbacks = new Map();
    
  }
  
  sendMessage(userId: string, message: string) {
    this.sendPayload({
      action: Actions.SendMessage,
      data: {
        toUserId: userId,
        message
      }
    });
  }
  
  subscribe(callback: (message: ReceiveMessage) => void) {
    this.messageCallbacks.set(this.token, callback);
    this.sendPayload({
      action: Actions.SubscribeUser,
    });
  }
  
  unsubscribeFromUser() {
    this.messageCallbacks.delete(this.token);
    this.sendPayload({
      action: Actions.UnsubscribeUser,
    });
  }
  
  
  private sendPayload<T extends Actions>(data: { action: T; data?: Payload["data"] }) {
    this.ws.send(JSON.stringify({
      ...data,
      token: this.token
    } as Payload));
  }
  
  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);
        const payload: Payload = JSON.parse(event.data);
        if (payload.action === Actions.ReceiveMessage) {
          const callback = this.messageCallbacks.get(this.token);
          if (callback) {
            callback({
              ...payload.data,
              timestamp: new Date() // TODO server should send timestamp
            });
          }
        }
      }
      this.ws.onopen = () => {
        resolve();
      };
      this.ws.onerror = (err) => {
        reject(err);
      };
    });
  }
  
  close() {
    this.ws.close();
  }
}


