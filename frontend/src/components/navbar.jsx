import { Button } from "./ui/button";
import { NavLink } from "react-router-dom";


export default function Navbar({ items }) {
  return (
    <main className="flex flex-row items-center justify-between my-4">
      {/* Logo */}
      <div className="flex items-center justify-start text-2xl font-bold text-blue-600">
        Type Master 
      </div>

      <nav className="flex flex-row items-center gap-4">
        {items.map((item) => (
            <NavLink key={item.id} to={item.path}>
              <Button className="text-green-500">
                {item.name}
              </Button>
            </NavLink>
        ))}
      </nav>

      {/* Signup Button */}
      <div>
        <Button>Sign Up</Button>
      </div>
    </main>
  );
}
