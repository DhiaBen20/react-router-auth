import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Form,
    useActionData,
    useLoaderData,
    useNavigation,
    useSubmit,
} from "react-router";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import type { Route as ProfileSettingsRoute } from "../../routes/settings/+types/profile";

export const ProfileInfoSchema = z.object({
    email: z.email().min(1, "Email is required"),
    name: z.string("Name is required").min(1, "Name is required"),
});

export default function ProfileInfoForm() {
    const loaderData =
        useLoaderData<ProfileSettingsRoute.ComponentProps["loaderData"]>();

    const actionData =
        useActionData<ProfileSettingsRoute.ComponentProps["actionData"]>();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        values: {
            email: loaderData.profileInfo.email,
            name: loaderData.profileInfo.name,
        },
        resolver: zodResolver(ProfileInfoSchema),
    });

    const navigation = useNavigation();

    console.log(errors);

    useEffect(() => {
        if (!actionData || actionData.ok) return;

        if (actionData.errors.fieldErrors.name) {
            setError("name", {
                type: "custom",
                message: actionData.errors.fieldErrors.name[0],
            });
        }

        if (actionData.errors.fieldErrors.email) {
            setError("email", {
                type: "custom",
                message: actionData.errors.fieldErrors.email[0],
            });
        }
    }, [actionData]);

    const submit = useSubmit();

    return (
        <Form
            className="space-y-4"
            method="post"
            onSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
        >
            <Field data-invalid={errors.name ? true : false}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                    id="name"
                    {...register("name")}
                    aria-invalid={errors.name ? true : undefined}
                />
                {errors.name && <FieldError errors={[errors.name]} />}
            </Field>

            <Field data-invalid={errors.email ? true : false}>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                    id="email"
                    {...register("email")}
                    aria-invalid={errors.email ? true : undefined}
                />
                {errors.email && <FieldError errors={[errors.email]} />}
            </Field>

            <Button isLoading={navigation.state === "submitting"}>Save</Button>
        </Form>
    );
}
