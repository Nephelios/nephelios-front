import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { GitHubLogoIcon, GlobeIcon, RocketIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ServerNotFound from "@/components/ui/ServerNotFound";
import FallingConfetti from "@/components/ui/FallingConfetti";

// Regular expression for valid Docker image names
const dockerImageNameRegex = /^[a-z0-9._-]+$/;

const formSchema = z.object({
  app_name: z
    .string()
    .nonempty("Application name is required")
    .regex(
      dockerImageNameRegex,
      "Invalid application name. Only lowercase letters, numbers, '.', '-', and '_' are allowed."
    ),
  app_type: z.string().nonempty("Application type is required"),
  github_url: z.string().url("Invalid GitHub URL"),
});

export default function CreateApp() {
  const { toast } = useToast();
  const [isDeploying, setIsDeploying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appData, setAppData] = useState<any>(null); // State to hold app data
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      app_name: "",
      app_type: "",
      github_url: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsDeploying(true);
    try {
      const backendUrl =
        process.env.REACT_APP_NEPHELIOS_BACKEND_URL || "http://localhost";
      const backendPort =
        process.env.REACT_APP_NEPHELIOS_BACKEND_PORT || "3030";
      const url = `${backendUrl}:${backendPort}/create`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        if (response.status === 503 || response.status === 504) {
          setError("Failed to reach the server.");
        } else {
          console.error("Error creating app:", response.statusText);
        }
        throw new Error("Failed to create app");
      }

      const data = await response.json();
      setShowConfetti(true);
      toast({
        title: "Deployment Started",
        description: `Deploying ${values.app_name} from ${values.github_url}`,
      });

      // Fetch the app data from the get-apps endpoint
      const appsResponse = await fetch(`${backendUrl}:${backendPort}/get-apps`);
      if (!appsResponse.ok) {
        throw new Error("Failed to fetch apps");
      }

      const appsData = await appsResponse.json();
      const createdApp = appsData.apps.find(
        (app: any) => app.app_name === values.app_name
      );

      if (createdApp) {
        setAppData(createdApp); // Store the created app data
      }

      // Set a timer to hide confetti after 4 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsDeploying(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      {error ? (
        <ServerNotFound />
      ) : (
        <>
          {isDeploying ? (
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold">
                Deploying your application...
              </h2>
              <div className="loader mt-4">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            </div>
          ) : (
            <>
              {showConfetti && <FallingConfetti />}
              {appData ? ( // Show recap card if appData is available
                <Card className="max-w-2xl mx-auto mb-4" allowPress={false}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RocketIcon className="h-6 w-6" />
                      Application Deployed!
                    </CardTitle>
                    <CardDescription>
                      Your application has been successfully deployed.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`https://${appData.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:underline"
                        >
                          {appData.domain}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitHubLogoIcon className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={appData.github_url}
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
                            appData.status === "running"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          }`}
                        >
                          {appData.status}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Created at:{" "}
                          {new Date(appData.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        onClick={() =>
                          navigate(`/apps/${appData.container_id}`, {
                            state: appData,
                          })
                        }
                        className="w-full"
                      >
                        View Application
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="max-w-2xl mx-auto" allowPress={false}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RocketIcon className="h-6 w-6" />
                      Deploy New Application
                    </CardTitle>
                    <CardDescription>
                      Deploy your application to Nephelios by providing the
                      required information below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={form.control}
                          name="app_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Application Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="my-awesome-app"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="app_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Application Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select application type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="nodejs">
                                    Node.js
                                  </SelectItem>
                                  <SelectItem value="python">Python</SelectItem>
                                  <SelectItem value="go">Go</SelectItem>
                                  <SelectItem value="rust">Rust</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="github_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GitHub Repository URL</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <GitHubLogoIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    className="pl-9"
                                    placeholder="https://github.com/username/repo"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isDeploying}
                        >
                          {isDeploying ? "Deploying..." : "Deploy Application"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
