"use client";

import Link from "next/link";
import VoronoiBackground from "@/app/components/VoronoiBackground";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <VoronoiBackground />

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="card w-full max-w-md bg-base-100/90 backdrop-blur-md shadow-xl border border-base-300 text-center">
          <div className="card-body items-center">

            <Image
              src="/logo.svg"
              alt="Fractal logo"
              width={56}
              height={56}
              className="mb-4 drop-shadow"
              priority
            />

            <h1 className="text-4xl font-bold mb-2">
              404
            </h1>

            <p className="text-base-content/70 mb-6">
              This page doesn’t exist — or it drifted into another cell.
            </p>

            <Link
              href="/"
              className="btn btn-primary w-full"
            >
              Go home
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
