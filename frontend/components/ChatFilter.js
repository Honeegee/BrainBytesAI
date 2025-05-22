import React from 'react';

export default function ChatFilter({ 
  subjects,
  selectedSubject,
  onSubjectChange,
  selectedSentiment,
  onSentimentChange,
  selectedMessageType,
  onMessageTypeChange,
  onClearFilters
}) {
  return (
    <div className="mb-4 p-3 bg-bg-dark-secondary border border-border-dark rounded-lg">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Subject Filter */}
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full bg-bg-dark border border-border-dark text-text-light rounded-md focus:ring-hf-blue focus:border-hf-blue p-2"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Sentiment Filter */}
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedSentiment}
            onChange={(e) => onSentimentChange(e.target.value)}
            className="w-full bg-bg-dark border border-border-dark text-text-light rounded-md focus:ring-hf-blue focus:border-hf-blue p-2"
          >
            <option value="">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>

        {/* Message Type Filter */}
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedMessageType}
            onChange={(e) => onMessageTypeChange(e.target.value)}
            className="w-full bg-bg-dark border border-border-dark text-text-light rounded-md focus:ring-hf-blue focus:border-hf-blue p-2"
          >
            <option value="">All Messages</option>
            <option value="user">User Messages</option>
            <option value="ai">AI Responses</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(selectedSubject || selectedSentiment || selectedMessageType) && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {(selectedSubject || selectedSentiment || selectedMessageType) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedSubject && (
            <span className="inline-flex items-center bg-hf-blue bg-opacity-20 text-blue-300 px-3 py-1 rounded-full text-sm">
              Subject: {selectedSubject}
            </span>
          )}
          {selectedSentiment && (
            <span className="inline-flex items-center bg-hf-blue bg-opacity-20 text-blue-300 px-3 py-1 rounded-full text-sm">
              Sentiment: {selectedSentiment}
            </span>
          )}
          {selectedMessageType && (
            <span className="inline-flex items-center bg-hf-blue bg-opacity-20 text-blue-300 px-3 py-1 rounded-full text-sm">
              Type: {selectedMessageType === 'ai' ? 'AI Responses' : 'User Messages'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
