import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

const errorMessages = {
  400: {
    title: "Bad Request",
    message: "The request could not be processed. Please review your input and try again.",
  },
  401: {
    title: "Authentication Required",
    message: "You must sign in before accessing this resource.",
  },
  403: {
    title: "Access Denied",
    message: "You do not have permission to access this resource.",
  },
  404: {
    title: "Page Not Found",
    message: "The page you requested could not be found.",
  },
  405: {
    title: "Method Not Allowed",
    message: "The requested action is not supported for this resource.",
  },
  408: {
    title: "Request Timeout",
    message: "The request took too long to complete.",
  },
  409: {
    title: "Conflict",
    message: "The requested operation conflicts with existing data.",
  },
  410: {
    title: "Gone",
    message: "The requested resource is no longer available.",
  },
  422: {
    title: "Validation Failed",
    message: "Some submitted data failed validation checks.",
  },
  429: {
    title: "Too Many Requests",
    message: "You have made too many requests. Please wait and try again.",
  },
  500: {
    title: "Internal Server Error",
    message: "An unexpected server error occurred.",
  },
  502: {
    title: "Bad Gateway",
    message: "An upstream service returned an invalid response.",
  },
  503: {
    title: "Service Unavailable",
    message: "The service is temporarily unavailable.",
  },
  504: {
    title: "Gateway Timeout",
    message: "The server took too long to respond.",
  },
};

const genericError = {
  title: "Something Went Wrong",
  message:
    "An unexpected error occurred. Please try again later or contact support if the issue persists.",
};

const ErrorPage = ({ code = 500 }) => {
  const location = useLocation();
  const error = errorMessages[code] || genericError;
  const isKnownError = Object.hasOwn(errorMessages, code);

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex items-center justify-center px-4">
      <div className="absolute h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="relative max-w-xl w-full text-center rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-12">
        <div className="h-20 w-20 mx-auto rounded-[28px] bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="text-red-400" size={34} />
        </div>

        <p className="text-blue-400 font-semibold mt-8">
          Error {code}
        </p>

        {!isKnownError && (
          <p className="text-yellow-400 text-sm mt-2">
            Unknown error code
          </p>
        )}

        <h1 className="text-4xl md:text-5xl font-bold mt-3">
          {error.title}
        </h1>

        <p className="text-slate-400 mt-5 leading-relaxed">
          {error.message}
        </p>

        <p className="text-slate-600 text-sm mt-4 break-all">
          Path: {location.pathname}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-5 py-3 rounded-2xl border border-white/10 bg-white/[0.03] text-white flex items-center justify-center gap-2 hover:bg-white/[0.06] cursor-pointer"
          >
            <ArrowLeft size={18} />
            Go back
          </button>

          <Link
            to="/"
            className="px-5 py-3 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
          >
            <Home size={18} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;