import { Link, Outlet } from "react-router";

export default function SettingsLayout() {
    return (
        <div className="flex gap-4">
            <div className="w-full max-w-60 pt-10">
                <nav className="flex flex-col">
                    <Link to={"/settings/profile"}>Profile</Link>
                    <Link to={"/settings/security"}>Security</Link>
                    <Link to={"#"}>Delete account</Link>
                </nav>
            </div>
            <div className="max-w-xl flex-1 pt-10 pb-10">
                <Outlet />
            </div>
        </div>
    );
}
