'use client';

import { useState } from 'react';


export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    setLoading(true);
    const res = await fetch('/api/groq-chat', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAnswer(data.answer);
    setLoading(false);
  };

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ask a Textbook Doubt</h1>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. Explain the revolt of 1857"
        className="w-full p-2 border rounded mb-2"
        rows={4}
      />
      <button
        onClick={askQuestion}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Thinking...' : 'Ask'}
      </button>
      {answer && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <strong>AI Answer:</strong>
          <p>{answer}</p>
        </div>
      )}
    </main>
  );
}
