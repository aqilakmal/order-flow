import { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { signIn, signUp } from "../services/auth";
import { useAuth } from "../hooks/use-auth";

// Form validation schema
const authSchema = z.object({
  email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter").min(1, "Kata sandi wajib diisi"),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInMutation = useMutation({
    mutationFn: (data: AuthFormValues) => signIn(data.email, data.password),
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
    mutationFn: (data: AuthFormValues) => signUp(data.email, data.password),
    onSuccess: () => {
      toast({
        title: "Akun telah dibuat",
        description: "Silakan masuk dengan akun baru Anda.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AuthFormValues, isSignIn: boolean) => {
    if (isSignIn) {
      signInMutation.mutate(data);
    } else {
      signUpMutation.mutate(data);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, isSignIn: boolean) => {
    if (e.key === "Enter") {
      e.preventDefault();
      form.handleSubmit((data) => onSubmit(data, isSignIn))();
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
              <form
                onSubmit={form.handleSubmit((data) => onSubmit(data, true))}
                className="space-y-3"
              >
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    {...form.register("email")}
                    onKeyDown={(e) => handleKeyDown(e, true)}
                    className={`hover:border-brand-300 focus-visible:ring-brand-500 ${
                      form.formState.errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {form.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Kata Sandi"
                    {...form.register("password")}
                    onKeyDown={(e) => handleKeyDown(e, true)}
                    className={`hover:border-brand-300 focus-visible:ring-brand-500 ${
                      form.formState.errors.password ? "border-red-500" : ""
                    }`}
                  />
                  {form.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-brand-500 text-white hover:bg-brand-600"
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending ? "Sedang masuk..." : "Masuk"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-3">
              <form
                onSubmit={form.handleSubmit((data) => onSubmit(data, false))}
                className="space-y-3"
              >
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    {...form.register("email")}
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    className={`hover:border-brand-300 focus-visible:ring-brand-500 ${
                      form.formState.errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {form.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Kata Sandi"
                    {...form.register("password")}
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    className={`hover:border-brand-300 focus-visible:ring-brand-500 ${
                      form.formState.errors.password ? "border-red-500" : ""
                    }`}
                  />
                  {form.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-brand-500 text-white hover:bg-brand-600"
                  disabled={signUpMutation.isPending}
                >
                  {signUpMutation.isPending ? "Membuat akun..." : "Daftar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
