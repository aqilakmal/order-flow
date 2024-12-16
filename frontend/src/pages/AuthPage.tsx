import { useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { signIn, signUp } from "../services/auth";
import { useAuth } from "../hooks/use-auth";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const validateEmail = (email: string) => {
    if (!email) {
      return "Email wajib diisi";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Format email tidak valid";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Kata sandi wajib diisi";
    }
    if (password.length < 6) {
      return "Kata sandi minimal 6 karakter";
    }
    return "";
  };

  const handleEmailBlur = () => {
    setErrors((prev) => ({
      ...prev,
      email: validateEmail(email),
    }));
  };

  const handlePasswordBlur = () => {
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(password),
    }));
  };

  const validateForm = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    return !emailError && !passwordError;
  };

  const signInMutation = useMutation({
    mutationFn: () => signIn(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.session);
      navigate("/admin");
      toast({
        title: "Selamat datang kembali!",
        description: "Anda telah berhasil masuk.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: () => signUp(email, password),
    onSuccess: () => {
      toast({
        title: "Akun telah dibuat",
        description: "Silakan masuk dengan akun baru Anda.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSignIn = () => {
    if (validateForm()) {
      signInMutation.mutate();
    }
  };

  const handleSignUp = () => {
    if (validateForm()) {
      signUpMutation.mutate();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, isSignIn: boolean) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isSignIn) {
        handleSignIn();
      } else {
        handleSignUp();
      }
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[#FFDFB5]">
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold text-brand-900">Order Flow</h1>
            <p className="mt-1 text-sm text-brand-700">Masuk untuk mengelola pesanan</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="signin"
                className="hover:bg-brand-200 data-[state=active]:bg-brand-500 data-[state=active]:text-white"
              >
                Masuk
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="hover:bg-brand-200 data-[state=active]:bg-brand-500 data-[state=active]:text-white"
              >
                Daftar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-3">
              <div className="space-y-3">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    onKeyDown={(e) => handleKeyDown(e, true)}
                    className={`hover:border-brand-300 focus-visible:ring-brand-500 ${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Kata Sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={handlePasswordBlur}
                    onKeyDown={(e) => handleKeyDown(e, true)}
                    className={`hover:border-brand-300 focus-visible:ring-brand-500 ${errors.password ? "border-red-500" : ""}`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                <Button
                  className="w-full bg-brand-500 text-white hover:bg-brand-600"
                  onClick={handleSignIn}
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending ? "Sedang masuk..." : "Masuk"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-3">
              <div className="space-y-3">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    className={`hover:border-brand-300 focus-visible:ring-brand-500 ${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Kata Sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={handlePasswordBlur}
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    className={`hover:border-brand-300 focus-visible:ring-brand-500 ${errors.password ? "border-red-500" : ""}`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                <Button
                  className="w-full bg-brand-500 text-white hover:bg-brand-600"
                  onClick={handleSignUp}
                  disabled={signUpMutation.isPending}
                >
                  {signUpMutation.isPending ? "Membuat akun..." : "Daftar"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
