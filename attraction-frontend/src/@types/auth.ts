import { SignInInputType, SignInReturnType, SignUpInputType, SignUpReturnType } from '@/context/JWTContext';
import { ActionState } from '@/lib/create-safe-action';
// import { UserCredential } from 'firebase/auth';

// ----------------------------------------------------------------------

export type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type AuthUser = null | Record<string, any>;

export type AuthState = {
  isAuthenticated: boolean;
  isActive: boolean,
  isInitialized: boolean;
  user: AuthUser;
};

export type JWTContextType = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUser;
  method: 'jwt';
  login: (data: SignInInputType) => Promise<SignInReturnType>;
  register:  (data: SignUpInputType) => Promise<SignUpReturnType>;
  logout: () => Promise<void>;
  handleDispatch: (action: any) => void;
};
