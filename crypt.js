function Crypto(pubKey,owner){
	var me = this;
	this.pubKey = pubKey;
	this.owner = owner;
	this.encrypt = function(message){
		return me.owner.name + " Encrypt: " + message;
	}
	this.decrypt = function(message){
		return me.owner.name + " Decrypt: " + message;
	}
}