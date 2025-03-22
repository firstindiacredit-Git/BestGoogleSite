import React from "react";
import { Row, Col } from "antd";
const SkeletonCard = ({ isListView }) => {
  if (isListView) {
    return (
      <div className="animate-pulse flex items-center p-4 bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] rounded-lg shadow-sm">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="ml-4 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="animate-pulse bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)] p-4 rounded-xl shadow-sm">
      <div className="flex flex-col ">
        <div className="w-12 h-12 bg-gray-200/[var(--widget-opacity)] dark:bg-gray-700/[var(--widget-opacity)] rounded-lg mb-3"></div>
        <div className="flex flex-col gap-2">
          <div className="h-8 bg-gray-200/[var(--widget-opacity)] dark:bg-gray-700/[var(--widget-opacity)] rounded"></div>
          <div className="h-8 bg-gray-200/[var(--widget-opacity)] dark:bg-gray-700/[var(--widget-opacity)] rounded"></div>
          <div className="h-8 bg-gray-200/[var(--widget-opacity)] dark:bg-gray-700/[var(--widget-opacity)] rounded"></div>
        </div>
      </div>
    </div>
  );
};

const SkeletonLoader = ({ count = 100, isListView = false }) => {
  if (isListView) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {[...Array(count)].map((_, index) => (
          <div key={index}>
            <SkeletonCard isListView={true} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {[...Array(count)].map((_, index) => (
        <Col xs={24} sm={12} lg={8} key={index}>
          <SkeletonCard key={index} isListView={false} />
        </Col>
      ))}
    </Row>
  );
};

export default SkeletonLoader;
