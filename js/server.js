const {RtcTokenBuilder, RtcRole} = require('agora-access-token');

const express = require('express');

const app = express();
const cors = require('cors');


const PORT = process.env.PORT || 3000;

const APPID = "df5cbc837ccb4ff1accd5ccecc512fba";
    const APPCERTIFICATE = "064696261adb4149b95e1640bb04e6e8";

app.use(cors());
app.use(express.json());


app.post('/generate-token', (req,res) => {
  const {channelname, uid} = req.body;
  const ROLE = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now()/1000);
  const privilegeExpirtedTs = currentTimestamp + expirationTimeInSeconds;
  const TOKEN = RtcTokenBuilder.buildTokenWithUid(APPID, APPCERTIFICATE, channelname, uid, ROLE, privilegeExpirtedTs);
  console.log("TOKEN = " + TOKEN);
  console.log("Channelname = " + channelname)
  res.json({token: TOKEN});


});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);  
})



const generateRtcToken = (uid, channelname) => {
    
    const CHANNELNAME = channelname;
    const UID = uid;
    

}
