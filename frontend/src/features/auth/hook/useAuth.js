import { useContext } from "react";
import { AuthContext } from "../auth.context";
import {
  login,
  register,
  logout,
  logoutall,
  getme,
} from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading } = context;

  const handlelogin = async ({ username, password }) => {
    setLoading(true);
    const data = await login({ username, password });
    setUser(data.user);
    setLoading(false);
  };

  const handelregister = async ({ name, username, email, password }) => {
    setLoading(true);
    const data = await register({ name, username, email, password });
    setUser(data.user);
    setLoading(false);
  };

  const handlelogout = async () => {
    setLoading(true);
    const data = await logout();
    setUser(null);
    setLoading(false);
  };
  return { user, loading, handelregister, handlelogin, handlelogout };
};
