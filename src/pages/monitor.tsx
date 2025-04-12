import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

export default function Monitor() {


    return (
        <div className="flex flex-col w-full justify-center items-center">

            <Card allowPress={false} className="mb-4">
                <CardHeader>
                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <CardTitle>Nephelios backend metrics</CardTitle>
                            <CardDescription>
                                Real-time performance metrics for the Nephelios backend
                            </CardDescription>
                        </div>
                        <div className="mb-4">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.open('http://localhost:3000', '_blank');
                                }}
                                className="flex items-center font-normal"
                                variant={"ghost"}
                            >
                                <ExternalLinkIcon className="mr-2" /> Check all metrics on Grafana
                            </Button>
                        </div>
                    </div>

                </CardHeader>
                <CardContent>
                    <iframe src="http://localhost:3000/d-solo/aLuzOYANk/nephelios-backend??orgId=1&refresh=5s&panelId=2&theme=light&panelId=2" width="650" height="350" frameborder="0" className="mb-4"></iframe>


                </CardContent>
            </Card>

            <Card allowPress={false}>
                <CardHeader>
                    <CardTitle>All nephelios stacks</CardTitle>
                    <CardDescription>
                        Real-time performance metrics for all nephelios stacks
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <iframe src="http://localhost:3000/d-solo/aLuzOYANk/nephelios-backend?orgId=1&refresh=5s&theme=light&panelId=4" width="650" height="350" frameborder="0" className="mb-4"></iframe>
                </CardContent>
            </Card>



        </div>
    );
}