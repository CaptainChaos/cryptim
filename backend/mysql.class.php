<?php
if(!defined("SECURE")) die("NOT ALLOWED!");
require_once("User.class.php");
class sql {
	private $host = "localhost";
	private $port = "3306";
	private $user = "root";
	private $pass = "";
	
	private $db = "cryptim";
	
	private $mysqli = NULL;
	
	public function __construct()
	{
		
		$this->mysqli = @new mysqli($this->host, $this->user, $this->pass, $this->db, $this->port);
		if ($this->mysqli->connect_error) {
		    FAILED("mysql.php",'Connect Error (' . $this->mysqli->connect_errno . ') '
		            . $this->mysqli->connect_error);
		}
	}
	
	public function getUserByNick($nick)
	{
		$qry = "SELECT * FROM users WHERE nick = '".$nick."';";
		DEBUG("mysql.php", $qry);
		$ret = array();
		if($result = $this->mysqli->query($qry))
		{
			while($row = $result->fetch_assoc())
			{
				$ret[] = new User($row['uid'], $row['nick'], $row['email'], $row['phone'], $row['password'], $row['publickey'], $row['privateseed'], $row['seclevel']);
			}
		} else {
			FAILED("mysql.php", "mysql qry failed");
		}
		return $ret;
	}
	
	public function uploadPubKey($id, $key)
	{
		$qry = "UPDATE users SET publickey = '".$key."' WHERE uid='".$id."'";
		DEBUG("mysql.php", $qry);
		if(!$this->mysqli->query($qry))
		{
			FAILED("mysql.php", "UPDATE PUBKEY - " . $this->mysqli->error);
		}
	}
	
	public function getFriends($uid)
	{
		$qry = "SELECT DISTINCT * FROM friends f, users u WHERE (f.uid1 = u.uid OR f.uid2 = u.uid) AND u.uid != $uid AND (f.uid1 = $uid OR f.uid2 = $uid)";
		DEBUG("mysql.php", $qry);
		$ret = array();
		if($result = $this->mysqli->query($qry))
		{
			$ret['contacts'] = array();
			while($r = $result->fetch_assoc())
			{
				$tmp = array();
				$tmp['id'] = $r['uid'];
				$tmp['name'] = $r['nick'];
				$tmp['publicKey'] = $r['publickey'];
				$tmp['friend'] = true;
				$tmp['security'] = $r['seclevel'];
				$tmp['unread'] = array();
				$ret['contacts'][] = $tmp;
			}
		}
		for ($i=0; $i < count($ret['contacts']); $i++) {
			$qry2 = "SELECT DISTINCT time date, chat.from, message FROM chat WHERE (chat.from = '".$ret['contacts'][$i]['id']."' AND chat.to = '".$uid."');";
			DEBUG("mysql.php", $qry2);
			
			if($result2 = $this->mysqli->query($qry2))
			{
				while($row2 = $result2->fetch_assoc())
				{
					$ret['contacts'][$i]['unread'][] = $row2;
				}
			}
		}
		return $ret;
	}
}


$GLOBALS['mysql'] = new sql();
?>