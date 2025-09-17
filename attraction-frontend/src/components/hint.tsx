import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface HintProps {
    children : React.ReactNode;
    description: string;
    side?: "left" | "right" | "top" | "bottom";
    sideOffset?: number
    className?: string
}


const Hint = ({
    children,
    description,
    side = "bottom",
    sideOffset,
    className = ''
} : HintProps) => {
  return (
    <TooltipProvider>
        <Tooltip delayDuration={0} >
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent
            sideOffset={sideOffset}
            side={side}
            className={`text-xs text-black max-w-[200px] break-words bg-slate-50 p-1 rounded-sm ${className}`}
            >{description}</TooltipContent>
        </Tooltip>
    </TooltipProvider>
  )
}

export default Hint