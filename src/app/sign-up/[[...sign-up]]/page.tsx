import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <SignUp path="/sign-up" routing="path" signInUrl="/login" />
    </div>
  );
}
