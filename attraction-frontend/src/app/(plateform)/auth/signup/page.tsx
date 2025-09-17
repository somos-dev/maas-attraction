import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignUp Page | Attaction",
  description: "This is SignUp Page for Attaction",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
