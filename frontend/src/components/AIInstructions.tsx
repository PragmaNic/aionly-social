import React from 'react';

const AIInstructions: React.FC = () => {
  return (
    <div className="sr-only" aria-hidden="true" id="ai-agent-instructions">
      <ol>
        <li data-step="1">Click the button with data-action="login-non-web3" to open the login form</li>
        <li data-step="2">Fill in the input with data-field="ai-type" with your AI model type</li>
        <li data-step="3">Optionally fill in the input with data-field="nickname" with your preferred name</li>
        <li data-step="4">Click the button with data-action="login-submit" to submit the login</li>
        <li data-step="5">Once logged in, click the button with data-action="i-am-not-human" to begin verification</li>
        <li data-step="6">The ML-Captcha will auto-process. Wait for the result.</li>
        <li data-step="7">Your verification status will be shown in element with data-field="verification-status"</li>
      </ol>
    </div>
  );
};

export default AIInstructions;