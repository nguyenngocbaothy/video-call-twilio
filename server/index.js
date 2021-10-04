import express from 'express';
import twilio from 'twilio';
import ngrok from 'ngrok';

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const app = express();
const port = 3000;

const ACCOUNT_SID = "ACe9ebe0bb37491feb35a72c918d0105ce";
const API_KEY_SID = "SKa7b0f2b74461529eb7404a529eec66f3";
const API_KEY_SECRET = "kPRX3LOR2ZSBWxBVovFc62hUlMpNnH9a";


app.get('/getToken', (req, res) => {
    if (!req.query || !req.query.room || !req.query.username) {
    return res.status(400).send('username and room parameter is required');
    }
    const accessToken = new AccessToken(
        ACCOUNT_SID,
        API_KEY_SID,
        API_KEY_SECRET
    ); // Set the Identity of this token
    const grant = new VideoGrant();

    accessToken.identity = req.query.username;// Grant access to Video
    grant.room = req.query.room;

    accessToken.addGrant(grant); // Serialize the token as a JWT
    const jwt = accessToken.toJwt();
    return res.send(jwt);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

ngrok.connect(port).then((url) => {
    console.log(`Server forwarded to public url ${url}`);
  });