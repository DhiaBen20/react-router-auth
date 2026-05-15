import z from "zod";

export const SendResetCodeSchema = z.object({
    email: z.email().min(1, "Email is required"),
});
