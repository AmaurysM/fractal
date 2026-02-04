"use client";

import { signIn } from "next-auth/react";
import { FaGithub, FaGoogle, FaDiscord } from "react-icons/fa";
import VoronoiBackground from "../../components/VoronoiBackground";
import Image from "next/image";

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
  },
  // {
  //   name: "Discord",
  //   id: "discord",
  //   icon: <FaDiscord className="w-5 h-5 mr-2" />,
  //   color: "btn-primary",
  // },
];

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <VoronoiBackground />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card w-full max-w-md bg-base-100/90 backdrop-blur-md shadow-xl border border-base-300 rounded-xs">
          <div className="card-body items-center text-center">

            <Image
              src="/logo.svg"
              alt="Fractal logo"
              width={64}
              height={64}
              className="mb-4 drop-shadow"
              priority
            />

            <h2 className="card-title text-3xl font-bold mb-2">
              Welcome to Voronoi
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
          </div>
        </div>
      </div>
    </div>
  );
}
