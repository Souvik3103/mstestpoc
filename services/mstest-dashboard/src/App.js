import React, { useState } from 'react';
import './App.css';

function App() {
  const [logs, setLogs] = useState('');
  const [running, setRunning] = useState(false);
  const [dllPath, setDllPath] = useState('');
  const [settingsPath, setSettingsPath] = useState('');

  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);

  const loadTags = async () => {
    if (!dllPath) return alert('Enter DLL path first');
    try {
      const res = await fetch(`http://localhost:5000/list-tags?dll=${encodeURIComponent(dllPath)}`);
      const data = await res.json();
      setTags(data.tags || []);
      setSelectedTags([]);
    } catch (err) {
      console.error('Failed to load tags:', err);
      alert('Failed to fetch tags.');
    }
  };

  const loadTests = async () => {
    if (!dllPath) return alert('Enter DLL path first');
    try {
      const res = await fetch(`http://localhost:5000/list-tests?dll=${encodeURIComponent(dllPath)}`);
      const data = await res.json();
      setTests(data.tests || []);
      setSelectedTests([]);
    } catch (err) {
      console.error('Failed to load tests:', err);
      alert('Failed to fetch tests.');
    }
  };

  const handleTagCheckbox = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const handleTestCheckbox = (testName) => {
    setSelectedTests((prev) =>
      prev.includes(testName)
        ? prev.filter((t) => t !== testName)
        : [...prev, testName]
    );
  };

  const runTests = () => {
    setLogs('');
    setRunning(true);

    let filters = [];

    if (selectedTags.length > 0) {
      const tagFilter = selectedTags.map(tag => `TestCategory=${tag}`).join('|');
      filters.push(tagFilter);
    }

    if (selectedTests.length > 0) {
      const testNameFilter = selectedTests.map(name => `FullyQualifiedName=${name}`).join('|');
      filters.push(testNameFilter);
    }

    const finalFilter = filters.join('|');

    const url = `http://localhost:5000/run-tests-stream?dll=${encodeURIComponent(
      dllPath
    )}&settings=${encodeURIComponent(settingsPath)}&testCaseFilter=${encodeURIComponent(finalFilter)}`;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      setLogs((prevLogs) => prevLogs + event.data + '\n');
    };

    eventSource.addEventListener('end', () => {
      eventSource.close();
      setRunning(false);
    });

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
      setRunning(false);
    };
  };

  return (
    <div className="App">
      <h1>MSTest Dashboard</h1>

      <div className="input-group">
        <input
          type="text"
          placeholder="DLL Path"
          value={dllPath}
          onChange={(e) => setDllPath(e.target.value)}
        />
        <input
          type="text"
          placeholder="Settings Path"
          value={settingsPath}
          onChange={(e) => setSettingsPath(e.target.value)}
        />
      </div>

      <div className="button-group">
        <button onClick={loadTags}>Load Tags</button>
        <button onClick={loadTests}>Load Tests</button>
        <button onClick={runTests} disabled={running}>
          {running ? 'Running...' : 'Run Selected Tests'}
        </button>
      </div>

      <div className="filters-container">
        {tags.length > 0 && (
          <div className="filter-section">
            <h3>Tags</h3>
            <div className="scroll-box">
              {tags.map((tag, idx) => (
                <label key={idx} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagCheckbox(tag)}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>
        )}

        {tests.length > 0 && (
          <div className="filter-section">
            <h3>Tests</h3>
            <div className="scroll-box">
              {tests.map((test, idx) => (
                <label key={idx} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test.name)}
                    onChange={() => handleTestCheckbox(test.name)}
                  />
                  {test.name}
                  {test.tags?.length > 0 && (
                    <span className="tags"> ({test.tags.join(', ')})</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <h3>Test Output</h3>
      <pre className="log-output">
        {logs || 'No output yet.'}
      </pre>
    </div>
  );
}

export default App;
