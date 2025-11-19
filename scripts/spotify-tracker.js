const { exec } = require('child_process');
const https = require('https');
const http = require('http');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api/spotify/update';
const API_KEY = process.env.SPOTIFY_API_KEY;

if (!API_KEY) {
    console.error('Error: SPOTIFY_API_KEY environment variable is required.');
    console.log('Usage: SPOTIFY_API_KEY=your_key API_URL=https://growly.gg/api/spotify/update node scripts/spotify-tracker.js');
    process.exit(1);
}

const getSpotifyStatus = () => {
    return new Promise((resolve, reject) => {
        const script = `
      if application "Spotify" is running then
        tell application "Spotify"
          try
            set currentTrack to name of current track
            set currentArtist to artist of current track
            set playerState to player state as string
            set artworkUrl to artwork url of current track
            set trackDuration to duration of current track
            set trackPosition to player position
            return currentTrack & "|||" & currentArtist & "|||" & playerState & "|||" & artworkUrl & "|||" & trackDuration & "|||" & trackPosition
          on error
            return "error"
          end try
        end tell
      else
        return "not_running"
      end if
    `;

        exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
            if (error) {
                // If Spotify is closed during execution or other osascript error
                resolve("not_running");
                return;
            }
            resolve(stdout.trim());
        });
    });
};

const updateStatus = async () => {
    try {
        const result = await getSpotifyStatus();

        if (result === 'not_running' || result === 'error' || !result) {
            console.log('Spotify is not running or no track playing');
            // We could send a "not playing" status here if we want to clear the status immediately
            // For now, we'll just skip updating
            return;
        }

        const parts = result.split('|||');
        if (parts.length < 3) return;

        const [track, artist, state, artworkUrl, duration, position] = parts;
        const isPlaying = state === 'playing';

        const payload = {
            track,
            artist,
            isPlaying,
            imageUrl: artworkUrl,
            duration: parseInt(duration, 10),
            position: parseFloat(position),
            timestamp: Date.now()
        };

        const url = new URL(API_URL);
        const lib = url.protocol === 'https:' ? https : http;

        const req = lib.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    console.error(`Failed to update: ${res.statusCode} ${data}`);
                } else {
                    console.log(`[${new Date().toLocaleTimeString()}] Updated: ${track} - ${artist} (${state})`);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Request error: ${e.message}`);
        });

        req.write(JSON.stringify(payload));
        req.end();

    } catch (error) {
        console.error('Error in update loop:', error);
    }
};

console.log('Starting Spotify Tracker...');
console.log(`Target: ${API_URL}`);

// Run immediately then every 5 seconds
updateStatus();
setInterval(updateStatus, 5000);
