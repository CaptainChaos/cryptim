<?php
define("DEBUG", 1);
define("SECURE", 1);

require_once("functions.php");
require_once("User.class.php");
require_once("mysql.class.php");

session_start();

$GLOBALS['return'] = array("success" => true);
$GLOBALS['return']['error'] = array();

DEBUG("action.php", "debugging on");
$GLOBALS['params'] = array_merge($_POST, $_GET);
DEBUG("action.php", $GLOBALS['params']);

if(isset($GLOBALS['params']['action']) && ($GLOBALS['params']['action'] == "register" || $GLOBALS['params']['action'] == "login") && (!isset($_SESSION['user']) || !$_SESSION['user']->ready()))
{
	switch($GLOBALS['params']['action'])
	{
		case "login":
			DEBUG("action.php", "login started");
			$users = $GLOBALS['mysql']->getUserByNick($GLOBALS['params']['username']);
			foreach($users as $user)
			{
				if($user->checkPass($GLOBALS['params']['password']))
				{
					DEBUG("actions.php", "logged in!");
					$_SESSION['user'] = $user;
					$GLOBALS['return']['user'] = $user->toArr();
					break;
				}
			}
			if(!isset($_SESSION['user']) || $_SESSION['user'] == NULL)
			{
				FAILED("actions.php", "no user found, or password wrong!");
			}
			DEBUG("actions.php", $user->toString());
			break;
		case "checkSession":
			FAILED("actions.php", "no session found");
			break;
		case "register":
			DEBUG("action.php", "register started");
			break;
		default:
			FAILED("action.php", "action not known");
			break;
	}
} else {
	//check session
	switch($GLOBALS['params']['action']) {
		case "login":
			FAILED("actions.php", "already logged in");
			break;
		case "register":
			FAILED("actions.php", "already registered");
			break;
		case "uploadPubKey":
			$GLOBALS['mysql']->uploadPubKey($_SESSION['user']->getId(), $GLOBALS['params']['key']);
			break;
		case "logout":
			$_SESSION['user'] = NULL;
			break;
		case "checkSession":
			$GLOBALS['return']['user'] = $_SESSION['user']->toArr();
			break;
		default:
			FAILED("actions.php", "action not known");
			break;
	}
}


echo json_encode($GLOBALS['return']);
?>