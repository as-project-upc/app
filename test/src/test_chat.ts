import {ChatService} from "./chat.service";
import {login_or_register} from "./login_register";
import {BASE_API_URL} from "./env";


const listDoctors = async (client: any) => {
  console.log("add appointment endpoint")
  
  const res = await fetch(`${BASE_API_URL}/api/doctors`, {
    headers: {
      Authorization: `Bearer ${client.token}`,
      'Content-Type': 'application/json',
    },
  })
  const resJson = await res.json();
  console.log(JSON.stringify(resJson, null, 2));
  return resJson;
}


(async () => {
  const userClient = await login_or_register("aaaaa", "a@aaa", "123", "user");
  const doctorClient = await login_or_register("bbbbb", "a@acc", "123", "doctor");
  
  const doctors = await listDoctors(userClient);
  const doctorId = doctors.find((e: any) => e.username === "bbbbb").id;
  
  const userChat = new ChatService(userClient.token!)
  const doctorChat = new ChatService(doctorClient.token!)
  
  await userChat.init();
  await doctorChat.init();
  
  doctorChat.subscribe(e => console.log("doctor received", e))
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  userChat.sendMessage(doctorId, 'hello from user')
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  userChat.close()
  doctorChat.close()
})()