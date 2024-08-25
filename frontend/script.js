document.getElementById('analyzeForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const url = document.getElementById('urlInput').value;
  const resultDiv = document.getElementById('result');
  const loadingDiv = document.getElementById('loading');

  // Show loading indicator
  loadingDiv.classList.remove('hidden');
  resultDiv.innerHTML = '';

  console.log('Form submitted with URL:', url);

  try {
    console.log('Sending request to the backend...');
    const response = await fetch('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) throw new Error('Failed to fetch data');

    const data = await response.json();

    console.log('Received data from backend:', data);

    resultDiv.innerHTML = `
      <h2>SEO Analysis Results</h2>
      <p><strong>Title:</strong> ${data.title}</p>
      <p><strong>Meta Description:</strong> ${data.metaDescription}</p>
      <p><strong>H1 Count:</strong> ${data.h1Count}</p>
      <p><strong>H2 Count:</strong> ${data.h2Count}</p>
      <p><strong>Images Without Alt:</strong> ${data.imageWithoutAlt}</p>
      <p><strong>Internal Links:</strong> ${data.internalLinks.length}</p>
      <p><strong>External Links:</strong> ${data.externalLinks.length}</p>
      <p><strong>Broken Links:</strong> ${data.brokenLinks.length}</p>
    `;
  } catch (error) {
    console.error('Error:', error.message);
    resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    // Hide loading indicator
    loadingDiv.classList.add('hidden');
  }
});
