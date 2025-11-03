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
  success: boolean;
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  token: string;
}

export class Client {
  baseUrl: string;
  initialized: Promise<void>;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.initialized = ready;
  }
  
  async register(username: string, email: string, password: string, role: 'user' | 'admin'): Promise<LoginResponse> {
    await this.initialized;
    
    const {clientRegistrationState, registrationRequest} = client.startRegistration({password});
    
    const startResponse = await fetch(`${this.baseUrl}/register/start`, {
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
    
    const finishResponse = await fetch(`${this.baseUrl}/register/finish`, {
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
    
    const startResponse = await fetch(`${this.baseUrl}/login/start`, {
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
      throw new Error("Login failed: client.finishLogin returned null. This can happen if the server was restarted between login/start and login/finish, or if the password is incorrect.");
    }
    
    const finishResponse = await fetch(`${this.baseUrl}/login/finish`, {
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
    
    return await finishResponse.json();
  }
}
