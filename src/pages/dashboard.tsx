import { Link, useNavigate } from "react-router-dom";
import { EyeOpenIcon, GitHubLogoIcon, GlobeIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock data - replace with actual data from your backend
const apps = [
  {
    id: "1",
    name: "landy",
    type: "nodejs",
    url: "https://landy.nephelios.dev",
    githubUrl: "https://github.com/Adrinlol/landy-react-template",
    status: "running",
    lastDeployed: "2024-03-20T10:00:00Z",
  },
  // Add more mock apps as needed
];

export default function Dashboard() {
  const navigate = useNavigate();

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
            key={app.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/apps/${app.id}`)}
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>{app.name}</span>
              </CardTitle>
              <CardDescription>{app.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    {app.url}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <GitHubLogoIcon className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={app.githubUrl}
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
                    Last deployed:{" "}
                    {new Date(app.lastDeployed).toLocaleDateString()}
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
