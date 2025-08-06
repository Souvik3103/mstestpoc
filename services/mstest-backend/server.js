const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());

// SSE Endpoint for running tests
app.get('/run-tests-stream', (req, res) => {
  const dllPath = req.query.dll;
  const settingsPath = req.query.settings;
  const testCaseFilter = req.query.testCaseFilter;

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  if (!dllPath || !settingsPath) {
    res.write(`data: ERROR: Missing required parameters (dll or settings)\n\n`);
    return res.status(400).end();
  }

  res.write(`data: DLL Path: ${dllPath ? 'Valid' : 'Invalid'}\n\n`);
  res.write(`data: Settings Path: ${settingsPath ? 'Valid' : 'Invalid'}\n\n`);
  res.write(`data: Test Case Filter: ${testCaseFilter ? 'Provided' : 'Not Provided, all tests in dll will run'}\n\n`);

  const vstestPath = `"C:\\Program Files\\Microsoft Visual Studio\\2022\\Professional\\Common7\\IDE\\CommonExtensions\\Microsoft\\TestWindow\\vstest.console.exe"`;

  let args = [dllPath, '/Settings:' + settingsPath];

  if (testCaseFilter) {
    args.push(`"/TestCaseFilter:${testCaseFilter}"`);
  }

  console.log('Running command:', vstestPath, args.join(' '));

  const testProcess = spawn(vstestPath, args, { shell: true });

  testProcess.stdout.on('data', (data) => {
    const output = data.toString().split('\n');
    output.forEach((line) => {
      if (line.trim()) {
        res.write(`data: ${line.trim()}\n\n`);
      }
    });
  });

  testProcess.stderr.on('data', (data) => {
    const output = data.toString().split('\n');
    output.forEach((line) => {
      if (line.trim()) {
        res.write(`data: ERROR: ${line.trim()}\n\n`);
      }
    });
  });

  testProcess.on('close', (code) => {
    res.write(`data: Test process exited with code ${code}\n\n`);
    res.write(`event: end\ndata: done\n\n`);
    res.end();
  });

  req.on('close', () => {
    console.log('Client disconnected, killing test process');
    testProcess.kill();
  });
});

// Endpoint to list test cases
app.get('/list-tests', (req, res) => {
  const dllPath = req.query.dll;
  if (!dllPath) return res.status(400).json({ error: 'Missing DLL path' });

  const tagProcess = spawn('dotnet', ["D:\\mstestpoc\\testDiscovery\\bin\\Debug\\net9.0\\testDiscovery.dll", dllPath], { shell: true });
    
  let output = '';
  let errorOutput = '';

  tagProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  tagProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  tagProcess.on('close', () => {
    if (errorOutput) {
      console.error('Error from DLL:', errorOutput);
    }

    try {
      const raw = JSON.parse(output);

      // Example item: { Name: '...', Categories: [...] }
      const tests = raw.map(t => ({
        name: t.Name,
        tags: t.Categories || []
      }));

      res.json({ tests });
    } catch (err) {
      console.error('Failed to parse DLL output:', err);
      console.error('Raw output:', output);
      res.status(500).json({ error: 'Failed to parse test metadata from DLL' });
    }
  });
});


// ✅ New Endpoint to list tags (from C# DLL that returns JSON)
app.get('/list-tags', (req, res) => {
  const dllPath = req.query.dll;
  if (!dllPath) return res.status(400).json({ error: 'Missing DLL path' });
    console.log('Running command:', 'dotnet', "D:\\mstestpoc\\testDiscovery\\bin\\Debug\\net9.0\\testDiscovery.dll", dllPath);
  // Run DLL with --list-tags which outputs JSON
  const tagProcess = spawn('dotnet', ["D:\\mstestpoc\\testDiscovery\\bin\\Debug\\net9.0\\testDiscovery.dll", dllPath], { shell: true });
    
   let output = '';
  let errorOutput = '';

  tagProcess.stdout.on('data', (data) => {
    console.log('STDOUT:', data.toString());
    output += data.toString();
  });

  tagProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  tagProcess.on('close', (code) => {
    if (errorOutput) {
      console.error('DLL STDERR:', errorOutput);
    }

    try {
      const rawData = JSON.parse(output);

      // Flatten and deduplicate all categories
      const allTags = new Set();
      rawData.forEach(test => {
        if (Array.isArray(test.Categories)) {
          test.Categories.forEach(tag => allTags.add(tag));
        }
      });

      res.json({ tags: Array.from(allTags).sort() });  // return sorted tags for UI consistency
    } catch (err) {
      console.error('Failed to parse JSON from C# output:', err);
      console.error('Raw Output:', output);
      res.status(500).json({ error: 'Failed to parse JSON output from DLL' });
    }
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
