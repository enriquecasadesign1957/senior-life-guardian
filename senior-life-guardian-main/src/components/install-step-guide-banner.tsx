import { ChevronRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InstallStep } from "@/lib/install-step";
import { inAppGuideForStep, installGuideActionUrl } from "@/lib/install-step-guide";

type Props = {
  step: InstallStep;
  signupId?: string | null;
  onDismiss?: () => void;
};

/** Coach in-app según install_step (hasta ready). */
export function InstallStepGuideBanner({ step, signupId, onDismiss }: Props) {
  const guide = inAppGuideForStep(step, signupId ?? undefined);
  if (!guide || step === "ready") return null;

  const openInstall = () => {
    if (!signupId) return;
    window.location.href = installGuideActionUrl(signupId);
  };

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
      <div className="flex gap-3 items-start">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Compass className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-foreground">{guide.title}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{guide.body}</p>
          {guide.cta && signupId && (
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 mt-2 text-primary font-semibold text-xs"
              onClick={openInstall}
            >
              {guide.cta}
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </Button>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-muted-foreground underline shrink-0"
          >
            Ocultar
          </button>
        )}
      </div>
    </div>
  );
}
