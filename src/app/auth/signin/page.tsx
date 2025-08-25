"use client";

import { signIn } from "next-auth/react";
import { BiCode } from "react-icons/bi";
import { FaGithub, FaGoogle, FaDiscord } from "react-icons/fa";
import VoronoiBackground from "../../components/VoronoiBackground";

const providers = [
  {
    name: "GitHub",
    id: "github",
    icon: <FaGithub className="w-5 h-5 mr-2" />,
    color: "btn-neutral",
  },
  {
    name: "Google",
    id: "google",
    icon: <FaGoogle className="w-5 h-5 mr-2" />,
    color: "btn-error",
  }
];

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <VoronoiBackground />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card w-full max-w-md bg-base-100/90 backdrop-blur-md shadow-xl border border-base-300">
          <div className="card-body items-center text-center">
            <BiCode className="w-16 h-16 text-primary mb-4 drop-shadow" />
            <h2 className="card-title text-3xl font-bold mb-2">
              Welcome to Fractal
            </h2>
            <p className="text-base-content/70 mb-6">
              Sign in to continue to your snippets and libraries
            </p>

            <div className="w-full space-y-3">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => signIn(p.id, { callbackUrl: "/" })}
                  className={`btn w-full justify-center ${p.color}`}
                >
                  {p.icon}
                  Sign in with {p.name}
                </button>
              ))}
            </div>

            {/* <p className="mt-6 text-xs text-base-content/60">
              By signing in, you agree to our{" "}
              <a href="/terms" className="underline hover:text-primary">
                Terms
              </a>{" "}
              &{" "}
              <a href="/privacy" className="underline hover:text-primary">
                Privacy Policy
              </a>
              .
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}
