import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { App } from "@/pages/dashboard";
import { ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

export default function AppMetrics({ app }: { app: App }) {
    return (
        <Card allowPress={false} className="w-full">
            <CardHeader>
                <CardTitle>Metrics</CardTitle>
                <CardDescription>
                    Real-time performance metrics for {app.app_name}
                </CardDescription>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            window.open(`http://localhost:3000`, "_blank");
                        }}
                        className="flex items-center"
                        variant={"outline"}
                    >
                        <ExternalLinkIcon className="mr-2" /> Open Grafana
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="cpu" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="cpu">CPU</TabsTrigger>
                        <TabsTrigger value="memory">Memory</TabsTrigger>
                        <TabsTrigger value="network">Network</TabsTrigger>
                    </TabsList>
                    <TabsContent value="cpu" className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <iframe src={`http://localhost:3000/d-solo/aLuzOYANk?orgId=1&var-app_name=${app.swarm_task_name}&refresh=5s&theme=light&panelId=12`} width="100%" height="100%" frameBorder="0"></iframe>
                        </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="memory" className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <iframe src={`http://localhost:3000/d-solo/aLuzOYANk?orgId=1&var-app_name=${app.swarm_task_name}&refresh=5s&theme=light&panelId=10`} width="100%" height="100%" frameBorder="0"></iframe>
                        </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="network" className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <iframe src={`http://localhost:3000/d-solo/aLuzOYANk?orgId=1&var-app_name=${app.swarm_task_name}&refresh=5s&theme=light&panelId=8`} width="100%" height="100%" frameBorder="0"></iframe>
                        </ResponsiveContainer>
                    </TabsContent>
                </Tabs>

            </CardContent>
        </Card>
    );
}