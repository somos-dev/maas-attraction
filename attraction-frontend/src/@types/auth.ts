import { JWTActions, SignInInputType, SignInReturnType, SignUpInputType, SignUpReturnType } from '@/context/JWTContext';
// import { UserCredential } from 'firebase/auth';

// ----------------------------------------------------------------------

export type ActionMap<M extends { [index: string]: unknown }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type AuthUser = null | any;
interface FavoritePlace {
  id: string;
  address: string;
  lat: number;
  lon: number;
  type: string;
}

// export interface AuthUser {
//   id?: string;
//   username: string;
//   email: string;
//   type?: string;
//   codice_fiscale?: string;
//   favorite_places?: FavoritePlace[];
// }

export type AuthState = {
  isAuthenticated: boolean;
  isActive: boolean;
  isInitialized: boolean;
  user: null | AuthUser;
};

export type JWTContextType = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: null | AuthUser; 
  method: 'jwt';
  login: (data: SignInInputType) => Promise<SignInReturnType>;
  register:  (data: SignUpInputType) => Promise<SignUpReturnType>;
  logout: () => Promise<void>;
  handleDispatch: (action: JWTActions) => void;
};
