const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

const playlistUrl = 'https://usertoken1.hls-video.net/media2/token/a3f0c81db39d64f85b6f6a5cfaa1b2ce/stream.m3u8?token=7e95535326220e90013338b935f40476';
const token = '7e95535326220e90013338b935f40476';

// Custom headers
const headers = {
  accept: '*/*',
  'accept-encoding': 'gzip, deflate, br, zstd',
  'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
  origin: 'https://userrr4591.ifrem.net',
  priority: 'u=1, i',
  referer: 'https://userrr4591.ifrem.net/',
  'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
};

// Proxy and rewrite the playlist
app.get('/stream.m3u8', async (req, res) => {
  try {
    const response = await axios.get(playlistUrl, { headers });
    const originalPlaylist = response.data;

    // Rewrite the URLs in the playlist to point to /segments/ on our server
    const rewrittenPlaylist = originalPlaylist.replace(
      /https:\/\/userx3565\.hls-video\.net\/ts1\/token\/[^/]+\/(tn478cnu2o0q_\d+)\?token=[^ \n]+/g,
      (match, segment) => `/segments/${segment}`
    );

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(rewrittenPlaylist);
  } catch (error) {
    console.error('Error fetching or rewriting playlist:', error);
    res.status(500).send('Error loading playlist');
  }
});

// Proxy the .ts segment files with headers
app.get('/segments/:segment', async (req, res) => {
  const segment = req.params.segment;
  const segmentUrl = `https://userx3565.hls-video.net/user/token/a3f0c81db39d64f85b6f6a5cfaa1b2ce/${segment}?token=${token}`;

  try {
    const response = await axios.get(segmentUrl, {
      headers,
      responseType: 'stream',
    });
    res.setHeader('Content-Type', 'video/MP2T');
    response.data.pipe(res);
  } catch (error) {
    console.error(`Error fetching segment ${segment}:`, error);
    res.status(500).send('Segment not found');
  }
});

// Serve frontend
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
