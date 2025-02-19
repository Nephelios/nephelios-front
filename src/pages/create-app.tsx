import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  GitHubLogoIcon,
  GlobeIcon,
  RocketIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
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
import Confetti from "react-confetti";
import "ldrs/ring";
import { Progress } from "@/components/ui/progress";

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
import "ldrs/ring";
import "ldrs/leapfrog";

export default function CreateApp() {
  const { toast } = useToast();
  const [isDeploying, setIsDeploying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appData, setAppData] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [visibleSteps, setVisibleSteps] = useState<string[]>([]);
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
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  }

  useEffect(() => {
    const backendUrl =
      process.env.REACT_APP_NEPHELIOS_BACKEND_WEBSOCKET_URL || "localhost";
    const backendPort = process.env.REACT_APP_NEPHELIOS_BACKEND_PORT || "3030";
    const wsUrl = `ws://${backendUrl}:${backendPort}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log("WebSocket connected");

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("WebSocket message received:", message);

      if (message.status === "in_progress") {
        setVisibleSteps((prev) => [...prev, message.step]);
      } else if (message.status === "success") {
        setCompletedSteps((prev) => new Set(prev.add(message.step)));

      } else if (message.status === "deployed" && message.step === "deployed_info") {
        setTimeout(() => {
          ws.close();
          setVisibleSteps([]);
          setCompletedSteps(new Set());
          setAppData(message.app_deployed);
          console.log(message.app_deployed)
          setShowConfetti(true);
          setIsDeploying(false);
        }, 2000);


      }
    }

    ws.onclose = () => console.log("WebSocket   disconnected");
    ws.onerror = (error) => console.error("WebSocket error:", error);

    return () => {};
  }, []);

  const deploymentSteps = [
    "Cloning repository",
    "Building Docker image",
    "Starting deployment",
  ];

  return (
    <div className="container mx-auto py-10">
      {error ? (
        <ServerNotFound />
      ) : (
        <>
          {isDeploying ? (
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold">
                Deploying {form.getValues("app_name")} application 🚀
                <Progress
                  className="mt-3"
                  value={(completedSteps.size / 3) * 100}
                  max={100}
                />
              </h2>

              <div className="mt-8 space-y-4 flex flex-col">
                {deploymentSteps.map((step, index) =>
                  visibleSteps.includes(step) ? (
                    <div key={index} className="flex items-center">
                      <div className="flex items-center">
                        <div className="mr-2">
                          {completedSteps.has(step) ? (
                            <CheckIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <l-ring
                              size="15"
                              stroke="2"
                              bg-opacity="0"
                              speed="2"
                              color="black"
                            ></l-ring>
                          )}
                        </div>
                        <span
                          className={`transition-colors duration-500 ${
                            completedSteps.has(step)
                              ? "text-gray-400"
                              : "text-black font-bold"
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          ) : (
            <>
              {showConfetti && (
                <Confetti
                  width={window.innerWidth}
                  height={window.innerHeight}
                  numberOfPieces={200}
                  recycle={false}
                />
              )}
              {appData ? (
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
