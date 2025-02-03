import React, { useState } from 'react';
import axios from 'axios';
import { Back } from './back';

function BulkEmailSender() {
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('');

    const emailArray = emails.split(',').map(email => email.trim());

    try {
      const response = await axios.post('https://saasbackend.pizeonfly.com/send-email', {
        emails: emailArray,
        subject: subject,
        message: message
      });

      if (response.data.success) {
        alert('Emails sent successfully!');
        window.location.reload();
      } else {
        setStatusMessage('Failed to send emails.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setStatusMessage('Error occurred while sending emails.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-2 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="relative p-4 sm:p-6">
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
              <Back />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-black">
              Send Gmail to Multiple Recipients
            </h1>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <form onSubmit={sendEmail} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emails (comma-separated)
                </label>
                <textarea
                  rows="5"
                  className="w-full px-4 sm:px-6 py-3 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl border border-gray-100 shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  required
                  placeholder="Enter email addresses"
                />
              </div>

              {/* Subject Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full px-4 sm:px-6 py-3 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl border border-gray-100 shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Enter email subject"
                />
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  className="w-full px-4 sm:px-6 py-3 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl border border-gray-100 shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Enter your message"
                  rows="5"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 rounded-xl text-base sm:text-lg font-medium transition-all duration-200 ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                  } text-white min-w-[200px]`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </div>
                  ) : (
                    "Send Emails"
                  )}
                </button>
              </div>
            </form>

            {/* Status Message */}
            {statusMessage && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-center">
                {statusMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkEmailSender;
