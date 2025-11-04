import {Client} from './opaque-client';

async function main() {
  const client = new Client('http://localhost:3000');
  
  const userNumber = 11321111;
  const username = `user_${userNumber}`;
  const email = `${userNumber}@a.a`;
  const password = '1234';
  
  try {
    console.log("register")
    const registerResponse = await client.register(
      username,
      email,
      password,
      'admin'
    );
    console.log(JSON.stringify(registerResponse, null, 2));
  } catch (e) {
    console.log(e)
  }
  
  let token
  
  {
    console.log("login")
    const res = await client.login(username, password);
    console.log(JSON.stringify(res, null, 2));
    token = res.token;
  }
  
  {
    console.log("me endpoint")
    
    const res = await fetch("http://localhost:3000/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    const resJson = await res.json();
    
    console.log(JSON.stringify(resJson, null, 2));
  }
  
  
  {
    console.log("admin endpoint")
    
    const res = await fetch("http://localhost:3000/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    const res2Json = await res.json();
    
    console.log(JSON.stringify(res2Json, null, 2));
  }
  {
    console.log("user endpoint")
    const res = await fetch("http://localhost:3000/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    const res2Json = await res.json();
    
    console.log(JSON.stringify(res2Json, null, 2));
  }
  
  {
    console.log("upload")
    const body = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64]); // "Hello World" in bytes
    
    const res = await fetch("http://localhost:3000/locker", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
      },
      body: body
    });
    const uploadResult = await res.json();
    
    console.log(JSON.stringify(uploadResult, null, 2));
  }
  {
    console.log("download")
    const res = await fetch("http://localhost:3000/locker", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    const data = await res.arrayBuffer();
    const bytes = new Uint8Array(data);
    
    console.log(Array.from(bytes));
    console.log(new TextDecoder().decode(bytes));
  }
  
  console.log('OK!!')
}

main().catch(console.error);