// https://github.com/htmltiger/node-red-custom-login/
// edit mqtt settings at the bottom function if required

var cookie = require('cookie');
var crypto = require('crypto');
const nodeusername="yourusername";
const nodepassword="yourpassword";
const myhash=crypto.createHash('sha512').update("#"+nodeusername+"-"+nodepassword+"", 'utf8').digest('hex');
var ipban={};
function customLogin(req, res, next) {
	
	const ip=req.connection.remoteAddress;
	var logy=''; var code=200;
	
	/*
	//custom favicons from /home/pi/.node-red/static
	if (['/icon64x64.png', '/icon120x120.png', '/icon192x192.png', '/favicon.ico'].includes(req.url)) {
		var ctype='image/png';
		var path =  require('path');
		if(['/favicon.ico'].includes(req.url)){
			ctype='image/x-icon';
		}
		res.writeHeader(code, {"Cache-Control": "max-age=36000000", "Content-Type": ctype});
		var data=require('fs').readFileSync(path.resolve(path.join('/home/pi/.node-red/static', req.url)));
		res.write(data);
		return res.end();
	}
	*/
	
	
	if(!(ip in ipban)){ipban[ip]=0;}
	if (req.headers.cookie) {
		logy = cookie.parse(req.headers.cookie);
		logy = logy["log"];
		if(logy){
			if(logy == myhash){
				return next();
			}else if(Date.now() - ipban[ip] > (5 * 60000) && //5m one login
				crypto.createHash('sha512').update('#'+logy, 'utf8').digest('hex')==myhash)
				{					
				mqttmsg("new: "+ip,req.headers);
				res.cookie("log", myhash, {expires: new Date(Date.now() + (14 * 864e5)), path: '/'}); //remember for 14 days
				delete ipban[ip];
				return res.redirect(req.originalUrl);
			}else{
				mqttmsg("FAILED: "+ip+" "+logy,req.headers);
				res.clearCookie("log");
				ipban[ip]=Date.now();
				logy="Login Failed";
				code=401;
			}
			
		}
	}
	
	res.writeHeader(code, {"Content-Type": "text/html"})
	res.write('<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /><style>body{background:#3498DB}form{margin:20px auto;width:300px;background:#fff;border-radius:5px;padding:20px;text-align:center;color:red}input{padding:12px 0;margin-bottom:10px;border-radius:3px;border:1px solid transparent;text-align:center;width:100%;font-size:16px}.f{background:#ECF0F1}.f:focus{border:1px solid #3498DB}.b{background:#3498DB;color:#fff}.b:hover,.b:active{background:#1F78B4}</style></head><body><form method="POST" onsubmit="document.cookie=\'log=\' + this.querySelector(\'#u\').value+\'-\'+this.querySelector(\'#p\').value+\'; path=/\'; return true;"><input type="text" placeholder="username" id="u" name="username" class="f"><input type="password" placeholder="password" id="p" name="password" class="f"><input type="submit" value="login" class="b">'+logy+'</form></body></html>');
	return res.end();

}


function mqttmsg(msg, headers){
	headers=JSON.stringify(headers,null,2);
	msg="nodelogin: "+msg
	console.warn("[warn] "+msg);
	//const { execFile } = require('node:child_process');
	//execFile('mosquitto_pub', ["-h","192.168.0.XX","-c","-u","mqttusername","-P","mqttpassword","-t","yourtopic","-m", msg+"\n"+headers], (error, stdout, stderr) => {});
}

module.exports = customLogin;
