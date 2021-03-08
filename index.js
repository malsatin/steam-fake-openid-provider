const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');

const DOMAIN = 'localhost';

const app = express();

const privateKey = fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/privkey.pem`, 'utf8');
const certificate = fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/cert.pem`, 'utf8');
const ca = fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/chain.pem`, 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

/**
 * Discovery endpoint
 */
app.get('/id/:steamid', function(req, res) {
	console.log('Discovery endpoint called:', req.url);

	res.set('Content-Type', 'application/xrds+xml;charset=utf-8');
	res.send(`
<?xml version="1.0" encoding="UTF-8"?>
<xrds:XRDS xmlns:xrds="xri://$xrds" xmlns="xri://$xrd*($v*2.0)">
	<XRD>
		<Service priority="0">
			<Type>http://specs.openid.net/auth/2.0/signon</Type>
			<URI>https://${DOMAIN}</URI>
		</Service>
	</XRD>
</xrds:XRDS>
	`);
});

/**
 * Validation endpoint
 * We simply validate every incoming request
 */
app.post('/*', function(req, res) {
	console.log('Validation endpoint called:', req.url);

	res.send('ns:http://specs.openid.net/auth/2.0\nis_valid:true\n');
});


/**
 * Run the server
 */
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});
httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});
