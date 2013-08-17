<?php
if(!defined("SECURE")) die("NOT ALLOWED!");
class User {
	private $id;
	private $nick;
	private $email;
	private $phone;
	
	private $pubkey;
	private $privseed;
	private $seclevel;
	
	private $pass;
	
	/*
	 * 
	 */
	public function __construct($i, $n, $e, $p, $pass, $pubkey = "", $seed = "", $level = 3)
	{
		$this->id = $i;
		$this->nick = $n;
		$this->email = $e;
		$this->phone = $p;
		$this->pubkey = $pubkey;
		$this->privseed = $seed;
		$this->seclevel = $level;
		$this->pass = $pass;
	}
	
	/**
	 * 
	 */
	public function getNick()
	{
		return $this->nick;
	}
	
	public function getEmail()
	{
		return $this->email;
	}
	
	public function getPhone()
	{
		return $this->phone;
	}
	
	public function checkPass($pass)
	{
		return $this->pass == $pass;
	}
	
	public function getId()
	{
		return $this->id;
	}
	
	public function ready()
	{
		return true;
	}
	
	public function toString()
	{
		return $this->id . ":" . $this->nick;
	}
	
	public function toArr()
	{
		$ret = array();
		$ret["id"] = $this->id;
		$ret["nick"] = $this->nick;
		$ret["email"] = $this->email;
		$ret["phone"] = $this->phone;
		$ret["pubkey"] = $this->pubkey;
		$ret["privseed"] = $this->privseed;
		$ret["seclevel"] = $this->seclevel;
		return $ret;		
	}
	
}
?>