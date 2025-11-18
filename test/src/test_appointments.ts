import {login_or_register} from "./login_register";

(async () => {
  
  const user = await login_or_register("appointment_user", "1@1", "1234", "user");
  const doctor = await login_or_register("appointment_doctor", "1@2", "1234", "doctor");
  
})()