<?php
	header('Content-type: text/css');
	$bgColorPage = "#f6f6f6";
	$bgColorInner = "#ffffff";
	$borderRadius = "10px";
	$borderWidth = "2px";
	$borderColor = "#ddd";
	$border = $borderWidth . " solid " . $borderColor;
	
	$messageColor = "#dde";
	
	$borderRadiusSmall = "5px";
	$borderSmallWidth = "1px";
	$borderSmallColor = $borderColor;
	$borderSmall = $borderSmallWidth . " solid " . $borderSmallColor;
	switch($_GET['version']) {
		case 'desktop':
?>
	/* PAGE */

	body {
		background-color: <?php echo $bgColorPage ?>;
		font-family: Verdana;
	}

	#containerDiv {
		margin: 15px;
	}
	
	div.containerInnerDiv {
		margin: 0px auto;
		max-width: 1000px;
		background-color: <?php echo $bgColorInner ?>;
	}
	
	/* CAPTION DIV */
	
	#captionDiv {
		padding: 20px;
		background-color: inherit;
		font-family: Lucida Console;
		font-style: italic;
	}
	
	#captionTop {
		line-height: 36pt;
		font-size: 36pt;
		padding: 0;
		margin: 0px;
	}
	
	#captionSub {
		font-size: 12pt;
		line-height: 14pt;
		padding: 0;
		margin: 0px;
		font-style: normal;
	}
	
	/* MENU DIV */
	
	#menuDiv {
		max-width: 1042px;
		background-color: inherit;
		margin-top: -30px;
	}
	
	#menuDiv a {
		text-decoration: none;
		color: #000;
	}
	
	div.menuItem {
		float: right;
		padding: 10px 20px;
		min-height: 18px;
		border-left: <?php echo $border ?>;
		border-top: <?php echo $border ?>;
		border-top-left-radius: <?php echo $borderRadius ?>;
		border-top-right-radius: <?php echo $borderRadius ?>;
	}
	
	div.menuItemActive {
		background-color: <?php echo $bgColorInner ?>;
	}
	
	#menuLogin {
		float: right;
		padding: 5px 10px;
		min-height: 28px;
		border-left: <?php echo $border ?>;
		border-top: <?php echo $border ?>;
		border-top-left-radius: <?php echo $borderRadius ?>;
		border-top-right-radius: <?php echo $borderRadius ?>;
		border-right: <?php echo $border ?>;
	}
	
	#menuLogin input[type="text"] {
		width: 70px;
		height: 16px;
		font-size: 10px;
		font-family: Verdana;
		font-style: italic;
		text-align: center;
	}
	
	#menuLogin input[type="button"] {
		height: 24px;
	}
	
	div.floatBreaker {
		clear: both;
	}
	
	/* CONTENT DIV */
	
	#contentDiv {
		padding: 0px;
		border: <?php echo $border ?>;
		border-top-left-radius: <?php echo $borderRadius ?>;
		border-bottom-left-radius: <?php echo $borderRadius ?>;
		border-bottom-right-radius: <?php echo $borderRadius ?>;
		margin-top: -<?php echo $borderWidth ?>;
		max-width: 1040px;
	}
	
	div.containerOnly {
		padding: 0px;
		margin: 0px;
	}

	#contactListDiv {
		float: left;
		padding: 10px;
	}
	
	#messageBoxDiv {
		float: left;
		padding: 10px;
	}
	
	/* CONTACTS DIV */
	
	div.contactListGroup {
		margin-bottom: 10px;
		width: 180px;
		border: <?php echo $borderSmall ?>;
		border-radius: <?php echo $borderRadiusSmall ?>;
		background-color: <?php echo $bgColorPage ?>;
	}
	
	div.contactListGroupCaption {
		margin: 8px 8px 8px 13px;
		font-size: 12pt;
		font-style: italic;
	}
	
	div.contact {
		margin: 0px 4px 4px 4px;
		padding: 5px 5px 5px 8px;
		border: <?php echo $borderSmall ?>;
		border-radius: <?php echo $borderRadiusSmall ?>;
		background-color: <?php echo $bgColorInner ?>;
		cursor: pointer;
	}
	
	div.contactActive {
		background-color: <?php echo $borderSmallColor ?> !important;
	}
	
	span.newMsgCount {
		font-style: italic;
		font-size: 9pt;
		margin-left: 6px;
	}
	
	div.group {
		margin: 0px 4px 4px 4px;
		padding: 5px 5px 5px 8px;
		border: <?php echo $borderSmall ?>;
		border-radius: <?php echo $borderRadiusSmall ?>;
		background-color: <?php echo $bgColorInner ?>;
		cursor: pointer;
	}
	
	div.groupActive {
		background-color: <?php echo $borderSmallColor ?> !important;
	}
	
	/* CHAT DIV */
	
	#messageList {
		width: 100%;
		scrolling: vertical;
	}
	
	div.messageBody {
		border: <?php echo $borderSmall ?>;
		border-radius: <?php echo $borderRadiusSmall ?>;
		background-color: <?php echo $messageColor ?>;
		padding: 10px;
		width: 100%;
		margin-bottom: 10px;
	}
	
	div.messageHead {
		font-size: 7pt;
		font-style: italic;
	}
	
	div.messageText {
	
	}
	
	#messageInputArea {
		border: <?php echo $borderSmall ?>;
		border-radius: <?php echo $borderRadiusSmall ?>;
		background-color: <?php echo $bgColorInner ?>;
		padding: 5px 10px;
		width: 100%;
		margin-bottom: 10px;
		background-color: <?php echo $bgColorPage ?>;
		font-size: 12pt;
		font-style: italic;
	}
	
	/* FOOTER DIV */
	
	#footerMenuDiv {
		padding: 10px;
		max-width: 1020px;
		font-size: 8pt;
		margin: 20px auto;
		border-top-right-radius: <?php echo $borderRadius ?>;
		border-top-left-radius: <?php echo $borderRadius ?>;
		border-bottom-right-radius: <?php echo $borderRadius ?>;
		border-bottom-left-radius: <?php echo $borderRadius ?>;
		border: <?php echo $border ?>;
	}
	
	#footerMenuDiv a {
		text-decoration: none;
		color: #000;
	}
	
	div.footerMenuItem {
		float: left;
		padding: 10px 20px;
		border-right: <?php echo $border ?>;
	}
<?php
			break;
		default: 
			echo "CSS version parameter is missing";
			break;
	}
?>