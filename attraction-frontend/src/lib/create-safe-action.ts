import {z} from "zod"


export type FieldErrors<T> = {
    [k in keyof T] : string[]
}

export type ActionState<TInput, TOutput> = {
    fieldErrors?: FieldErrors<TInput>;
    error? : string | null ;
    data? : TOutput
}

export type Action<TInput, TOutput> =  (data : TInput) => Promise<ActionState<TInput,TOutput>>


export const createSafeAction = <TInput,TOutput>(
    schema:z.Schema,
    handler : Action<TInput, TOutput>
) =>{
    return async (data:TInput) =>{
        const validatedFields = schema.safeParse(data)

        if(!validatedFields.success){
            return {
                // status:"error" as string,
                fieldErrors: validatedFields.error.flatten().fieldErrors as FieldErrors<TInput>
            }
        }

        return handler(validatedFields.data)
    }
}