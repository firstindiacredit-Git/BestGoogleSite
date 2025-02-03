import React, { useEffect } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { message, Spin } from "antd";

const PayPalSubscription = ({ onSuccess }) => {
  const [{ isInitial, isPending, isRejected, isResolved }] =
    usePayPalScriptReducer();

  useEffect(() => {
    console.log("PayPal Script Status:", {
      isInitial,
      isPending,
      isRejected,
      isResolved,
    });
    if (isRejected) {
      console.error("PayPal script load rejected");
      message.error("Failed to load PayPal. Please refresh and try again.");
    }
  }, [isInitial, isPending, isRejected, isResolved]);

  const createSubscription = (data, actions) => {
    const planId = import.meta.env.VITE_PAYPAL_PLAN_ID;
    console.log("Attempting to create subscription with plan ID:", planId);

    if (!planId) {
      console.error("PayPal Plan ID is missing");
      message.error("Configuration error: Plan ID is missing");
      return Promise.reject(new Error("Plan ID is missing"));
    }

    return actions.subscription
      .create({
        plan_id: planId,
        application_context: {
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          brand_name: "AllMyTab",
        },
      })
      .then((orderId) => {
        console.log("Subscription created successfully:", orderId);
        return orderId;
      })
      .catch((err) => {
        console.error("Subscription creation error details:", {
          error: err,
          planId: planId,
          message: err.message,
        });
        message.error("Failed to create subscription. Please try again.");
        throw err;
      });
  };

  const onApprove = async (data, actions) => {
    console.log("Subscription approved:", data);
    const user = auth.currentUser;
    if (!user) {
      message.error("Please sign in to complete subscription");
      return;
    }

    try {
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          subscriptionStatus: "pro",
          subscriptionId: data.subscriptionID,
          subscriptionEndDate: subscriptionEndDate,
          isTrialExpired: true,
          lastUpdated: new Date(),
          paypalSubscriptionId: data.subscriptionID,
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

  const onError = (err) => {
    console.error("PayPal error:", err);
    message.error("PayPal encountered an error. Please try again.");
  };

  if (isInitial || isPending) {
    return (
      <div className="flex justify-center items-center p-4">
        <Spin size="large" tip="Loading PayPal..." />
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="text-red-500 text-center p-4">
        Failed to load PayPal. Please refresh the page and try again.
      </div>
    );
  }

  return (
    <div className="w-full">
      <PayPalButtons
        createSubscription={createSubscription}
        onApprove={onApprove}
        onError={onError}
        style={{
          shape: "pill",
          color: "blue",
          layout: "vertical",
          label: "subscribe",
        }}
      />
    </div>
  );
};

export default PayPalSubscription;
