import { Outlet } from "react-router";

export default function AuthLayout() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md px-4 py-10 sm:px-6 lg:px-8">
                <Outlet />
            </div>
        </div>
    );
}
