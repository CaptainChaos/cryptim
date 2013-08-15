/**
 *	User Object
 * @String id:		Users own ID (e.g."c015")
 * @String pubKey:	Users public key
 * @String privKey:	Users private key
 * @String name:	Username
 */
function UserClass(id,pubKey,privKey,name){
	this.id = id;
	this.pubKey = pubKey;
	this.privKey = privKey;
	this.name = name;
	this.login = function(password) {
		$.getJSON("backend/actions.php", {"action":"login","username" : this.name, "password" : password}, function(ret) {
			console.log(ret);
		});
	}
	
	this.logout = function() {
		$.getJSON("backend/actions.php", {"action":"logout"}, function(ret) {
			console.log(ret);
		});
	}
	
	this.init = function() {
		this.loginField = document.getElementById("userNameField");
		this.passwordField = document.getElementById("passwordField");
		this.loginButton = document.getElementById("loginButton");
	}
	
	this.init();
}