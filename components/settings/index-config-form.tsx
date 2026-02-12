'use client';

import { useState, useTransition } from "react";
import { updateIndexConfig } from "@/app/actions/index-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

type IndexConfigProps = {
    initialWeights: {
        runway: number;
        sentiment: number;
        pipeline: number;
    };
};

export function IndexConfigForm({ initialWeights }: IndexConfigProps) {
    const [weights, setWeights] = useState(initialWeights);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const total = weights.runway + weights.sentiment + weights.pipeline;
    const isValid = total === 100;

    const handleChange = (key: keyof typeof weights, value: number[]) => {
        setWeights((prev) => ({ ...prev, [key]: value[0] }));
    };

    const handleSave = () => {
        if (!isValid) return;
        setError(null);
        startTransition(async () => {
            try {
                await updateIndexConfig(weights);
            } catch (e) {
                setError("Failed to save configuration. Ensure weights sum to 100.");
            }
        });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    RealSME Index Configuration
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    Adjust the weighting factors for the Portfolio Health Score (0-100).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

                {/* Runway Weight */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-lg font-medium">Runway Weight</Label>
                        <span className="text-xl font-bold text-emerald-400">{weights.runway}%</span>
                    </div>
                    <Slider
                        defaultValue={[weights.runway]}
                        max={100}
                        step={5}
                        value={[weights.runway]}
                        onValueChange={(val) => handleChange("runway", val)}
                        className="cursor-pointer"
                    />
                    <p className="text-sm text-zinc-500">
                        Impact of cash runway (days remaining) on the final score.
                    </p>
                </div>

                {/* Sentiment Weight */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-lg font-medium">Sentiment Weight</Label>
                        <span className="text-xl font-bold text-blue-400">{weights.sentiment}%</span>
                    </div>
                    <Slider
                        defaultValue={[weights.sentiment]}
                        max={100}
                        step={5}
                        value={[weights.sentiment]}
                        onValueChange={(val) => handleChange("sentiment", val)}
                        className="cursor-pointer"
                    />
                    <p className="text-sm text-zinc-500">
                        Impact of weekly subjective sentiment scores (1-10) from founders.
                    </p>
                </div>

                {/* Pipeline Weight */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-lg font-medium">Pipeline Weight</Label>
                        <span className="text-xl font-bold text-purple-400">{weights.pipeline}%</span>
                    </div>
                    <Slider
                        defaultValue={[weights.pipeline]}
                        max={100}
                        step={5}
                        value={[weights.pipeline]}
                        onValueChange={(val) => handleChange("pipeline", val)}
                        className="cursor-pointer"
                    />
                    <p className="text-sm text-zinc-500">
                        Impact of sales pipeline status (Low/Normal/Good).
                    </p>
                </div>

                {/* Total Validation */}
                <div className={`p-4 rounded-lg border ${isValid ? 'border-emerald-900 bg-emerald-950/30' : 'border-red-900 bg-red-950/30'} flex justify-between items-center`}>
                    <span className="font-medium">Total Allocation</span>
                    <span className={`text-2xl font-bold ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                        {total}%
                    </span>
                </div>
                {!isValid && (
                    <p className="text-red-400 text-sm text-center">Total must equal 100%.</p>
                )}
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            </CardContent>
            <CardFooter>
                <Button
                    className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                    size="lg"
                    onClick={handleSave}
                    disabled={!isValid || isPending}
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? "Saving..." : "Update Configuration"}
                </Button>
            </CardFooter>
        </Card>
    );
}
