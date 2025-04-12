import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { z } from "zod";
import {
  ArrowLeftIcon,
  GitHubLogoIcon,
  GlobeIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import ServerNotFound from "@/components/ui/ServerNotFound";
import "ldrs/ring";

export default function AppDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const app = location.state;
  const [confirmAppName, setConfirmAppName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const appNameSchema = z.object({
    confirmAppName: z
      .string()
      .nonempty("App name is required for confirmation")
      .refine((value) => value === app.app_name, {
        message: "App name does not match. Deletion aborted.",
      }),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prevMetrics) => {
        const newMetrics = [...prevMetrics];
        newMetrics.push({
          time: `${newMetrics.length - 1}:00`,
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          network: Math.random() * 1000,
        });
        newMetrics.shift();
        return newMetrics;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (e: any) => {
    e.preventDefault();

    const result = appNameSchema.safeParse({ confirmAppName });
    if (result.success) {
      setIsLoading(true);

      const backendUrl =
        process.env.REACT_APP_NEPHELIOS_BACKEND_URL || "http://localhost";
      const backendPort =
        process.env.REACT_APP_NEPHELIOS_BACKEND_PORT || "3030";
      const url = `${backendUrl}:${backendPort}/remove`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ app_name: app.app_name }),
        });

        if (response.ok) {
          navigate("/");
        } else {
          setValidationError("An error occurred while deleting the app.");
        }
      } catch (error) {
        setValidationError("An error occurred while deleting the app.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setValidationError(result.error.errors[0].message);
    }
  };

  if (!app) {
    return <ServerNotFound />;
  }

  return (
    <div className="container mx-auto py-10 px-10">
      <div className="grid gap-6">
        <Card allowPress={false}>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold mr-2">{app.app_name}</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant={"destructive"} size={"sm"}>
                      <TrashIcon width={20} height={20} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the <strong>{app.app_name}</strong> application.
                      </AlertDialogDescription>
                      <Input
                        placeholder={`Type "${app.app_name}" to confirm`}
                        value={confirmAppName}
                        onChange={(e) => setConfirmAppName(e.target.value)}
                        className="mt-4"
                      />
                      {validationError && (
                        <p className="text-red-500 text-sm mt-2">
                          {validationError}
                        </p>
                      )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmAppName("")}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={confirmAppName !== app.app_name || isLoading}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <l-ring
                              size="15"
                              stroke="2"
                              bg-opacity="0"
                              speed="2"
                              color="black"
                            ></l-ring>
                          </div>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => navigate(-1)}
                  className="flex items-center"
                >
                  <ArrowLeftIcon className="mr-2" /> Back
                </Button>
              </div>
            </CardTitle>
            <CardDescription>Application Details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`https://${app.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
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
                    className="hover:underline"
                  >
                    View Repository
                  </a>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{app.app_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${app.status === "running"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                      }`}
                  >
                    {app.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Deployed:</span>
                  <span className="font-medium">
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card allowPress={false}>
          <CardHeader>
            <CardTitle>Metrics</CardTitle>
            <CardDescription>
              Real-time performance metrics for your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="metrics" className="space-y-4">
              <TabsList>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>
              <TabsContent value="metrics" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <iframe src={`http://localhost:3000/d-solo/aLuzOYANk?orgId=1&var-app_name=${app.swarm_task_name}&refresh=5s&theme=light&panelId=6`} width="450" height="200" frameborder="0"></iframe>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
