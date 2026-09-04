import { Button } from "./ui/button";
import { NavLink } from "react-router-dom";

export default function Navbar({ items }) {
  return (
    <header className="flex h-16 w-full items-center justify-between">
      
      {/* Logo */}
      <div className="text-xl font-bold tracking-tight sm:text-2xl">
        Type<span className="text-primary">Master</span>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-1 sm:gap-2">
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2 ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Signup */}
      <Button
        variant="default"
        size="sm"
        className="hidden sm:inline-flex"
      >
        Sign Up
      </Button>

    </header>
  );
}