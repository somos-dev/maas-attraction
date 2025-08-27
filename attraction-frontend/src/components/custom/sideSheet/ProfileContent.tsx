import React, { useEffect, useState } from 'react';
import {
  Dialog,
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
import { toast } from 'sonner';
import { useSafeAction } from '@/hooks/use-safe-action';
import { EditProfileInputType, EditProfileReturnType, editProfileSchema } from '@/components/ProfileDialog';
import axiosInstance from '@/utils/axios';
import { AuthUser } from '@/@types/auth';

interface FavoritePlace {
  id: string;
  address: string;
  lat: number;
  lon: number;
  type: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  type: string;
  codice_fiscale: string;
  favorite_places: FavoritePlace[];
}

const ProfileContent: React.FC = () => {
  const { isProfileOpen, setProfileClose } = useProfileStore();
  const { logout, user, handleDispatch } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ email: '', username: '' });



  useEffect(() => {
    if (user) {
      setFormData({ email: user.email || '', username: user.username || '' });
    }
  }, [user, isProfileOpen]);



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
        return { error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || "Failed to update profile";
      return { error: errorMessage };
    }
  };



  const { execute, error, fieldErrors, setFieldErrors, isLoading } = useSafeAction(
    editProfileSchema,
    handleSave,
    {
      onSuccess: (data) => {
        toast.success(`Profile updated successfully!`);
        setIsEditing(false);
        handleDispatch({ type: 'LOGIN', payload: { isAuthenticated: true, user: { ...user, ...formData } } });
      },
      onError: (errorMsg) => { toast.error(errorMsg); },
      onFieldError: (error) => { },
      onComplete: () => { },
    }
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.username === user?.username && formData.email === user?.email) {
      toast.info("No changes detected.");
      return;
    }
    execute({ ...formData });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col space-y-2 items-center">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {isEditing ? 'Edit Profile' : 'Profile'}
        </div>
        <div>
          {isEditing
            ? 'Update your account information'
            : 'Your account information and settings'
          }
        </div>
      </div>

      <div className="space-y-4">
        {!isEditing ? (
          // Profile View Mode
          <>
            <div className="space-y-4">
              {/* <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                </div> */}

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Username</p>
                    <p className="text-sm text-muted-foreground">{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                {user.codice_fiscale && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Codice Fiscale</p>
                      <p className="text-sm text-muted-foreground">{user.codice_fiscale}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Account Type</p>
                    <p className="text-sm text-muted-foreground capitalize">{user.type}</p>
                  </div>
                </div>

                {user.favorite_places && user.favorite_places.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Favorite Places</p>
                      <p className="text-sm text-muted-foreground">
                        {user.favorite_places.length} saved location{user.favorite_places.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={
                    logout
                  }
                  variant="destructive" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>

            <Separator />

          </>
        ) : (
          // Edit Mode
          <>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  defaultValue={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  error={!!fieldErrors?.username}
                  hints={fieldErrors?.username}
                  placeholder="Enter your username"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  error={!!fieldErrors?.email}
                  hints={fieldErrors?.email}
                  placeholder="Enter your email"
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type='submit'
                  disabled={isLoading}
                  className=""

                >
                  <Settings className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Saved Places
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>


          </>
        )}
      </div>
    </div>
  );
};

export default ProfileContent;
