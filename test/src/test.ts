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
    
    const res = await fetch("http://localhost:3000/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    const resJson = await res.json();
    
    console.log(JSON.stringify(resJson, null, 2));
  }
  
  
  {
    console.log("admin endpoint")
    
    const res = await fetch("http://localhost:3000/api/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    const res2Json = await res.json();
    
    console.log(JSON.stringify(res2Json, null, 2));
  }
  {
    console.log("user endpoint")
    const res = await fetch("http://localhost:3000/api/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    const res2Json = await res.json();
    
    console.log(JSON.stringify(res2Json, null, 2));
  }
  
  console.log('OK!!')
}

main().catch(console.error);