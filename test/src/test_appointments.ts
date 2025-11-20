import {login_or_register} from "./login_register";

(async () => {
  
  const user = await login_or_register("appointment_user", "1@1", "1234", "user");
  const doctor = await login_or_register("appointment_doctor", "1@2", "1234", "doctor");
  
  let doctor_id = "";
  {
    console.log("add appointment endpoint")
    
    const res = await fetch("http://localhost:3000/api/doctors", {
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      },
    })
    const resJson = await res.json();
    doctor_id = resJson[0].id;
    console.log(JSON.stringify(resJson, null, 2));
  }
  
  {
    console.log("add appointment endpoint")
    
    const res = await fetch("http://localhost:3000/api/appointment", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctor_id: doctor_id,
        date: new Date().toISOString(),
      })
    })
    const resJson = await res.json();
    
    console.log(JSON.stringify(resJson, null, 2));
  }
  
  let appointment_id = "";
  {
    console.log("list appointment endpoint")
    
    const res = await fetch("http://localhost:3000/api/appointment", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      }
    })
    const resJson = await res.json();
    appointment_id = resJson[0].appointment_id;
    console.log(JSON.stringify(resJson, null, 2));
  }
  
  {
    console.log("GET appointment detail endpoint")
    
    const res = await fetch(`http://localhost:3000/api/appointment/${appointment_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${user.token}`,
      }
    })
    const resJson = await res.json();
    
    console.log(JSON.stringify(resJson, null, 2));
  }
  
  {
    console.log("delete appointment endpoint")
    
    const res = await fetch(`http://localhost:3000/api/appointment/${appointment_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.token}`,
      }
    })
    const resJson = await res.json();
    
    console.log(JSON.stringify(resJson, null, 2));
  }
  
  
  {
    console.log("GET appointment detail endpoint")
    
    const res = await fetch(`http://localhost:3000/api/appointment/${appointment_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${user.token}`,
      }
    })
    const resJson = await res.json();
    
    console.log(JSON.stringify(resJson, null, 2));
  }
  
  {
    console.log("delete appointment endpoint")
    
    const res = await fetch(`http://localhost:3000/api/appointment/${appointment_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.token}`,
      }
    })
    const resJson = await res.json();
    
    console.log(JSON.stringify(resJson, null, 2));
  }
  
})()