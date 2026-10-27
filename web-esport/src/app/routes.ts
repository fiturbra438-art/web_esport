import { createBrowserRouter, redirect } from "react-router"
import ArenaApp, { ScreenGallery } from "../App"

export const router = createBrowserRouter([
  { path: "/", Component: ArenaApp },
  { path: "/profile", Component: ArenaApp },
  { path: "/teams", Component: ArenaApp },
  { path: "/tournaments", Component: ArenaApp },
  { path: "/schedule", Component: ArenaApp },
  { path: "/admin", Component: ArenaApp },
  { path: "/login", Component: ArenaApp },
  { path: "/register", Component: ArenaApp },
  { path: "/screens", Component: ScreenGallery },
  { path: "*", loader: () => redirect("/") },
])
