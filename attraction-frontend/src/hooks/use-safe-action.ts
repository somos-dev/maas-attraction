import { useCallback, useState } from "react";
import { ZodSchema, z } from "zod";

export type FieldErrors<T> = {
    [k in keyof T] : string[]
}
export type ActionState<TInput, TOutput> = {
  fieldErrors?: FieldErrors<TInput>;
  error?: string | null;
  data?: TOutput;
};

export type ActionOptions<TInput, TOutput> = {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
  onFieldError?: (errors: FieldErrors<TInput>) => void;
  onComplete?: () => void;
};

export type Action<TInput, TOutput> =  (data : TInput) => Promise<ActionState<TInput,TOutput>>


export function useSafeAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  apiCall: Action<TInput, TOutput>,
  options: ActionOptions<TInput, TOutput> = {}
) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<TInput  | undefined>>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [data, setData] = useState<TOutput | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (input: TInput) => {
      setIsLoading(true);
      setFieldErrors(undefined);
      setError(undefined);
      try {
        const parsed = schema.safeParse(input);
        if (!parsed.success) {
          const zodErrors = parsed.error.flatten().fieldErrors as FieldErrors<TInput>;
          setFieldErrors(zodErrors);
          options.onFieldError?.(zodErrors);
          return;
        }

        const result = await apiCall(parsed.data);
        setData(result.data);
        console.log('result from useSafeAction', result)
        if(result.data){
            options.onSuccess?.(result.data);
        }
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
          options.onFieldError?.(result.fieldErrors);
        }

        if(!result.data && result.error) {
          throw new Error(result.error);
        }
      } catch (err: any) {
        const msg =  typeof err === 'string' ? err : err?.message || err?.detail || "Something went wrong.";
        console.log("error this is error bye", err)
        setError(msg);
        options.onError?.(msg);
      } finally {
        setIsLoading(false);
        options.onComplete?.();
      }
    },
    [apiCall, schema, options]
  );

  return {
    execute,
    isLoading,
    error,
    data,
    fieldErrors,
    setFieldErrors
  };
}
