import React from "react";
import { Modal } from "antd";
import PayPalSubscription from "./PayPalSubscription";

const TrialExpiredModal = ({ isVisible, onClose }) => {
  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      title={
        <div className="text-center">
          <h3 className="text-xl font-bold">Trial Period Ended</h3>
        </div>
      }
    >
      <div className="py-4">
        <div className="text-center mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Your 30-day trial has expired. Upgrade to Pro to continue using all
            features.
          </p>
        </div>

        <PayPalSubscription onSuccess={onClose} />
      </div>
    </Modal>
  );
};

export default TrialExpiredModal;
