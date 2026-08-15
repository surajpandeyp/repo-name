const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const auth = require("./midd");

const router = express.Router();
const OPENVPN_DIR = '/etc/openvpn/client-configs/files';

router.get('/download', auth,(req, res) => {
    // Auth middleware ya body se username le lo
    const username = req.user?.username;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    // Sanitize username to prevent command injection
    const sanitizedUsername = username.replace(/[^a-zA-Z0-9_-]/g, '');
    const clientFile = path.join(OPENVPN_DIR, `${sanitizedUsername}.ovpn`);

    // Agar file pehle se bani hai toh seedha bhej do
    if (fs.existsSync(clientFile)) {
        return res.download(clientFile, `${sanitizedUsername}.ovpn`, (err) => {
            if (err) console.error('File send error:', err);
        });
        return;
    }

    // Root se chal raha hai isliye bina sudo ke direct command
    const command = `/etc/openvpn/create-client.sh ${sanitizedUsername}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: 'Failed to create VPN profile', details: stderr });
        }

        // File check karke user ko download kara do
        if (fs.existsSync(clientFile)) {
            res.download(clientFile, `${sanitizedUsername}.ovpn`, (err) => {
                if (err) console.error('File send error:', err);
            });
        } else {
            res.status(500).json({ error: 'Script executed but VPN file was not generated' });
        }
    });
});

module.exports = router;