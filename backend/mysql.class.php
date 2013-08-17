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
}

$GLOBALS['mysql'] = new sql();
?>