import {login_or_register} from "./login_register";
import {Client} from "./opaque-client";
import {BASE_API_URL} from "./env";


async function main() {
  const userNumber = 11321111;
  const username = `user_${userNumber}`;
  const email = `${userNumber}@a.a`;
  const password = '1234';
  
  const fileName = "hello.txt";
  
  const client = await login_or_register(username, email, password)
  
  await client.importKeys()
  
  await uploadEncryptedFile(client, fileName, "one")
  await uploadEncryptedFile(client, fileName + 1, "two")
  await downloadEncryptedFile(client, fileName)
  await deleteFile(client, fileName)
  await listFiles(client)
}

const uploadEncryptedFile = async (client: Client, fileName: string, data: string) => {
  console.log("Upload file")
  const body = new TextEncoder().encode(data);
  const encrypted = await client.encryptData(body);
  
  const formData = new FormData();
  formData.append('file', new Blob([encrypted]), fileName);
  
  const res = await fetch(`${BASE_API_URL}/api/locker/${fileName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${client.token}`,
    },
    body: formData
  });
  
  console.log(JSON.stringify(await res.json(), null, 2));
}

const downloadEncryptedFile = async (client: Client, fileName: string) => {
  console.log("Download file")
  const res = await fetch(`${BASE_API_URL}/api/locker/${fileName}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${client.token}`,
    }
  });
  
  const data = await res.arrayBuffer();
  const bytes = new Uint8Array(data);
  const decrypted = await client.decryptData(bytes);
  
  console.log(Array.from(decrypted));
  console.log(new TextDecoder().decode(decrypted));
}

const deleteFile = async (client: Client, fileName: string) => {
  console.log("Delete file")
  const res = await fetch(`${BASE_API_URL}/api/locker/${fileName}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${client.token}`,
    }
  });
  
  console.log(JSON.stringify(await res.json(), null, 2));
}

const listFiles = async (client: Client) => {
  console.log("List files")
  const res = await fetch(`${BASE_API_URL}/api/locker`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${client.token}`,
    }
  });
  
  console.log(JSON.stringify(await res.json(), null, 2));
}


main().catch(console.error);