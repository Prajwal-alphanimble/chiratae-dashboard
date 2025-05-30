import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <SignIn path="/login" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}
