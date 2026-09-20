import icon from "@/assets/icon.png";
import useLogin from "@/hooks/useLogin";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  IconMail,
  IconLock,
  IconShieldCheck,
  IconArrowRight,
  IconExternalLink,
} from "@tabler/icons-react";

export default function Login() {
  const notify = () =>
    toast.error("Invalid credentials or unauthorized account.", {
      position: "bottom-right",
      autoClose: 3000,
      theme: "dark",
    });

  const { mutate, isPending } = useLogin({
    onError: () => {
      notify();
    },
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      mutate(values);
    },
  });

  const [cookies, , removeCookie] = useCookies(["token", "refreshToken", "admin_name"]);

  useEffect(() => {
    if (cookies.token || cookies.refreshToken) {
      removeCookie("token", { path: "/" });
      removeCookie("refreshToken", { path: "/" });
      removeCookie("admin_name", { path: "/" });
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("admin_name");
      }
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-[#07090e] overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl bg-[#0f121b]/90 border border-neutral-800/90 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl animate-fadeIn">
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1.5px] shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center mb-1">
            <div className="w-full h-full bg-[#07090e] rounded-[15px] flex items-center justify-center p-2">
              <img
                src={icon}
                alt="Cyber Apple Logo"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.9)]"
              />
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              CYBER APPLE
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO
              </span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Store Administrator & Fulfillment Portal
            </p>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">
              Admin Email
            </label>
            <div className="relative flex items-center">
              <IconMail className="absolute left-3.5 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                placeholder="admin@cyber.store"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">
              Secure Password
            </label>
            <div className="relative flex items-center">
              <IconLock className="absolute left-3.5 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <IconShieldCheck className="w-4 h-4" />
                  Access Dashboard
                  <IconArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center">
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-cyan-300 transition-colors"
          >
            Visit Customer Storefront
            <IconExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <ToastContainer theme="dark" />
    </div>
  );
}