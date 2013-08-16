<?php
if(!defined("SECURE")) die("NOT ALLOWED!");
class User {
	private $id;
	private $nick;
	private $email;
	private $phone;
	private $pass;
	
	/*
	 * 
	 */
	public function __construct($i, $n, $e, $p, $pass)
	{
		$this->id = $i;
		$this->nick = $n;
		$this->email = $e;
		$this->phone = $p;
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
}
?>