"use client"

import React, { useState } from 'react'
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from '@/context/JWTContext';
import {Toaster} from "sonner"
import { MapProvider } from '@/context/MapContext';
import InstallPrompt from '@/components/InstallPrompt';
import { Provider } from 'react-redux';
import { store } from '@/redux/store/store';



type Props = {children: React.ReactNode}

const Layout = ({children}: Props) => {
    const [queryClient] = useState(() => new QueryClient());

  return (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <MapProvider>

      <Toaster position='bottom-center' richColors closeButton />
      <AuthProvider>
      <TooltipProvider>
          {children}
          <InstallPrompt />
      </TooltipProvider>
      </AuthProvider>
      </MapProvider>
    </QueryClientProvider>
  </Provider>
  )
}

export default Layout



