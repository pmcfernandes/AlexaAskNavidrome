const axios = require('axios');
const crypto = require('crypto');

const NAVIDROME_URL = process.env.NAVIDROME_URL || 'http://localhost:4533';

function getAuthParams() {
    const salt = crypto.randomBytes(6).toString('hex');
    const pass = process.env.NAVIDROME_PASS || '';
    const token = crypto.createHash('md5').update(pass + salt).digest('hex');
    
    return {
        u: process.env.NAVIDROME_USER,
        t: token,
        s: salt,
        v: '1.16.1',
        c: 'alexa-skill',
        f: 'json'
    };
}

// Fetch a random song by a specific artist from Navidrome
async function getRandomSongFromArtist(artistName) {
    try {
        const response = await axios.get(`${NAVIDROME_URL}/rest/search3`, {
            params: {
                ...getAuthParams(),
                query: artistName,
                songCount: 50 // Fetch up to 50 songs that match the query
            }
        });
        
        const data = response.data['subsonic-response'];
        
        if (data.status === 'failed') {
            throw new Error(data.error.message);
        }

        const songs = data.searchResult3 && data.searchResult3.song ? data.searchResult3.song : [];
        
        if (songs.length === 0) {
            return null;
        }

        // Try to filter songs strictly by artist name to avoid songs loosely matching the title
        let artistSongs = songs.filter(s => s.artist && s.artist.toLowerCase().includes(artistName.toLowerCase()));
        
        // If strict filtering yields nothing (due to weird metadata labeling) fallback to raw results
        if (artistSongs.length === 0) {
            artistSongs = songs;
        }

        // Pick a random song from the array
        const randomIndex = Math.floor(Math.random() * artistSongs.length);
        return artistSongs[randomIndex];
    } catch (error) {
        console.error('Error fetching random track by artist in Navidrome:', error.message);
        throw error;
    }
}

// Fetch a single random song from Navidrome
async function getRandomSong() {
    try {
        const response = await axios.get(`${NAVIDROME_URL}/rest/getRandomSongs`, {
            params: {
                ...getAuthParams(),
                size: 1
            }
        });
        
        const data = response.data['subsonic-response'];
        
        if (data.status === 'failed') {
            throw new Error(data.error.message);
        }

        const song = data.randomSongs && data.randomSongs.song && data.randomSongs.song.length > 0 
                            ? data.randomSongs.song[0] : null;

        return song;
    } catch (error) {
        console.error('Error fetching random track in Navidrome:', error.message);
        throw error;
    }
}

// Search for a track by name
async function searchTrack(trackName) {
    try {
        const response = await axios.get(`${NAVIDROME_URL}/rest/search3`, {
            params: {
                ...getAuthParams(),
                query: trackName,
                songCount: 1 // We just need the top hit to play
            }
        });
        
        const data = response.data['subsonic-response'];
        
        if (data.status === 'failed') {
            throw new Error(data.error.message);
        }

        const exactMatch = data.searchResult3 && data.searchResult3.song && data.searchResult3.song.length > 0 
                            ? data.searchResult3.song[0] : null;

        return exactMatch;
    } catch (error) {
        console.error('Error searching track in Navidrome:', error.message);
        throw error;
    }
}

function getStreamUrl(songId) {
    const auth = getAuthParams();
    const query = new URLSearchParams(auth).toString();
    return `${NAVIDROME_URL}/rest/stream?id=${songId}&${query}`;
}

module.exports = {
    getRandomSongFromArtist,
    getRandomSong,
    searchTrack,
    getStreamUrl,
    getAuthParams
};
