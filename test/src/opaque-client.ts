import {client, ready} from "@serenity-kit/opaque";

export interface RegistrationStartRequest {
  username: string;
  email: string;
  registration_request: string;
}

export interface RegistrationStartResponse {
  registration_response: string;
}

export interface RegistrationFinishRequest {
  username: string;
  email: string;
  registration_record: string;
  role: 'user' | 'admin';
}

export interface LoginStartRequest {
  username: string;
  credential_request: string;
}

export interface LoginStartResponse {
  credential_response: string;
}

export interface LoginFinishRequest {
  username: string;
  credential_finalization: string;
}

export interface LoginResponse {
  token: string;
}

export class Client {
  baseUrl: string;
  initialized: Promise<void>;
  loginResult?: client.FinishLoginResult;
  secretKey?: CryptoKey
  sessionKey?: CryptoKey
  token?: string
  
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.initialized = ready;
  }
  
  async register(username: string, email: string, password: string, role: 'user' | 'admin'): Promise<LoginResponse> {
    await this.initialized;
    
    const {clientRegistrationState, registrationRequest} = client.startRegistration({password});
    
    const startResponse = await fetch(`${this.baseUrl}/api/register/start`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username,
        email,
        registration_request: registrationRequest,
      } as RegistrationStartRequest),
    });
    
    if (!startResponse.ok) {
      throw new Error(await startResponse.text());
    }
    
    const startData: RegistrationStartResponse = await startResponse.json();
    
    const {registrationRecord} = client.finishRegistration({
      clientRegistrationState,
      registrationResponse: startData.registration_response,
      password,
    });
    
    const finishResponse = await fetch(`${this.baseUrl}/api/register/finish`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username,
        email,
        registration_record: registrationRecord,
        role,
      } as RegistrationFinishRequest),
    });
    
    if (!finishResponse.ok) {
      throw new Error(await finishResponse.text());
    }
    
    return await finishResponse.json();
  }
  
  async login(username: string, password: string): Promise<LoginResponse> {
    await this.initialized;
    
    const {clientLoginState, startLoginRequest} = client.startLogin({password});
    
    const startResponse = await fetch(`${this.baseUrl}/api/login/start`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username,
        credential_request: startLoginRequest,
      } as LoginStartRequest),
    });
    
    if (!startResponse.ok) {
      throw new Error(await startResponse.text());
    }
    
    const startData: LoginStartResponse = await startResponse.json();
    
    const finishResult = client.finishLogin({
      clientLoginState,
      loginResponse: startData.credential_response,
      password,
    });
    
    if (!finishResult) {
      throw new Error("Login failed: client.finishLogin returned null. ");
    }
    
    this.loginResult = finishResult;
    
    const finishResponse = await fetch(`${this.baseUrl}/api/login/finish`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username,
        credential_finalization: finishResult.finishLoginRequest,
      } as LoginFinishRequest),
    });
    
    if (!finishResponse.ok) {
      throw new Error(await finishResponse.text());
    }
    
    const res = await finishResponse.json();
    this.token = res.token;
    return res
  }
  
  
  private async importKey(keyBase64: string) {
    let base64 = keyBase64.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    
    const keyData = Uint8Array.from(base64, c => c.charCodeAt(0));
    const key = keyData.slice(0, 32);
    return await crypto.subtle.importKey(
      "raw",
      key,
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
  }
  
  async encryptData(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
    if (!this.secretKey) {
      throw new Error("No secret key");
    }
    
    return await Client.encrypt(this.secretKey, data);
  }
  
  async decryptData(data: Uint8Array): Promise<Uint8Array<ArrayBuffer>> {
    if (!this.secretKey) {
      throw new Error("No secret key");
    }
    
    return await Client.decrypt(this.secretKey, data);
  }
  
  private static getHeader(): Uint8Array {
    return new Uint8Array([0x45, 0x4E, 0x43, 0x52]); // "ENCR" in ASCII
  }
  
  private static verifyHeader(data: Uint8Array): void {
    const header = Client.getHeader();
    const dataHeader = data.slice(0, header.length);
    
    if (dataHeader.length !== header.length || !dataHeader.every((b, i) => b === header[i])) {
      throw new Error("missing header");
    }
  }
  
  static async encrypt(key: CryptoKey, data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
    const header = Client.getHeader();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      data
    );
    
    // 4 bytes header || 12 bytes IV || encrypted data
    const result = new Uint8Array(header.length + iv.length + encrypted.byteLength);
    result.set(header, 0);
    result.set(iv, header.length);
    result.set(new Uint8Array(encrypted), header.length + iv.length);
    return result;
  }
  
  static async decrypt(key: CryptoKey, data: Uint8Array): Promise<Uint8Array<ArrayBuffer>> {
    Client.verifyHeader(data);
    
    const header = Client.getHeader().length;
    const iv = data.slice(header, header + 12); // 12 bytes after header
    const encrypted = data.slice(header + 12); // everything after header + IV
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encrypted
    );
    
    return new Uint8Array(decrypted);
  }
  
  async importKeys() {
    if (!this.loginResult?.exportKey) {
      throw new Error("No exported key");
    }
    
    if (!this.loginResult?.sessionKey) {
      throw new Error("No session key");
    }
    
    this.secretKey = await this.importKey(this.loginResult.exportKey);
    this.sessionKey = await this.importKey(this.loginResult.sessionKey);
  }
  
}
