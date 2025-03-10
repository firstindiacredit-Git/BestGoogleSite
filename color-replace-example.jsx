/**
 * This is an example file to demonstrate the color replacement patterns
 *
 * BEFORE running the color-replace.js script:
 */

// Example component with hardcoded color values
const ExampleComponent = () => {
  return (
    <div className="min-h-screen">
      {/* Primary color examples */}
      <div className="bg-white dark:bg-[#28283a] p-4 rounded-lg">
        <h2 className="text-xl font-bold">Primary Color Background</h2>
      </div>

      <div className="bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)] backdrop-blur-sm p-4 rounded-lg">
        <h2 className="text-xl font-bold">Primary Color with Opacity</h2>
      </div>

      <div className="border border-gray-200 dark:border-[#28283a] p-4 rounded-lg">
        <h2 className="text-xl font-bold">Primary Color Border</h2>
      </div>

      <div className="text-gray-800 dark:text-[#28283a] p-4 rounded-lg">
        <h2 className="text-xl font-bold">Primary Color Text</h2>
      </div>

      {/* Secondary color examples */}
      <div className="bg-white dark:bg-[#513a7a] p-4 rounded-lg">
        <h2 className="text-xl font-bold">Secondary Color Background</h2>
      </div>

      <div className="bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] backdrop-blur-sm p-4 rounded-lg">
        <h2 className="text-xl font-bold">Secondary Color with Opacity</h2>
      </div>

      <div className="border border-gray-200 dark:border-[#513a7a] p-4 rounded-lg">
        <h2 className="text-xl font-bold">Secondary Color Border</h2>
      </div>

      <div className="text-gray-800 dark:text-[#513a7a] p-4 rounded-lg">
        <h2 className="text-xl font-bold">Secondary Color Text</h2>
      </div>

      {/* CSS style examples */}
      <div
        style={{
          background: "#28283a",
          color: "white",
          padding: "1rem",
          borderRadius: "0.5rem",
        }}
      >
        <h2 className="text-xl font-bold">Primary Color Inline Style</h2>
      </div>

      <div
        style={{
          background: "#513a7a",
          color: "white",
          padding: "1rem",
          borderRadius: "0.5rem",
        }}
      >
        <h2 className="text-xl font-bold">Secondary Color Inline Style</h2>
      </div>

      <div
        style={{
          borderColor: "#28283a",
          borderWidth: "2px",
          padding: "1rem",
          borderRadius: "0.5rem",
        }}
      >
        <h2 className="text-xl font-bold">Primary Color Border Style</h2>
      </div>

      <div
        style={{ color: "#513a7a", padding: "1rem", borderRadius: "0.5rem" }}
      >
        <h2 className="text-xl font-bold">Secondary Color Text Style</h2>
      </div>
    </div>
  );
};

/**
 * AFTER running the color-replace.js script, the code should look like this:
 *
 * const ExampleComponent = () => {
 *   return (
 *     <div className="min-h-screen">
 *       <div className="bg-white dark:bg-primary p-4 rounded-lg">
 *         <h2 className="text-xl font-bold">Primary Color Background</h2>
 *       </div>
 *
 *       <div className="bg-white/[var(--widget-opacity)] dark:bg-primary/[var(--widget-opacity)] backdrop-blur-sm p-4 rounded-lg">
 *         <h2 className="text-xl font-bold">Primary Color with Opacity</h2>
 *       </div>
 *
 *       <div className="border border-gray-200 dark:border-primary p-4 rounded-lg">
 *         <h2 className="text-xl font-bold">Primary Color Border</h2>
 *       </div>
 *
 *       <div className="text-gray-800 dark:text-primary p-4 rounded-lg">
 *         <h2 className="text-xl font-bold">Primary Color Text</h2>
 *       </div>
 *
 *       <div className="bg-white dark:bg-secondary p-4 rounded-lg">
 *         <h2 className="text-xl font-bold">Secondary Color Background</h2>
 *       </div>
 *
 *       <div className="bg-white/[var(--widget-opacity)] dark:bg-secondary/[var(--widget-opacity)] backdrop-blur-sm p-4 rounded-lg">
 *         <h2 className="text-xl font-bold">Secondary Color with Opacity</h2>
 *       </div>
 *
 *       <div className="border border-gray-200 dark:border-secondary p-4 rounded-lg">
 *         <h2 className="text-xl font-bold">Secondary Color Border</h2>
 *       </div>
 *
 *       <div className="text-gray-800 dark:text-secondary p-4 rounded-lg">
 *         <h2 className="text-xl font-bold">Secondary Color Text</h2>
 *       </div>
 *
 *       <div style={{ background: 'var(--primary-color)', color: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
 *         <h2 className="text-xl font-bold">Primary Color Inline Style</h2>
 *       </div>
 *
 *       <div style={{ background: 'var(--secondary-color)', color: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
 *         <h2 className="text-xl font-bold">Secondary Color Inline Style</h2>
 *       </div>
 *
 *       <div style={{ borderColor: 'var(--primary-color)', borderWidth: '2px', padding: '1rem', borderRadius: '0.5rem' }}>
 *         <h2 className="text-xl font-bold">Primary Color Border Style</h2>
 *       </div>
 *
 *       <div style={{ color: 'var(--secondary-color)', padding: '1rem', borderRadius: '0.5rem' }}>
 *         <h2 className="text-xl font-bold">Secondary Color Text Style</h2>
 *       </div>
 *     </div>
 *   );
 * };
 */

export default ExampleComponent;
