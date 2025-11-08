import { environment } from "../../../environments/environment.development";

const AUTH_BASE = `${environment.apiBaseUrl}`;  // "http://localhost:3000/"

export const AuthEndpoints = {
  loginStart: `${AUTH_BASE}/login/start`,
  loginFinish: `${AUTH_BASE}/login/finish`,
  registerStart: `${AUTH_BASE}/register/start`,
  registerFinish: `${AUTH_BASE}/register/finish`,
  logout: `${AUTH_BASE}/logout`
};
