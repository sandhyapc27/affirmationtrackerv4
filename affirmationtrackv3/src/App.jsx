import { useState } from "react";
import HomeScreen from "./HomeScreen";
import OnboardingFlow from "./OnboardingFlow";
import Paywall from "./Paywall";

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
  const [screen, setScreen] = useState(() => (shouldShowOnboarding() ? "onboarding" : "home"));

  const finishOnboarding = () => {
    setScreen("paywall");
  };

  const finishPaywall = () => {
    try {
      localStorage.setItem(ONBOARDING_DONE_KEY, "true");
    } catch {
      /* ignore */
    }
    setScreen("home");
  };

  if (screen === "onboarding") {
    return <OnboardingFlow onComplete={finishOnboarding} />;
  }

  if (screen === "paywall") {
    return <Paywall onContinue={finishPaywall} onSkip={finishPaywall} />;
  }

  return <HomeScreen />;
}

export default App;
