import { redirect } from "react-router";
import { flattenError } from "zod";
import { db } from "~/db/client";
import { requireGuest } from "~/middlewares/requireGuest";
import RegisterCard from "~/pages/register/components/RegisterCard";
import RegisterForm, {
    RegisterSchema,
} from "~/pages/register/components/RegisterForm";
import { UserRepository } from "~/repositories/user";
import { register } from "~/utils/auth";
import type { Route } from "./+types/register";

export const middleware: Route.MiddlewareFunction[] = [requireGuest];

export function loader() {
    return null;
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

    const parseResult = await RegisterSchema.superRefine(async (data, ctx) => {
        const userRespository = new UserRepository(db);
        const user = await userRespository.findByEmail(data.email);
        if (user)
            ctx.addIssue({
                code: "custom",
                path: ["email"],
                message: "Email is already in use",
            });
    }).safeParseAsync(Object.fromEntries(formData));

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
