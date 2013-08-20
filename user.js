/**
 *	User Object
 * @String id:		Users own ID (e.g."c015")
 * @String pubKey:	Users public key
 * @String privKey:	Users private key
 * @String name:	Username
 */
function UserClass(name){
	this.me = this;
	this.data = null;
	this.keyPair = null;
	this.name = name;
	this.password = null;
	this.login = function(password) {
		var me = this;
		if(password != null)
		{
			$.getJSON("backend/actions.php", {"action":"login","username" : this.name, "password" : password}, function(ret) {
				console.log(ret);
				if(ret.success)
				{
					UI.showChat();
					$('#menuChat').show();
					$("#menuLogin").addClass("menuItem")
					$("#menuLogin").html("<a href='javascript:User.logout();'>Logout</a>");
					
					me.data = ret.user;
					me.password = password;
					switch(me.data.seclevel)
					{
					case "0":
						//lowes security - static seed
						me.keyPair = openpgp.generate_static_key_pair(1,2048,me.name,password);
						break;
					case "1":
						//mid security - crypted seed in database
						var crypted = util.bin2str(JSON.parse(me.data.privseed));
						var tmpSeed = openpgp_crypto_symmetricDecrypt(10,str_sha512(password),crypted);
						var jsonSeed = JSON.parse(tmpSeed);
						var seed = new keyObject();
						for(var key in seed)
						{
							seed[key] = new BigInteger();
						}
						
						for(var key in jsonSeed)
						{
							for(var key2 in jsonSeed[key])
							{
								seed[key][key2] = jsonSeed[key][key2];
							}
						}
						
						me.keyPair = openpgp.generate_user_key_pair(1,2048,me.name,password,seed);
						break;
					case "2":
						//high security - private key on users hands
						break;
					case "3":
						//ultra high - always new random seed - no offline msg
						me.keyPair = openpgp.generate_key_pair(1,2048,me.name,password);
						break;
					default:
						alert("Security Level unknown!");
						break;
					}
					
					if(me.keyPair != null)
					{
						//upload public key
						console.log("Uploading pubkey");
						var pubKey = JSON.stringify(util.str2bin(me.keyPair.publicKeyArmored));
						$.getJSON("backend/actions.php",{"action":"uploadPubKey","key":pubKey});
						Controller.loggedIn();
					}
				}
			});
		}
	}
	
	this.logout = function() {
		$.getJSON("backend/actions.php", {"action":"logout"}, function(ret) {
			if(ret.success)
			{
				window.location = window.location;
			}
			
		});
	}
	
	this.init = function() {
		this.loginField = document.getElementById("userNameField");
		this.passwordField = document.getElementById("passwordField");
		this.loginButton = document.getElementById("loginButton");
	}
	
	this.init();
}

function keyObject() {
	this.n = null;
	this.e = 0;
	this.ee = null;
	this.d = null;
	this.p = null;
	this.q = null;
	this.dmp1 = null;
	this.dmq1 = null;
	this.u = null;
}