import { useState } from "react";
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

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
        title: "Kesalahan",
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
        title: "Kesalahan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="relative h-screen overflow-hidden bg-[#FFDFB5]">
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-neutral-800">Order Flow</h1>
            <p className="mt-2 text-neutral-600">Masuk untuk mengelola pesanan</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Kata Sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={() => signInMutation.mutate()}
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending ? "Sedang masuk..." : "Masuk"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Kata Sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={() => signUpMutation.mutate()}
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