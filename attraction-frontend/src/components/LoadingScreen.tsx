
import { m } from 'framer-motion';
// @mui
//
// import Logo from './Logo';
import { Card } from './ui/card';
import { Loader2 } from 'lucide-react';

// ----------------------------------------------------------------------


// ----------------------------------------------------------------------

export default function LoadingScreen() {
  return (
            <div className="p-6 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-sky-700 animate-spin"/>
            </div>
  );
}
