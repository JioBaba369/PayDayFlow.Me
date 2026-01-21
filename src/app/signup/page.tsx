import AuthLayout from '@/components/auth-layout';
import { SignupForm } from '@/components/auth/signup-form';

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Start your journey to financial confidence"
    >
      <SignupForm />
    </AuthLayout>
  );
}
