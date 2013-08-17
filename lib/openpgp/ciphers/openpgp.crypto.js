// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
// 
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.
// 
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
// 
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA 

// The GPG4Browsers crypto interface

/**
 * Encrypts data using the specified public key multiprecision integers 
 * and the specified algorithm.
 * @param {Integer} algo Algorithm to be used (See RFC4880 9.1)
 * @param {openpgp_type_mpi[]} publicMPIs Algorithm dependent multiprecision integers
 * @param {openpgp_type_mpi} data Data to be encrypted as MPI
 * @return {(openpgp_type_mpi|openpgp_type_mpi[])} if RSA an openpgp_type_mpi; 
 * if elgamal encryption an array of two openpgp_type_mpi is returned; otherwise null
 */
function openpgp_crypto_asymetricEncrypt(algo, publicMPIs, data) {
	switch(algo) {
	case 1: // RSA (Encrypt or Sign) [HAC]
	case 2: // RSA Encrypt-Only [HAC]
	case 3: // RSA Sign-Only [HAC]
		var rsa = new RSA();
		var n = publicMPIs[0].toBigInteger();
		var e = publicMPIs[1].toBigInteger();
		var m = data.toBigInteger();
		return rsa.encrypt(m,e,n).toMPI();
	case 16: // Elgamal (Encrypt-Only) [ELGAMAL] [HAC]
		var elgamal = new Elgamal();
		var p = publicMPIs[0].toBigInteger();
		var g = publicMPIs[1].toBigInteger();
		var y = publicMPIs[2].toBigInteger();
		var m = data.toBigInteger();
		return elgamal.encrypt(m,g,p,y);
	default:
		return null;
	}
}

/**
 * Decrypts data using the specified public key multiprecision integers of the private key,
 * the specified secretMPIs of the private key and the specified algorithm.
 * @param {Integer} algo Algorithm to be used (See RFC4880 9.1)
 * @param {openpgp_type_mpi[]} publicMPIs Algorithm dependent multiprecision integers 
 * of the public key part of the private key
 * @param {openpgp_type_mpi[]} secretMPIs Algorithm dependent multiprecision integers 
 * of the private key used
 * @param {openpgp_type_mpi} data Data to be encrypted as MPI
 * @return {BigInteger} returns a big integer containing the decrypted data; otherwise null
 */

function openpgp_crypto_asymetricDecrypt(algo, publicMPIs, secretMPIs, dataMPIs) {
	switch(algo) {
	case 1: // RSA (Encrypt or Sign) [HAC]  
	case 2: // RSA Encrypt-Only [HAC]
	case 3: // RSA Sign-Only [HAC]
		var rsa = new RSA();
		var d = secretMPIs[0].toBigInteger();
		var p = secretMPIs[1].toBigInteger();
		var q = secretMPIs[2].toBigInteger();
		var u = secretMPIs[3].toBigInteger();
		var m = dataMPIs[0].toBigInteger();
		return rsa.decrypt(m, d, p, q, u);
	case 16: // Elgamal (Encrypt-Only) [ELGAMAL] [HAC]
		var elgamal = new Elgamal();
		var x = secretMPIs[0].toBigInteger();
		var c1 = dataMPIs[0].toBigInteger();
		var c2 = dataMPIs[1].toBigInteger();
		var p = publicMPIs[0].toBigInteger();
		return elgamal.decrypt(c1,c2,p,x);
	default:
		return null;
	}
	
}

/**
 * generate random byte prefix as string for the specified algorithm
 * @param {Integer} algo Algorithm to use (see RFC4880 9.2)
 * @return {String} Random bytes with length equal to the block
 * size of the cipher
 */
function openpgp_crypto_getPrefixRandom(algo) {
	switch(algo) {
	case 2:
	case 3:
	case 4:
		return openpgp_crypto_getRandomBytes(8);
	case 7:
	case 8:
	case 9:
	case 10:
		return openpgp_crypto_getRandomBytes(16);
	default:
		return null;
	}
}

/**
 * retrieve the MDC prefixed bytes by decrypting them
 * @param {Integer} algo Algorithm to use (see RFC4880 9.2)
 * @param {String} key Key as string. length is depending on the algorithm used
 * @param {String} data Encrypted data where the prefix is decrypted from
 * @return {String} Plain text data of the prefixed data
 */
function openpgp_crypto_MDCSystemBytes(algo, key, data) {
	util.print_debug_hexstr_dump("openpgp_crypto_symmetricDecrypt:\nencrypteddata:",data);
	switch(algo) {
	case 0: // Plaintext or unencrypted data
		return data;
	case 2: // TripleDES (DES-EDE, [SCHNEIER] [HAC] - 168 bit key derived from 192)
		return openpgp_cfb_mdc(desede, 8, key, data, openpgp_cfb);
	case 3: // CAST5 (128 bit key, as per [RFC2144])
		return openpgp_cfb_mdc(cast5_encrypt, 8, key, data);
	case 4: // Blowfish (128 bit key, 16 rounds) [BLOWFISH]
		return openpgp_cfb_mdc(BFencrypt, 8, key, data);
	case 7: // AES with 128-bit key [AES]
	case 8: // AES with 192-bit key
	case 9: // AES with 256-bit key
		return openpgp_cfb_mdc(AESencrypt, 16, keyExpansion(key), data);
	case 10: 
		return openpgp_cfb_mdc(TFencrypt, 16, key, data);
	case 1: // IDEA [IDEA]
		util.print_error(""+ (algo == 1 ? "IDEA Algorithm not implemented" : "Twofish Algorithm not implemented"));
		return null;
	default:
	}
	return null;
}
/**
 * Generating a session key for the specified symmetric algorithm
 * @param {Integer} algo Algorithm to use (see RFC4880 9.2)
 * @return {String} Random bytes as a string to be used as a key
 */
function openpgp_crypto_generateSessionKey(algo) {
	switch (algo) {
	case 2: // TripleDES (DES-EDE, [SCHNEIER] [HAC] - 168 bit key derived from 192)
	case 8: // AES with 192-bit key
		return openpgp_crypto_getRandomBytes(24); 
	case 3: // CAST5 (128 bit key, as per [RFC2144])
	case 4: // Blowfish (128 bit key, 16 rounds) [BLOWFISH]
	case 7: // AES with 128-bit key [AES]
		util.print_debug("length = 16:\n"+util.hexstrdump(openpgp_crypto_getRandomBytes(16)));
		return openpgp_crypto_getRandomBytes(16);
	case 9: // AES with 256-bit key
	case 10:// Twofish with 256-bit key [TWOFISH]
		return openpgp_crypto_getRandomBytes(32);
	}
	return null;
}

/**
 * 
 * @param {Integer} algo public Key algorithm
 * @param {Integer} hash_algo Hash algorithm
 * @param {openpgp_type_mpi[]} msg_MPIs Signature multiprecision integers
 * @param {openpgp_type_mpi[]} publickey_MPIs Public key multiprecision integers 
 * @param {String} data Data on where the signature was computed on.
 * @return {Boolean} true if signature (sig_data was equal to data over hash)
 */
function openpgp_crypto_verifySignature(algo, hash_algo, msg_MPIs, publickey_MPIs, data) {
	var calc_hash = openpgp_crypto_hashData(hash_algo, data);
	switch(algo) {
	case 1: // RSA (Encrypt or Sign) [HAC]  
	case 2: // RSA Encrypt-Only [HAC]
	case 3: // RSA Sign-Only [HAC]
		var rsa = new RSA();
		var n = publickey_MPIs[0].toBigInteger();
		var e = publickey_MPIs[1].toBigInteger();
		var x = msg_MPIs[0].toBigInteger();
		var dopublic = rsa.verify(x,e,n);
		var hash  = openpgp_encoding_emsa_pkcs1_decode(hash_algo,dopublic.toMPI().substring(2));
		if (hash == -1) {
			util.print_error("PKCS1 padding in message or key incorrect. Aborting...");
			return false;
		}
		return hash == calc_hash;
		
	case 16: // Elgamal (Encrypt-Only) [ELGAMAL] [HAC]
		util.print_error("signing with Elgamal is not defined in the OpenPGP standard.");
		return null;
	case 17: // DSA (Digital Signature Algorithm) [FIPS186] [HAC]
		var dsa = new DSA();
		var s1 = msg_MPIs[0].toBigInteger();
		var s2 = msg_MPIs[1].toBigInteger();
		var p = publickey_MPIs[0].toBigInteger();
		var q = publickey_MPIs[1].toBigInteger();
		var g = publickey_MPIs[2].toBigInteger();
		var y = publickey_MPIs[3].toBigInteger();
		var m = data;
		var dopublic = dsa.verify(hash_algo,s1,s2,m,p,q,g,y);
		return dopublic.compareTo(s1) == 0;
	default:
		return null;
	}
	
}
   
/**
 * Create a signature on data using the specified algorithm
 * @param {Integer} hash_algo hash Algorithm to use (See RFC4880 9.4)
 * @param {Integer} algo Asymmetric cipher algorithm to use (See RFC4880 9.1)
 * @param {openpgp_type_mpi[]} publicMPIs Public key multiprecision integers 
 * of the private key 
 * @param {openpgp_type_mpi[]} secretMPIs Private key multiprecision 
 * integers which is used to sign the data
 * @param {String} data Data to be signed
 * @return {(String|openpgp_type_mpi)}
 */
function openpgp_crypto_signData(hash_algo, algo, publicMPIs, secretMPIs, data) {
	
	switch(algo) {
	case 1: // RSA (Encrypt or Sign) [HAC]  
	case 2: // RSA Encrypt-Only [HAC]
	case 3: // RSA Sign-Only [HAC]
		var rsa = new RSA();
		var d = secretMPIs[0].toBigInteger();
		var n = publicMPIs[0].toBigInteger();
		var m = openpgp_encoding_emsa_pkcs1_encode(hash_algo, data,publicMPIs[0].mpiByteLength);
		util.print_debug("signing using RSA");
		return rsa.sign(m, d, n).toMPI();
	case 17: // DSA (Digital Signature Algorithm) [FIPS186] [HAC]
		var dsa = new DSA();
		util.print_debug("DSA Sign: q size in Bytes:"+publicMPIs[1].getByteLength());
		var p = publicMPIs[0].toBigInteger();
		var q = publicMPIs[1].toBigInteger();
		var g = publicMPIs[2].toBigInteger();
		var y = publicMPIs[3].toBigInteger();
		var x = secretMPIs[0].toBigInteger();
		var m = data;
		var result = dsa.sign(hash_algo,m, g, p, q, x);
		util.print_debug("signing using DSA\n result:"+util.hexstrdump(result[0])+"|"+util.hexstrdump(result[1]));
		return result[0]+result[1];
	case 16: // Elgamal (Encrypt-Only) [ELGAMAL] [HAC]
			util.print_debug("signing with Elgamal is not defined in the OpenPGP standard.");
			return null;
	default:
		return null;
	}	
}

/**
 * Create a hash on the specified data using the specified algorithm
 * @param {Integer} algo Hash algorithm type (see RFC4880 9.4)
 * @param {String} data Data to be hashed
 * @return {String} hash value
 */
function openpgp_crypto_hashData(algo, data) {
	var hash = null;
	switch(algo) {
	case 1: // - MD5 [HAC]
		hash = MD5(data);
		break;
	case 2: // - SHA-1 [FIPS180]
		hash = str_sha1(data);
		break;
	case 3: // - RIPE-MD/160 [HAC]
		hash = RMDstring(data);
		break;
	case 8: // - SHA256 [FIPS180]
		hash = str_sha256(data);
		break;
	case 9: // - SHA384 [FIPS180]
		hash = str_sha384(data);
		break;
	case 10:// - SHA512 [FIPS180]
		hash = str_sha512(data);
		break;
	case 11:// - SHA224 [FIPS180]
		hash = str_sha224(data);
	default:
		break;
	}
	return hash;
}

/**
 * Returns the hash size in bytes of the specified hash algorithm type
 * @param {Integer} algo Hash algorithm type (See RFC4880 9.4)
 * @return {Integer} Size in bytes of the resulting hash
 */
function openpgp_crypto_getHashByteLength(algo) {
	var hash = null;
	switch(algo) {
	case 1: // - MD5 [HAC]
		return 16;
	case 2: // - SHA-1 [FIPS180]
	case 3: // - RIPE-MD/160 [HAC]
		return 20;
	case 8: // - SHA256 [FIPS180]
		return 32;
	case 9: // - SHA384 [FIPS180]
		return 48
	case 10:// - SHA512 [FIPS180]
		return 64;
	case 11:// - SHA224 [FIPS180]
		return 28;
	}
	return null;
}

/**
 * Retrieve secure random byte string of the specified length
 * @param {Integer} length Length in bytes to generate
 * @return {String} Random byte string
 */
function openpgp_crypto_getRandomBytes(length) {
	var result = '';
	for (var i = 0; i < length; i++) {
		result += String.fromCharCode(openpgp_crypto_getSecureRandomOctet());
	}
	return result;
}

/**
 * Return a pseudo-random number in the specified range
 * @param {Integer} from Min of the random number
 * @param {Integer} to Max of the random number (max 32bit)
 * @return {Integer} A pseudo random number
 */
function openpgp_crypto_getPseudoRandom(from, to) {
	return Math.round(Math.random()*(to-from))+from;
}

/**
 * Return a secure random number in the specified range
 * @param {Integer} from Min of the random number
 * @param {Integer} to Max of the random number (max 32bit)
 * @return {Integer} A secure random number
 */
function openpgp_crypto_getSecureRandom(from, to) {
	var buf = new Uint32Array(1);
	window.crypto.getRandomValues(buf);
	var bits = ((to-from)).toString(2).length;
	while ((buf[0] & (Math.pow(2, bits) -1)) > (to-from))
		window.crypto.getRandomValues(buf);
	return from+(Math.abs(buf[0] & (Math.pow(2, bits) -1)));
}

function openpgp_crypto_getSecureRandomOctet() {
	var buf = new Uint32Array(1);
	window.crypto.getRandomValues(buf);
	return buf[0] & 0xFF;
}

/**
 * Create a secure random big integer of bits length
 * @param {Integer} bits Bit length of the MPI to create
 * @return {BigInteger} Resulting big integer
 */
function openpgp_crypto_getRandomBigInteger(bits) {
	if (bits < 0)
	   return null;
	var numBytes = Math.floor((bits+7)/8);

	var randomBits = openpgp_crypto_getRandomBytes(numBytes);
	if (bits % 8 > 0) {
		
		randomBits = String.fromCharCode(
						(Math.pow(2,bits % 8)-1) &
						randomBits.charCodeAt(0)) +
			randomBits.substring(1);
	}
	return new openpgp_type_mpi().create(randomBits).toBigInteger();
}

function openpgp_crypto_getRandomBigIntegerInRange(min, max) {
	if (max.compareTo(min) <= 0)
		return;
	var range = max.subtract(min);
	var r = openpgp_crypto_getRandomBigInteger(range.bitLength());
	while (r > range) {
		r = openpgp_crypto_getRandomBigInteger(range.bitLength());
	}
	return min.add(r);
}


//This is a test method to ensure that encryption/decryption with a given 1024bit RSAKey object functions as intended
function openpgp_crypto_testRSA(key){
	debugger;
    var rsa = new RSA();
	var mpi = new openpgp_type_mpi();
	mpi.create(openpgp_encoding_eme_pkcs1_encode('ABABABAB', 128));
	var msg = rsa.encrypt(mpi.toBigInteger(),key.ee,key.n);
	var result = rsa.decrypt(msg, key.d, key.p, key.q, key.u);
}

/**
 * @typedef {Object} openpgp_keypair
 * @property {openpgp_packet_keymaterial} privateKey 
 * @property {openpgp_packet_keymaterial} publicKey
 */

/**
 * Calls the necessary crypto functions to generate a keypair. 
 * Called directly by openpgp.js
 * @param {Integer} keyType Follows OpenPGP algorithm convention.
 * @param {Integer} numBits Number of bits to make the key to be generated
 * @return {openpgp_keypair}
 */
function openpgp_crypto_generateStaticKeyPair(keyType, numBits, passphrase, s2kHash, symmetricEncryptionAlgorithm){
	var privKeyPacket;
	var publicKeyPacket;
	var d = new Date();
	d = d.getTime()/1000;
	var timePacket = String.fromCharCode(Math.floor(d/0x1000000%0x100)) + String.fromCharCode(Math.floor(d/0x10000%0x100)) + String.fromCharCode(Math.floor(d/0x100%0x100)) + String.fromCharCode(Math.floor(d%0x100));
	switch(keyType){
	case 1:
	    var rsa = new RSA();
	    //var key = rsa.generate(numBits,"10001");
		
		var key2 = new keyObject();
		key2.e = 65537;
		key2.ee = new BigInteger();
		key2.ee["0"] = 65537;
		key2.ee["s"] = 0;
		key2.ee["t"] = 1;
		key2.n = new BigInteger();
		key2.n["0"]=193171445;
		key2.n["1"]=28116597;
		key2.n["2"]=254750206;
		key2.n["3"]=195718440;
		key2.n["4"]=21064961;
		key2.n["5"]=95014683;
		key2.n["6"]=177166916;
		key2.n["7"]=109429234;
		key2.n["8"]=187971977;
		key2.n["9"]=125126536;
		key2.n["10"]=202472953;
		key2.n["11"]=168972672;
		key2.n["12"]=46113254;
		key2.n["13"]=240257507;
		key2.n["14"]=105284524;
		key2.n["15"]=126477917;
		key2.n["16"]=225271107;
		key2.n["17"]=11407475;
		key2.n["18"]=242572367;
		key2.n["19"]=129193084;
		key2.n["20"]=157216697;
		key2.n["21"]=155624672;
		key2.n["22"]=42550167;
		key2.n["23"]=111301087;
		key2.n["24"]=191098105;
		key2.n["25"]=203479526;
		key2.n["26"]=229657387;
		key2.n["27"]=108626413;
		key2.n["28"]=134682719;
		key2.n["29"]=221137125;
		key2.n["30"]=44196878;
		key2.n["31"]=14699108;
		key2.n["32"]=57376216;
		key2.n["33"]=65889837;
		key2.n["34"]=177934319;
		key2.n["35"]=83555462;
		key2.n["36"]=32074;
		key2.n["37"]=0;
		key2.n["t"]=37;
		key2.n["s"]=0;
		
		key2.d = new BigInteger();
		key2.d["0"]=214704677;
		key2.d["1"]=27737833;
		key2.d["2"]=114073401;
		key2.d["3"]=84149466;
		key2.d["4"]=249180514;
		key2.d["5"]=9835089;
		key2.d["6"]=217940351;
		key2.d["7"]=258929893;
		key2.d["8"]=209223479;
		key2.d["9"]=134318956;
		key2.d["10"]=191340573;
		key2.d["11"]=87300688;
		key2.d["12"]=54120025;
		key2.d["13"]=27447591;
		key2.d["14"]=126162299;
		key2.d["15"]=102535858;
		key2.d["16"]=89584753;
		key2.d["17"]=39367897;
		key2.d["18"]=229549023;
		key2.d["19"]=11707097;
		key2.d["20"]=149574977;
		key2.d["21"]=182742972;
		key2.d["22"]=247632267;
		key2.d["23"]=113286219;
		key2.d["24"]=148158230;
		key2.d["25"]=91659918;
		key2.d["26"]=246075002;
		key2.d["27"]=60087244;
		key2.d["28"]=77912472;
		key2.d["29"]=148719900;
		key2.d["30"]=211561626;
		key2.d["31"]=111870018;
		key2.d["32"]=220907864;
		key2.d["33"]=257140849;
		key2.d["34"]=10845861;
		key2.d["35"]=36901592;
		key2.d["36"]=32036;
		key2.d["t"]=37;
		key2.d["s"]=0;
		
		key2.p = new BigInteger();
		key2.p["0"]=149691943;
		key2.p["1"]=23613694;
		key2.p["2"]=44514634;
		key2.p["3"]=231536258;
		key2.p["4"]=112886237;
		key2.p["5"]=101181463;
		key2.p["6"]=125181975;
		key2.p["7"]=239937786;
		key2.p["8"]=51909041;
		key2.p["9"]=243133724;
		key2.p["10"]=76836666;
		key2.p["11"]=267913580;
		key2.p["12"]=195946898;
		key2.p["13"]=24695164;
		key2.p["14"]=201881557;
		key2.p["15"]=69563490;
		key2.p["16"]=227218761;
		key2.p["17"]=100743124;
		key2.p["18"]=238;
		key2.p["t"]=19;
		key2.p["s"]=0
		
		key2.q = new BigInteger();
		key2.q["0"]=115740291;
		key2.q["1"]=195281020;
		key2.q["2"]=161110327;
		key2.q["3"]=43624803;
		key2.q["4"]=201514287;
		key2.q["5"]=89656292;
		key2.q["6"]=179393648;
		key2.q["7"]=155436287;
		key2.q["8"]=216321152;
		key2.q["9"]=200207220;
		key2.q["10"]=133080419;
		key2.q["11"]=157278334;
		key2.q["12"]=187327019;
		key2.q["13"]=49847565;
		key2.q["14"]=94493661;
		key2.q["15"]=137751597;
		key2.q["16"]=8388001;
		key2.q["17"]=148669892;
		key2.q["18"]=134;
		key2.q["t"]=19;
		key2.q["s"]=0;
		
		key2.dmp1 = new BigInteger();
		key2.dmp1["0"]=35662527;
		key2.dmp1["1"]=241191382;
		key2.dmp1["2"]=101247628;
		key2.dmp1["3"]=87567909;
		key2.dmp1["4"]=144948609;
		key2.dmp1["5"]=68146906;
		key2.dmp1["6"]=67383069;
		key2.dmp1["7"]=97065138;
		key2.dmp1["8"]=195830281;
		key2.dmp1["9"]=111253152;
		key2.dmp1["10"]=264579234;
		key2.dmp1["11"]=28005825;
		key2.dmp1["12"]=227983043;
		key2.dmp1["13"]=59481186;
		key2.dmp1["14"]=87332707;
		key2.dmp1["15"]=248605073;
		key2.dmp1["16"]=236875961;
		key2.dmp1["17"]=223574943;
		key2.dmp1["18"]=191;
		key2.dmp1["19"]=107861217;
		key2.dmp1["20"]=237314582;
		key2.dmp1["21"]=61080102;
		key2.dmp1["22"]=79391856;
		key2.dmp1["23"]=161371828;
		key2.dmp1["24"]=233738874;
		key2.dmp1["25"]=206311629;
		key2.dmp1["26"]=103785837;
		key2.dmp1["27"]=219786901;
		key2.dmp1["28"]=168307343;
		key2.dmp1["29"]=53501803;
		key2.dmp1["30"]=147834328;
		key2.dmp1["31"]=75923941;
		key2.dmp1["32"]=187116831;
		key2.dmp1["33"]=245259151;
		key2.dmp1["34"]=224487059;
		key2.dmp1["35"]=57566131;
		key2.dmp1["36"]=105682211;
		key2.dmp1["37"]=134;
		key2.dmp1["t"]=19;
		key2.dmp1["s"]=0;
		
		key2.dmq1 = new BigInteger();
		key2.dmq1["0"]=106739543;
		key2.dmq1["1"]=214315523;
		key2.dmq1["2"]=72753773;
		key2.dmq1["3"]=51705617;
		key2.dmq1["4"]=122751148;
		key2.dmq1["5"]=216676416;
		key2.dmq1["6"]=248720099;
		key2.dmq1["7"]=257606489;
		key2.dmq1["8"]=116557554;
		key2.dmq1["9"]=173682109;
		key2.dmq1["10"]=11205554;
		key2.dmq1["11"]=6937714;
		key2.dmq1["12"]=238791622;
		key2.dmq1["13"]=162295576;
		key2.dmq1["14"]=196777374;
		key2.dmq1["15"]=19165555;
		key2.dmq1["16"]=91049728;
		key2.dmq1["17"]=248480694;
		key2.dmq1["18"]=60;
		key2.dmq1["19"]=75070119;
		key2.dmq1["20"]=168094361;
		key2.dmq1["21"]=168756973;
		key2.dmq1["22"]=192898140;
		key2.dmq1["23"]=111613213;
		key2.dmq1["24"]=93008427;
		key2.dmq1["25"]=13394115;
		key2.dmq1["26"]=75437894;
		key2.dmq1["27"]=152390239;
		key2.dmq1["28"]=42618545;
		key2.dmq1["29"]=68373122;
		key2.dmq1["30"]=156316288;
		key2.dmq1["31"]=218966326;
		key2.dmq1["32"]=144566151;
		key2.dmq1["33"]=112362134;
		key2.dmq1["34"]=24335275;
		key2.dmq1["35"]=240829465;
		key2.dmq1["36"]=24586239;
		key2.dmq1["37"]=238;
		key2.dmq1["t"]=19;
		key2.dmq1["s"]=0;
		
		key2.u = new BigInteger();
		key2.u["0"]=212100187;
		key2.u["1"]=21850714;
		key2.u["2"]=222387882;
		key2.u["3"]=8078725;
		key2.u["4"]=143010712;
		key2.u["5"]=220364390;
		key2.u["6"]=227150342;
		key2.u["7"]=161507901;
		key2.u["8"]=153730567;
		key2.u["9"]=238493415;
		key2.u["10"]=265859139;
		key2.u["11"]=240358851;
		key2.u["12"]=208776003;
		key2.u["13"]=94513407;
		key2.u["14"]=182788419;
		key2.u["15"]=103521371;
		key2.u["16"]=51146378;
		key2.u["17"]=66768927;
		key2.u["18"]=8;
		key2.u["t"]=19;
		key2.u["s"]=0;
		
		var key = key2;
		
	    privKeyPacket = new openpgp_packet_keymaterial().write_private_key(keyType, key, passphrase, s2kHash, symmetricEncryptionAlgorithm, timePacket);
	    publicKeyPacket =  new openpgp_packet_keymaterial().write_public_key(keyType, key, timePacket);
	    break;
	default:
		util.print_error("Unknown keytype "+keyType)
	}
	return {privateKey: privKeyPacket, publicKey: publicKeyPacket};
}

function openpgp_crypto_generateKeyPair(keyType, numBits, passphrase, s2kHash, symmetricEncryptionAlgorithm){
	var privKeyPacket;
	var publicKeyPacket;
	var d = new Date();
	d = d.getTime()/1000;
	var timePacket = String.fromCharCode(Math.floor(d/0x1000000%0x100)) + String.fromCharCode(Math.floor(d/0x10000%0x100)) + String.fromCharCode(Math.floor(d/0x100%0x100)) + String.fromCharCode(Math.floor(d%0x100));
	switch(keyType){
	case 1:
	    var rsa = new RSA();
	    var key = rsa.generate(numBits,"10001");
		
	    privKeyPacket = new openpgp_packet_keymaterial().write_private_key(keyType, key, passphrase, s2kHash, symmetricEncryptionAlgorithm, timePacket);
	    publicKeyPacket =  new openpgp_packet_keymaterial().write_public_key(keyType, key, timePacket);
	    break;
	default:
		util.print_error("Unknown keytype "+keyType)
	}
	return {privateKey: privKeyPacket, publicKey: publicKeyPacket};
}

function openpgp_crypto_generateUserKeyPair(keyType, numBits, passphrase, s2kHash, symmetricEncryptionAlgorithm, seed){
	var privKeyPacket;
	var publicKeyPacket;
	var d = new Date();
	d = d.getTime()/1000;
	var timePacket = String.fromCharCode(Math.floor(d/0x1000000%0x100)) + String.fromCharCode(Math.floor(d/0x10000%0x100)) + String.fromCharCode(Math.floor(d/0x100%0x100)) + String.fromCharCode(Math.floor(d%0x100));
	switch(keyType){
	case 1:
	    var rsa = new RSA();
	    //var key = rsa.generate(numBits,"10001");
		var key = seed;
	    privKeyPacket = new openpgp_packet_keymaterial().write_private_key(keyType, key, passphrase, s2kHash, symmetricEncryptionAlgorithm, timePacket);
	    publicKeyPacket =  new openpgp_packet_keymaterial().write_public_key(keyType, key, timePacket);
	    break;
	default:
		util.print_error("Unknown keytype "+keyType)
	}
	return {privateKey: privKeyPacket, publicKey: publicKeyPacket};
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
