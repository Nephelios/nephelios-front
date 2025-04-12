import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Link,
} from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "@/pages/dashboard";
import CreateApp from "@/pages/create-app";
import AppDetails from "@/pages/app-details";
import Monitor from "@/pages/monitor";
import { Button } from "./components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";


function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="border-b h-16 bg-background shadow-sm w-full">
        <div className="px-4 h-16 flex items-center justify-between w-full">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <h1 className="text-xl font-bold">Nephelios</h1>
          </div>
          {location.pathname === "/monitor" ? (
            <Button
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
              <ArrowLeftIcon className="mr-2" /> Back
            </Button>
          ) : (
            <Button asChild variant={`${location.pathname === "/monitor" ? "default" : "secondary"}`}>
              <Link
                to="/monitor"
              >
                Monitor nephelios
              </Link>
            </Button>
          )}
        </div>

      </header>
      <main className="container mx-auto py-10 px-4 h-full w-full">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateApp />} />
            <Route path="/apps/:id" element={<AppDetails />} />
            <Route path="/monitor" element={<Monitor />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}
