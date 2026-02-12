import { getIndexConfig } from "@/app/actions/index-config";
import { IndexConfigForm } from "@/components/settings/index-config-form";

export default async function IndexConfigPage() {
    const initialWeights = await getIndexConfig();

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="max-w-4xl mx-auto mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                    Portfolio Logic Center
                </h1>
                <p className="text-zinc-400 text-lg">
                    Tune the algorithm that drives your investment insights.
                </p>
            </div>
            <IndexConfigForm
                initialWeights={{
                    runway: initialWeights.weightRunway,
                    sentiment: initialWeights.weightSentiment,
                    pipeline: initialWeights.weightPipeline,
                }}
            />
        </div>
    );
}
