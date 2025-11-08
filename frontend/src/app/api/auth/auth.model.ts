export class LoginStartRequest{
    username: string;
    credential_request: string;

    constructor(username: string, credential_request: string){
     this.username = username;
     this.credential_request = credential_request;
    }
}

export class RegistrationStartRequest{
  public username: string;
  public email: string;
  public registration_request: string;

  constructor(username: string, email: string, registration_request: string){
     this.username = username;
     this.email = email;
     this.registration_request = registration_request;
    }
}
