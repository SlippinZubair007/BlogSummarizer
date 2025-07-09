'use client';

import { useState } from 'react';

export default function BlogForm() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/summarize', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setSummary(data.summary);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Enter blog URL"
        className="border p-2 w-full"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={handleSubmit} className="bg-black text-white px-4 py-2 rounded">
        Summarize
      </button>
      {summary && <div className="mt-4">{summary}</div>}
    </div>
  );
}
