import {Outlet} from "react-router-dom";

export default function UserLayout() {
    return (
        <div className="">
            <main>
                <Outlet />
            </main>
        </div>
    )
}