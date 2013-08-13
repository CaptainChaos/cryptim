<?php
if(!defined("SECURE")) die("NOT ALLOWED!");

function DEBUG($from, $msg)
{
	if(defined("DEBUG"))
	{
		if(is_array($msg))
		{
			$GLOBALS['return']['debug'][] = $msg;
		} else {
			$GLOBALS['return']['debug'][] = "::" . $from . "::" . $msg;
		}
	}
}

function FAILED($from, $reason)
{
	$GLOBALS['return']['success'] = false;
	$GLOBALS['return']['error'][] = $reason;
}
?>