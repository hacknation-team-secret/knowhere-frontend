import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingFlow } from "@/onboarding/OnboardingFlow";
import { hasBridge } from "@/cityApp/bridge";

const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (hasBridge()) {
      navigate("/app", { replace: true });
    }
  }, [navigate]);
  return <OnboardingFlow />;
};

export default Index;
