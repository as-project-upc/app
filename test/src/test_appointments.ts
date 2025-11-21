import {login_or_register} from "./login_register";


const listDoctors = async (client: any) => {
  console.log("add appointment endpoint")
  
  const res = await fetch("http://localhost:3000/api/doctors", {
    headers: {
      Authorization: `Bearer ${client.token}`,
      'Content-Type': 'application/json',
    },
  })
  const resJson = await res.json();
  console.log(JSON.stringify(resJson, null, 2));
  return resJson;
}

const addAppointment = async (client: any, doctor_id: string, datetime: string) => {
  console.log("add appointment endpoint")
  
  const res = await fetch("http://localhost:3000/api/appointment", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${client.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      doctor_id: doctor_id,
      date: new Date().toISOString(),
    })
  })
  const resJson = await res.json();
  
  console.log(JSON.stringify(resJson, null, 2));
  return resJson;
}


const getAppointmentDetail = async (client: any, appointment_id: string) => {
  console.log("GET appointment detail endpoint")
  
  const res = await fetch(`http://localhost:3000/api/appointment/${appointment_id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${client.token}`,
    }
  })
  const resJson = await res.json();
  
  console.log(JSON.stringify(resJson, null, 2));
  return resJson;
}

const deleteAppointment = async (client: any, appointment_id: string) => {
  console.log("delete appointment endpoint")
  
  const res = await fetch(`http://localhost:3000/api/appointment/${appointment_id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${client.token}`,
    }
  })
  
  const resJson = await res.json();
  
  console.log(JSON.stringify(resJson, null, 2));
}

const listAppointments = async (client: any) => {
  console.log("list appointment endpoint")
  
  const res = await fetch("http://localhost:3000/api/appointment", {
    headers: {
      Authorization: `Bearer ${client.token}`,
    }
  })
  const resJson = await res.json();
  console.log(JSON.stringify(resJson, null, 2));
  
  return resJson;
}

(async () => {
  
  const user = await login_or_register("appointment_user", "1@1", "1234", "user");
  const doctor = await login_or_register("appointment_doctor", "1@2", "1234", "doctor");
  
  const doctor_id = (await listDoctors(user))[0].id;
  
  const appointment = await addAppointment(user, doctor_id, new Date().toISOString());

  await listDoctors(user)
  
  const appointment_id = appointment.appointment_id;
  
  await listAppointments(user);
  await getAppointmentDetail(user, appointment_id);
  await deleteAppointment(user, appointment_id);
  await listAppointments(user);
})()
