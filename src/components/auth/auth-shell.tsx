import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const AUTH_HERO =
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80";

type AuthShellProps = {
  children: React.ReactNode;
  backHref?: string;
};

/**
 * Shared auth layout: wide card filling the viewport below the site header.
 * Same outer size on login, register, and password recovery so pages do not jump.
 */
export function AuthShell({ children, backHref }: AuthShellProps) {
  return (
    <div className={`flex min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-4 py-4 sm:px-6 lg:px-8 ${poppins.className}`}>
      <div className="mx-auto flex w-full max-w-[1140px] flex-1 flex-col">
        <div className="flex min-h-[calc(100vh-4rem-2rem)] flex-1 overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:min-h-[min(748px,calc(100vh-4rem-2rem))]">
          <div className="relative hidden min-h-[280px] w-full shrink-0 md:block md:min-h-full md:w-1/2">
            <Image
              src={AUTH_HERO}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 570px"
              priority
            />
          </div>
          <div className="relative flex min-h-0 w-full flex-1 flex-col md:w-1/2">
            {backHref ? (
              <Link
                href={backHref}
                className="absolute left-6 top-6 z-10 text-sm text-zinc-500 transition-colors hover:text-zinc-800 md:left-10 md:top-8"
              >
                ← back
              </Link>
            ) : null}
            <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-8 sm:px-10 md:overflow-visible md:px-12 md:py-10 lg:py-12">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
