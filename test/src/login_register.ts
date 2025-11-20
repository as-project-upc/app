import {Client} from "./opaque-client";

export const login_or_register = async (username: string, email: string, password: string, role: "admin" | "user" | "doctor" = "admin") => {
  const client = new Client('http://localhost:3000');
  
  try {
    console.log("register")
    const registerResponse = await client.register(
      username,
      email,
      password,
      role
    );
    console.log(JSON.stringify(registerResponse, null, 2));
  } catch (e) {
  }
  
  
  {
    console.log("login")
    const res = await client.login(username, password);
    console.log(JSON.stringify(res, null, 2));
  }
  
  
  return client
}