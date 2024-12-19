import { useAtomValue } from "jotai";
import { userAtom } from "../store/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthService } from "../services/auth";
import { useToast } from "../hooks/use-toast";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

// Validation schema for password change form with confirmation matching
const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Kata sandi minimal 6 karakter")
      .min(1, "Kata sandi wajib diisi"),
    newPassword: z
      .string()
      .min(6, "Kata sandi minimal 6 karakter")
      .min(1, "Kata sandi wajib diisi"),
    confirmPassword: z
      .string()
      .min(6, "Kata sandi minimal 6 karakter")
      .min(1, "Kata sandi wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;

// Profile page component for user details and password management
export default function ProfilePage() {
  const user = useAtomValue(userAtom);
  const { changePassword } = useAuthService();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize form with password change validation
  const form = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle password change submission with success/error notifications
  const onSubmit = async (data: PasswordChangeForm) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast({
        title: "Berhasil",
        description: "Kata sandi berhasil diubah",
      });
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengubah kata sandi",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-[100svh] flex-col bg-[#FFDFB5]">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-5xl p-3 pb-0 sm:p-6 sm:pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
                className="border-none bg-transparent pl-0 pr-3 text-brand-900 shadow-none hover:bg-transparent"
              >
                <ArrowLeftIcon className="h-4 w-4 stroke-[3]" />
              </Button>
              <h1 className="text-lg font-semibold text-brand-900 sm:text-xl">Profil</h1>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="-mt-5 flex h-full items-center justify-center">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
              <div className="mb-6">
                <label className="font-semibold text-brand-900">Email</label>
                <p className="mt-1 text-brand-700">{user.email}</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="mb-3 font-semibold text-brand-900">Ubah Kata Sandi</h2>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <div>
                    <Input
                      type="password"
                      placeholder="Kata Sandi Saat Ini"
                      {...form.register("currentPassword")}
                      className={`hover:border-brand-300 focus-visible:ring-brand-500 ${
                        form.formState.errors.currentPassword ? "border-red-500" : ""
                      }`}
                    />
                    {form.formState.errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Kata Sandi Baru"
                      {...form.register("newPassword")}
                      className={`hover:border-brand-300 focus-visible:ring-brand-500 ${
                        form.formState.errors.newPassword ? "border-red-500" : ""
                      }`}
                    />
                    {form.formState.errors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Konfirmasi Kata Sandi Baru"
                      {...form.register("confirmPassword")}
                      className={`hover:border-brand-300 focus-visible:ring-brand-500 ${
                        form.formState.errors.confirmPassword ? "border-red-500" : ""
                      }`}
                    />
                    {form.formState.errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-brand-500 text-white hover:bg-brand-600"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
