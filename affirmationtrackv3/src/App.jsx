import { useState } from "react";
import HomeScreen from "./HomeScreen";
import OnboardingFlow from "./OnboardingFlow";

const ONBOARDING_DONE_KEY = "neuroaffirm_onboarding_done";

function shouldShowOnboarding() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("onboarding") || params.has("reset-onboarding")) {
      localStorage.removeItem(ONBOARDING_DONE_KEY);
      return true;
    }
    return localStorage.getItem(ONBOARDING_DONE_KEY) !== "true";
  } catch {
    return true;
  }
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(() => shouldShowOnboarding());

  const finishOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_DONE_KEY, "true");
    } catch {
      /* ignore */
    }
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={finishOnboarding} />;
  }

  return <HomeScreen />;
}

export default App;
