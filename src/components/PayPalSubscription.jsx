import React, { useEffect } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { message } from "antd";

const PayPalSubscription = ({ onSuccess }) => {
  const createSubscription = async (data, actions) => {
    return actions.subscription.create({
      plan_id: import.meta.env.VITE_PAYPAL_PLAN_ID, // You'll need to create this in PayPal
    });
  };

  const onApprove = async (data, actions) => {
    const user = auth.currentUser;
    if (!user) {
      message.error("Please sign in to complete subscription");
      return;
    }

    try {
      // Calculate subscription end date (1 month from now)
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

      // Update user document with subscription info
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          subscriptionStatus: "pro",
          subscriptionId: data.subscriptionID,
          subscriptionEndDate: subscriptionEndDate,
          isTrialExpired: true, // Mark trial as expired when becoming pro
          lastUpdated: new Date(),
        },
        { merge: true }
      );

      message.success("Subscription activated successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Error updating subscription:", error);
      message.error("Failed to activate subscription");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Upgrade to Pro
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          $1/month - Access all features
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-green-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-gray-700 dark:text-gray-200">
            Unlimited Custom Pages
          </span>
        </div>
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-green-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-gray-700 dark:text-gray-200">
            All Premium Widgets
          </span>
        </div>
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-green-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-gray-700 dark:text-gray-200">
            Priority Support
          </span>
        </div>
      </div>

      <PayPalButtons
        createSubscription={createSubscription}
        onApprove={onApprove}
        style={{
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "subscribe",
        }}
      />
    </div>
  );
};

export default PayPalSubscription;
