import { redirect, type MiddlewareFunction } from "react-router";
import { flattenError } from "zod";
import { requireGuest } from "~/db/middlewares/requireGuest";
import RegisterCard from "~/pages/register/components/RegisterCard";
import RegisterForm from "~/pages/register/components/RegisterForm";
import {
    RegisterSchema,
    uniqueEmailRefinement,
} from "~/pages/register/schemas";
import { register } from "~/utils/auth";
import type { Route } from "./+types/register";

export const middleware: MiddlewareFunction[] = [requireGuest];

export function loader() {
    return null;
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

    const parseResult = await RegisterSchema.superRefine(
        uniqueEmailRefinement,
    ).safeParseAsync(Object.fromEntries(formData));

    if (!parseResult.success) {
        return { ok: false as const, errors: flattenError(parseResult.error) };
    }

    register(parseResult.data);

    throw redirect("/login");
}

export default function Register() {
    return (
        <RegisterCard>
            <RegisterForm />
        </RegisterCard>
    );
}
