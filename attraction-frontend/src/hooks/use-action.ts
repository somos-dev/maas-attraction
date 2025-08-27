"use client"

import { ActionState, FieldErrors } from "@/lib/create-safe-action";

import { useCallback, useState } from "react";

type Action<TInput, TOutput> = (
	data: TInput
) => Promise<ActionState<TInput, TOutput>>;

interface UseActionOptions<TInput, TOutput> {
	onSuccess?: (data: TOutput) => void;
	onError?: (error: string) => void;
	onFieldError?: (fieldErrors?: FieldErrors<TInput | undefined>) => void;
	onComplete?: () => void;
}

export const useAction = <TInput, TOutput>(
	action: Action<TInput, TOutput>,
	options: UseActionOptions<TInput, TOutput>
) => {
	const [fieldErrors, setFieldErrors] =
		useState<FieldErrors<TInput | undefined>>(undefined);
	const [error, setError] = useState<string | undefined>(undefined);
	const [data, setData] = useState<TOutput | undefined>(undefined);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const execute = useCallback(
		async (input: TInput) => {
			setIsLoading(true);
			try {
				const result = await action(input);

				if (!result) {
					return;
				}

				setFieldErrors(result.fieldErrors);

				if (result.fieldErrors) {
					options.onFieldError?.(result.fieldErrors);
				}

				if (result.error) {
					setError(result.error);
					options.onError?.(result.error);
				}

				if (result.data) {
					setData(result.data);
					options.onSuccess?.(result.data);
					console.log("Action executed successfully", result.data);
				}
			} finally {
				setIsLoading(false);
				options.onComplete?.();
			}
		},
		[options, action]
	);

	return {
		fieldErrors,
		error,
		data,
		isLoading,
		execute,
	};
};
