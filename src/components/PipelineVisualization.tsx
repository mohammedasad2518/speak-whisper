import { FileText, Wand2, Brain, Volume2, ChevronRight } from "lucide-react";

const steps = [
  { icon: FileText, label: "Input", desc: "Raw text" },
  { icon: Wand2, label: "Preprocess", desc: "Normalization" },
  { icon: Brain, label: "Inference", desc: "Neural TTS" },
  { icon: Volume2, label: "Output", desc: "Audio" },
];

interface PipelineVisualizationProps {
  activeStep?: number;
}

const PipelineVisualization = ({ activeStep = -1 }: PipelineVisualizationProps) => {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 py-6">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1 sm:gap-2">
          <div
            className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg transition-all duration-300 ${
              i <= activeStep
                ? "neural-border neural-glow gradient-neural"
                : "border border-border bg-card"
            }`}
          >
            <step.icon
              className={`h-5 w-5 transition-colors ${
                i <= activeStep ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span className="text-xs font-medium">{step.label}</span>
            <span className="text-[10px] text-muted-foreground">{step.desc}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight
              className={`h-4 w-4 flex-shrink-0 ${
                i < activeStep ? "text-primary" : "text-muted-foreground/40"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default PipelineVisualization;
