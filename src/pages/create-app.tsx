import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  GitHubLogoIcon,
  GlobeIcon,
  RocketIcon,
  CheckIcon,
  PlusIcon,
  Pencil1Icon,
  ChevronDownIcon,
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ServerNotFound from "@/components/ui/ServerNotFound";
import Confetti from "react-confetti";
import "ldrs/ring";
import { Progress } from "@/components/ui/progress";

const dockerImageNameRegex = /^[a-z0-9._-]+$/;

// Extended schema with build settings
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
  app_workdir: z.string().optional(),
  build_command: z.string().optional(),
  run_command: z.string().optional(),
  install_command: z.string().optional(),
  additionalInputs: z
    .array(
      z.object({
        key: z.string().optional(),
        value: z.string().optional(),
      })
    )
    .optional(),
});

import "ldrs/ring";
import "ldrs/leapfrog";

export default function CreateApp() {
  const { toast } = useToast();
  const [isDeploying, setIsDeploying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState(null);
  const [appData, setAppData] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [additionalInputs, setAdditionalInputs] = useState([]);
  const [isBuildSettingsOpen, setIsBuildSettingsOpen] = useState(false);
  const [isEnvVariablesOpen, setIsEnvVariablesOpen] = useState(false);
  const navigate = useNavigate();
  const [isStartCommandEditable, setisStartCommandEditable] = useState(false);
  const [isBuildCommandEditable, setIsBuildCommandEditable] =
    useState(false);
  const [isWorkdirEditable, setIsWorkdirEditable] = useState(false);
  const [isInstallCommandEditable, setIsInstallCommandEditable] =
    useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      app_name: "",
      app_type: "",
      github_url: "",
      app_workdir: "/",
      build_command: "npm run build",
      run_command: "npm run start",
      install_command: "npm install",
      additionalInputs: [],
    },
  });

  const addNewInput = () => {
    setAdditionalInputs([...additionalInputs, { key: "", value: "" }]);
  };

  const removeInput = (index) => {
    const updatedInputs = [...additionalInputs];
    updatedInputs.splice(index, 1);
    setAdditionalInputs(updatedInputs);
  };

  const updateInputValue = (index, field, value) => {
    const updatedInputs = [...additionalInputs];
    updatedInputs[index][field] = value;
    setAdditionalInputs(updatedInputs);

    // Update the form values
    const currentValues = form.getValues();
    currentValues.additionalInputs = updatedInputs;
    form.setValue("additionalInputs", updatedInputs);
  };

  async function onSubmit(values) {
    setIsDeploying(true);

    const submissionData = {
      ...values,
      additionalInputs: values.additionalInputs || additionalInputs,
    };

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
        body: JSON.stringify(submissionData),
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

      if (message.status === "in_progress") {
        setVisibleSteps((prev) => [...prev, message.step]);
      } else if (message.status === "success") {
        setCompletedSteps((prev) => new Set(prev.add(message.step)));
      } else if (
        message.status === "deployed" &&
        message.step === "deployed_info"
      ) {
        setTimeout(() => {
          ws.close();
          setVisibleSteps([]);
          setCompletedSteps(new Set());
          setAppData(message.app_deployed);
          setShowConfetti(true);
          setIsDeploying(false);
        }, 2000);
      }
    };

    ws.onclose = () => console.log("WebSocket disconnected");
    ws.onerror = (error) => console.error("WebSocket error:", error);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
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
                          className={`transition-colors duration-500 ${completedSteps.has(step)
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
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${appData.status === "running"
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
                          navigate(`/apps/${appData.swarm_task_name}`, {
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

                        <Collapsible
                          open={isBuildSettingsOpen}
                          onOpenChange={setIsBuildSettingsOpen}
                          className="border rounded-md"
                        >
                          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 transition-transform duration-300">
                            <div className="flex items-center gap-2 font-medium">
                              <ChevronDownIcon
                                className={`h-4 w-4 transform transition-transform duration-300 ${isBuildSettingsOpen ? "rotate-180" : ""
                                  }`}
                              />
                              Advanced Build Settings
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-4 pb-4 pt-0 space-y-4 transition-transform duration-300 transform">

                            <FormField
                              control={form.control}
                              name="app_workdir"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center justify-between">
                                    <FormLabel>Working Directory</FormLabel>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <FormDescription className="mt-0 mr-1">
                                        ⓘ
                                      </FormDescription>
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <FormControl>
                                      <Input
                                        placeholder="/"
                                        {...field}
                                        readOnly={!isWorkdirEditable}
                                        className={`${!isWorkdirEditable
                                          ? "cursor-not-allowed bg-gray-100"
                                          : ""
                                          }`}
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-2 top-2 h-5 w-5 text-muted-foreground"
                                      onClick={() =>
                                        setIsWorkdirEditable(
                                          !isWorkdirEditable
                                        )
                                      }
                                    >
                                      <span>
                                        <Pencil1Icon className="h-4 w-4" />
                                      </span>
                                    </Button>
                                  </div>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="run_command"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center justify-between">
                                    <FormLabel>Run Command</FormLabel>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <FormDescription className="mt-0 mr-1">
                                        ⓘ
                                      </FormDescription>
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <FormControl>
                                      <Input
                                        placeholder="'yarn start', 'bun start' ..."
                                        {...field}
                                        readOnly={!isStartCommandEditable}
                                        className={`${!isStartCommandEditable
                                          ? "cursor-not-allowed bg-gray-100"
                                          : ""
                                          }`}
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-2 top-2 h-5 w-5 text-muted-foreground"
                                      onClick={() =>
                                        setisStartCommandEditable(
                                          !isStartCommandEditable
                                        )
                                      }
                                    >
                                      <span>
                                        <Pencil1Icon />
                                      </span>
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="install_command"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center justify-between">
                                    <FormLabel>Install Command</FormLabel>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <FormDescription className="mt-0 mr-1">
                                        ⓘ
                                      </FormDescription>
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <FormControl>
                                      <Input
                                        placeholder="'yarn install', 'pnpm install', 'npm install', 'bun install' ..."
                                        {...field}
                                        readOnly={!isInstallCommandEditable}
                                        className={`${!isInstallCommandEditable
                                          ? "cursor-not-allowed bg-gray-100"
                                          : ""
                                          }`}
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-2 top-2 h-5 w-5 text-muted-foreground"
                                      onClick={() =>
                                        setIsInstallCommandEditable(
                                          !isInstallCommandEditable
                                        )
                                      }
                                    >
                                      <span>
                                        <Pencil1Icon className="h-4 w-4" />
                                      </span>
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="build_command"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center justify-between">
                                    <FormLabel>Build Command</FormLabel>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <FormDescription className="mt-0 mr-1">
                                        ⓘ
                                      </FormDescription>
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <FormControl>
                                      <Input
                                        placeholder="'yarn build', 'pnpm build', 'npm build', 'bun build' ..."
                                        readOnly={!isBuildCommandEditable}
                                        className={`${!isBuildCommandEditable
                                          ? "cursor-not-allowed bg-gray-100"
                                          : ""
                                          }`}
                                        {...field}
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-2 top-2 h-5 w-5 text-muted-foreground"
                                      onClick={() =>
                                        setIsBuildCommandEditable(
                                          !isBuildCommandEditable
                                        )
                                      }
                                    >
                                      <span>
                                        <Pencil1Icon className="h-4 w-4" />
                                      </span>
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CollapsibleContent>
                        </Collapsible>

                        <Collapsible
                          open={isEnvVariablesOpen}
                          onOpenChange={setIsEnvVariablesOpen}
                          className="border rounded-md"
                        >
                          <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                            <div className="flex items-center gap-2 font-medium">
                              <ChevronDownIcon
                                className={`h-4 w-4 transform transition-transform duration-300 ${isEnvVariablesOpen ? "rotate-180" : ""
                                  }`}
                              />
                              Environment Variables
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-4 pb-4 pt-0 space-y-4">
                            {additionalInputs.map((input, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-2 gap-4"
                              >
                                <FormItem>
                                  <FormLabel>Key</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="EXAMPLE_NAME"
                                      value={input.key}
                                      onChange={(e) =>
                                        updateInputValue(
                                          index,
                                          "key",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                                <div className="flex items-end gap-2">
                                  <FormItem className="flex-1">
                                    <FormLabel>Value</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Value"
                                        value={input.value}
                                        onChange={(e) =>
                                          updateInputValue(
                                            index,
                                            "value",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </FormControl>
                                  </FormItem>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="mb-1"
                                    onClick={() => removeInput(index)}
                                  >
                                    −
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={addNewInput}
                            >
                              <PlusIcon className="mr-2 h-4 w-4" />
                              Add More
                            </Button>
                          </CollapsibleContent>
                        </Collapsible>

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
