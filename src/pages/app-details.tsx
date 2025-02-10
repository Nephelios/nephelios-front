import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  GitHubLogoIcon,
  GlobeIcon,
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
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import ServerNotFound from "@/components/ui/ServerNotFound";

const generateMockMetrics = () =>
  Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    network: Math.random() * 1000,
  }));

export default function AppDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const app = location.state;

  const [metrics, setMetrics] = useState(generateMockMetrics);

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

  if (!app) {
    return <ServerNotFound />;
  }

  return (
    <div className="container mx-auto py-10 px-10">
      <div className="grid gap-6">
        <Card allowPress={false}>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-between">
              {app.app_name}{" "}
              <Button
                onClick={() => navigate(-1)}
                className="flex items-center"
              >
                <ArrowLeftIcon className="mr-2" /> Back
              </Button>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metrics</CardTitle>
            <CardDescription>
              Real-time performance metrics for your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cpu" className="space-y-4">
              <TabsList>
                <TabsTrigger value="cpu">CPU Usage</TabsTrigger>
                <TabsTrigger value="memory">Memory Usage</TabsTrigger>
                <TabsTrigger value="network">Network Load</TabsTrigger>
              </TabsList>
              <TabsContent value="cpu" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cpu"
                      stroke="hsl(var(--chart-1))"
                      name="CPU Usage"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="memory" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="memory"
                      stroke="hsl(var(--chart-2))"
                      name="Memory Usage"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="network" className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis unit="KB/s" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="network"
                      stroke="hsl(var(--chart-3))"
                      name="Network Load"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
