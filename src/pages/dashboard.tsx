import { Link, useNavigate } from "react-router-dom";
import { GitHubLogoIcon, GlobeIcon, RocketIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import ServerNotFound from "@/components/ui/ServerNotFound";

// Define the type for the app data
export interface App {
  container_id: string;
  app_name: string;
  app_type: string;
  domain: string;
  github_url: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backendUrl =
      process.env.REACT_APP_NEPHELIOS_BACKEND_URL || "http://localhost";
  const backendPort = process.env.REACT_APP_NEPHELIOS_BACKEND_PORT || "3030";

  const url = `${backendUrl}:${backendPort}/get-apps`;

  const fetchApps = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch apps");
      }
      const data = await response.json();

      if (!Array.isArray(data.apps)) {
        throw new Error("Fetched data is not an array");
      }

      setApps(data.apps);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <ServerNotFound />;
  }

  if (apps.length === 0) {
    return (
      <div className="container mx-auto h-[80vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
            <RocketIcon className="w-12 h-12 text-primary" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to Nephelios
            </h1>
            <p className="text-xl text-muted-foreground">
              Your modern cloud platform for seamless application deployment.
              Get started by deploying your first application.
            </p>
          </div>

          <Button size="lg" asChild className="mt-8">
            <Link to="/create" className="flex items-center gap-2">
              <RocketIcon className="w-4 h-4" />
              Deploy Your First App
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor your deployed applications.
          </p>
        </div>
        <Button asChild>
          <Link to="/create">Deploy New App</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <Card
            key={app.container_id}
            className="hover:shadow-lg cursor-pointer"
            onClick={() =>
              navigate(`/apps/${app.container_id}`, { state: app })
            }
            allowPress={true}
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>{app.app_name}</span>
              </CardTitle>
              <CardDescription>{app.app_type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`https://${app.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    {app.domain}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <GitHubLogoIcon className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={app.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    View Repository
                  </a>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      app.status === "running"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                    }`}
                  >
                    {app.status}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Created at: {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
