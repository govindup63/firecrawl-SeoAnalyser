import express from 'express';
import FirecrawlApp from '@mendable/firecrawl-js';
import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

const firecrawlApp = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

app.use(express.json());

app.post('/analyze', async (req, res) => {
  const { url } = req.body;

  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const seoMetrics = {
      title: $('title').text(),
      metaDescription: $('meta[name="description"]').attr('content') || 'No meta description',
      h1Count: $('h1').length,
      h2Count: $('h2').length,
      imageWithoutAlt: $('img:not([alt])').length,
      internalLinks: [],
      externalLinks: [],
      brokenLinks: [],
    };

    $('a').each((index, element) => {
      const href = $(element).attr('href');
      if (href && href.startsWith('http')) {
        if (href.includes(url)) {
          seoMetrics.internalLinks.push(href);
        } else {
          seoMetrics.externalLinks.push(href);
        }
      }
    });

    for (let link of seoMetrics.internalLinks.concat(seoMetrics.externalLinks)) {
      try {
        await axios.get(link);
      } catch {
        seoMetrics.brokenLinks.push(link);
      }
    }

    res.json(seoMetrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
