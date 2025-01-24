import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);

  useEffect(() => {
    const checkSubscription = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSubscriptionStatus(userData.subscriptionStatus);

          // Calculate days left in trial if user is in trial period
          if (
            userData.subscriptionStatus === "trial" &&
            userData.trialEndDate
          ) {
            const trialEnd = userData.trialEndDate.toDate();
            const now = new Date();
            const daysLeft = Math.ceil(
              (trialEnd - now) / (1000 * 60 * 60 * 24)
            );
            setTrialDaysLeft(Math.max(0, daysLeft));
          }
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkSubscription();
      } else {
        setSubscriptionStatus(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const canUseFeature = () => {
    if (!subscriptionStatus) return false;
    return ["trial", "pro", "admin"].includes(subscriptionStatus);
  };

  return {
    subscriptionStatus,
    isLoading,
    trialDaysLeft,
    canUseFeature,
    isTrialExpired: subscriptionStatus === "expired",
    isPro: subscriptionStatus === "pro",
    isAdmin: subscriptionStatus === "admin",
  };
};
