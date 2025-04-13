import AppMetrics from "@/components/app-metrics";
import { App } from "./dashboard";

export default function Monitor() {
    const app: App = {
        container_id: "",
        app_name: "nephelios",
        app_type: "",
        domain: "",
        github_url: "",
        swarm_task_name: "nephelios",
        status: "",
        created_at: "",
    };

    return (
        <div className="flex flex-col w-full justify-center items-center">
            <AppMetrics app={app} />
        </div>
    );
}