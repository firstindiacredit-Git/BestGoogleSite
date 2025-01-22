import React, { useState } from "react";
import { useSubscription } from "../hooks/useSubscription";
import TrialExpiredModal from "./TrialExpiredModal";

export const withSubscriptionCheck = (WrappedComponent) => {
  return function SubscriptionProtectedComponent(props) {
    const { canUseFeature, isTrialExpired, trialDaysLeft } = useSubscription();
    const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);

    // Show trial days remaining notification
    const showTrialNotification = () => {
      if (trialDaysLeft && trialDaysLeft <= 5) {
        return (
          <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-md text-sm mb-4">
            {trialDaysLeft === 0
              ? "Your trial expires today!"
              : `${trialDaysLeft} days left in your trial`}
          </div>
        );
      }
      return null;
    };

    // If user can't use feature, show trial expired modal
    const handleRestrictedAction = () => {
      setShowTrialExpiredModal(true);
    };

    if (!canUseFeature()) {
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Feature Locked</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This feature is only available to trial and pro users.
          </p>
          <button
            onClick={handleRestrictedAction}
            className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors"
          >
            Upgrade to Pro
          </button>
          <TrialExpiredModal
            isVisible={showTrialExpiredModal}
            onClose={() => setShowTrialExpiredModal(false)}
          />
        </div>
      );
    }

    return (
      <>
        {showTrialNotification()}
        <WrappedComponent {...props} />
      </>
    );
  };
};
