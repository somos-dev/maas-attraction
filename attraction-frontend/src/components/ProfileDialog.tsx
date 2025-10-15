import React, { use, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Input from "@/components/form/input/InputField";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, Settings, Edit2, Mail, Hash, LogOut } from 'lucide-react';
import { useProfileStore } from '@/store/profileStore';
import useAuth from '@/hooks/useAuth';
import axiosInstance from '@/utils/axios';
import { toast } from 'sonner';
import { ActionState, useSafeAction } from '@/hooks/use-safe-action';
import { z } from 'zod';
import { AuthUser } from '@/@types/auth';
import useLocales from '@/hooks/useLocales';
import { Types } from '@/context/JWTContext';


export const editProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(50, "Username cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
})

export type EditProfileInputType = z.infer<typeof editProfileSchema>;
export type EditProfileReturnType = ActionState<EditProfileInputType, AuthUser>;


const ProfileDialog: React.FC = () => {
  const { isProfileOpen, setProfileClose } = useProfileStore();
  const { logout, user, handleDispatch } = useAuth();
  const { translate } = useLocales();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ email: '', username: '' });



  useEffect(() => {
    if (user) {
      setFormData({ email: user.email || '', username: user.username || '' });
    }
  }, [user, isProfileOpen]);

  useEffect(() => {
    console.log('user is this', user)
  }, [user])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };


  const handleDialogClose = () => {
    setIsEditing(false);
    setProfileClose();
    setFieldErrors(undefined);
    if (user) setFormData({ email: user.email || '', username: user.username || '' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFieldErrors(undefined);
    if (user) setFormData({ email: user.email || '', username: user.username || '' });
  };


  const handleSave = async (props: EditProfileInputType): Promise<EditProfileReturnType> => {
    try {
      const response = await axiosInstance.patch('/profile/', {
        username: props.username,
        email: props.email,
      });

      if (response.status === 200) {
        return {
          data: response.data as AuthUser,
          error: null
        }
      } else {
        const errorMessage = response.data?.detail || "Failed to update profile";
        const errorData = response?.data?.error || {};
      
      const fieldErrors = {
        email: errorData?.email || [],
        username: errorData?.username|| [],
        password: errorData?.password|| [],
        confirmPassword: errorData?.confirm_password|| [],
        codiceFiscale: errorData?.codice_fiscale|| [],
        role: errorData?.role|| []
      };
        return { 
          error: errorMessage,
          fieldErrors: fieldErrors
        };
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || "Failed to update profile";
      const errorData = error?.response?.data || {};
      
      const fieldErrors = {
        email: errorData?.email || [],
        username: errorData?.username|| [],
        password: errorData?.password|| [],
        confirmPassword: errorData?.confirm_password|| [],
        codiceFiscale: errorData?.codice_fiscale|| [],
        role: errorData?.role|| []
      };
        return { 
          error: errorMessage,
          fieldErrors: fieldErrors
        };
    }
  };



  const { execute, error, fieldErrors, setFieldErrors, isLoading } = useSafeAction(
    editProfileSchema,
    handleSave,
    {
      onSuccess: (data) => {
        toast.success(`Email change is pending. A confirmation email has been sent to your new email address!`);
        setIsEditing(false);
        // handleDispatch({ type: Types.Login, payload: { user: { ...user, ...formData } } });
      },
      onError: (errorMsg) => { toast.error(errorMsg); },
      onFieldError: (error) => { },
      onComplete: () => { },
    }
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.username === user?.username && formData.email === user?.email) {
      toast.info(String(translate("profile.noChangesDetected")));
      return;
    }
    execute({ ...formData });
  };

  if (!user) return null;

  return (
    <Dialog open={isProfileOpen} onOpenChange={isLoading ? undefined : handleDialogClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4 flex flex-col items-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            {isEditing ? String(translate('profile.editProfile')) : String(translate('profile.title'))}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? String(translate('profile.updateAccountInfo'))
              : String(translate('profile.manageAccount'))
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {
            !isEditing
              ?
              (
                // Profile View Mode
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100">{String(translate('auth.username'))}</h3>
                        </div>
                        <p className="text-blue-800 dark:text-blue-200 font-medium">{user.username}</p>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-xl border border-green-200/50 dark:border-green-800/50">
                        <div className="flex items-center gap-3 mb-2">
                          <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <h3 className="font-semibold text-green-900 dark:text-green-100">{String(translate('auth.email'))}</h3>
                        </div>
                        <p className="text-green-800 dark:text-green-200 font-medium">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {user.codice_fiscale && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                          <div className="flex items-center gap-3 mb-2">
                            <Hash className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <h3 className="font-semibold text-purple-900 dark:text-purple-100">{String(translate('auth.codiceFiscale'))}</h3>
                          </div>
                          <p className="text-purple-800 dark:text-purple-200 font-medium">{user.codice_fiscale}</p>
                        </div>
                      )}

                      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-4 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
                        <div className="flex items-center gap-3 mb-2">
                          <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          <h3 className="font-semibold text-orange-900 dark:text-orange-100">{String(translate('profile.accountType'))}</h3>
                        </div>
                        <p className="text-orange-800 dark:text-orange-200 font-medium capitalize">{user.type}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
                      disabled={isLoading}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      {String(translate('profile.editProfile'))}
                    </Button>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleDialogClose} className="flex-1 sm:flex-none" disabled={isLoading}>
                        {String(translate('common.close'))}
                      </Button>
                      <Button
                        onClick={() => { handleDialogClose(); logout(); }}
                        variant="destructive"
                        className="flex-1 sm:flex-none"
                        disabled={isLoading}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {String(translate('auth.logout'))}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                // Edit Mode
                <form onSubmit={onSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-4">
                      <Label htmlFor="username" className="text-sm font-medium">{String(translate('auth.username'))}</Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        defaultValue={formData.username}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        error={!!fieldErrors?.username}
                        hints={fieldErrors?.username}
                        placeholder={String(translate('auth.enterUsername'))}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="email" className="text-sm font-medium">{String(translate('auth.email'))}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        error={!!fieldErrors?.email}
                        hints={fieldErrors?.email}
                        placeholder={String(translate('auth.enterEmail'))}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none" disabled={isLoading}>
                      {String(translate('common.cancel'))}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
                      disabled={isLoading}
                    >
                      {String(translate('profile.saveChanges'))}
                    </Button>
                  </div>
                </form>
              )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
