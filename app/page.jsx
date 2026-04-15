import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center relative z-10 px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Student OS</h1>
        <p className="text-muted-foreground mb-8 text-sm md:text-base">Your personal study workspace</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Sign In</Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">Register</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
