$(document).ready(function(){
	$.ajaxSetup({ cache: false });
	openpgp.init();
	$(window).resize(UI.makePageLayout);
	UI.makePageLayout();
	UI.showHome();
	$("#loginButton").click(function() {
		if($("#userNameField").val() != "" && $("#userNameField").val() != $("#userNameField").attr("standart")
				&& $("#passwordField").val() != "" && $("#passwordField").val() != $("#passwordField").attr("standart"))
		{
			User = new UserClass($("#userNameField").val());
			User.login($("#passwordField").val());
		}
	});
	Controller.init();
});

debug = function(param){
	console.log(param);
}
//debug = function(){}

User = {}; 
	
/**
 * Controller Object
 */
Controller = {
	contacts: {},
	groups: {},
	activeChat: null,
	ready: false,
	init: function(){
		debug("Controller.init: Initialization");
		this.textField = document.getElementById("messageTextField");
		this.sendButton = document.getElementById("messageSendButton");
		$(this.sendButton).click(this.sendMessageClick);
		this.messageList = document.getElementById("messageList");
		this.contactListFriends = document.getElementById("contactListFriendsDiv");
		this.contactListGroups = document.getElementById("contactListGroupsDiv");
		/*debug("Controller: => Connector.load");
		Connector.load(this.loaded,this);*/
	},
	loggedIn: function() {
		debug("Controller: => Connector.load");
		Connector.load(this.loaded,this);
	},
	loaded: function(){
		debug("Controller.loaded: Data loaded. Continue Initialization.");
		debug("Loading Contacts.");
		$.each(Connector.contacts, function(key,contact){
			var tmpContact = new Contact(contact.id,contact.name,contact.publicKey,contact.friend,contact.unread);
			Controller.contacts[contact.id] = tmpContact;
			if(contact.friend == true){
				Controller.contactListFriends.appendChild(tmpContact.getDom());
			}
		});
		debug("Loading Groups.");
		$.each(Connector.groups, function(key,group){
			var tmpGroup = new Group(group.id,group.name,group.members,group.unread);
			Controller.groups[group.id] = tmpGroup;
			Controller.contactListGroups.appendChild(tmpGroup.getDom());
		});
		debug("Loading Contact chats.");
		$.each(Connector.contacts, function(key,contact){
			if(contact.unread != null || contact.unread.length > 0)
				Controller.contacts[contact.id].createChat(contact.unread);
		});
		debug("Loading Group chats.")
		$.each(Connector.groups, function(key,group){
			if(group.unread != null)
				Controller.groups[group.id].createChat(group.unread);
		});
		this.ready = true;
	},
	getContactById: function(id){
		debug("Controller.getContactById: id = " + id);
		return this.contacts[id];
	},
	getGroupById: function(id){
		debug("Controller.getGroupById: id = " + id);
		return this.groups[id];
	},
	makeChatActive: function(chat){
		if(this.activeChat != null)
			this.activeChat.active = false;
		debug("Controller.makeChatActive");
		chat.active = true;
		debug(chat);
		this.activeChat = chat;
		$(this.messageList).empty().append(chat.getDom());
	},
	sendMessageClick: function(e){
		debug("Controller: sendMessageClick. Active Chat:");
		debug(Controller.activeChat);
		if(Controller.activeChat != null){
			Controller.activeChat.owner.sendMessage(Controller.textField.value);
		}
	}
}

UI = {
	showHome: function(){
		$('#menuChat,#menuHelp,#menuRegister').removeClass('menuItemActive');
		$('#menuHome').addClass('menuItemActive');
		$('#chatContainerDiv,#helpContainerDiv,#registerContainerDiv').hide();
		$('#homeContainerDiv').show();
	},
	showChat: function(){
		$('#menuHome,#menuHelp,#menuRegister').removeClass('menuItemActive');
		$('#menuChat').addClass('menuItemActive');
		$('#homeContainerDiv,#helpContainerDiv,#registerContainerDiv').hide();
		$('#chatContainerDiv').show();
	},
	showHelp: function(){
		$('#menuChat,#menuHome,#menuRegister').removeClass('menuItemActive');
		$('#menuHelp').addClass('menuItemActive');
		$('#chatContainerDiv,#homeContainerDiv,#registerContainerDiv').hide();
		$('#helpContainerDiv').show();
	},
	showRegister: function(){
		$('#menuChat,#menuHome,#menuHelp').removeClass('menuItemActive');
		$('#menuRegister').addClass('menuItemActive');
		$('#chatContainerDiv,#homeContainerDiv,#helpContainerDiv').hide();
		$('#registerContainerDiv').show();
	},
	makePageLayout: function(){
		debug("UI.makePageLayout");
		$('#messageBoxDiv').width($('#chatContainerDiv').width()-260);
		var h = $(window).height()-190;
		$('#contentDiv').height(h);
		$('#messageList').height(h-60);
	}
}

Connector = {
	contacts: null,
	groups: null,
	load: function(callback,context){
		debug("Connector.load");
		$.getJSON('backend/actions.php', {"action":"getFriends"}, function(ret){
			if(ret.success)
			{
				console.log(ret);
				Connector.contacts = ret.data.contacts;
				Connector.groups = new Array();
				callback.call(context);
			} else {
				alert(ret.error);
			}
			
		});
		$.getJSON('contacts.json', function(ret){
			console.log(ret.contacts);
		});
		
		/*$.getJSON('contacts.json', function(ret){
			console.log(ret.contacts);
			if(true)
			{
				Connector.contacts = ret.contacts;
				Connector.groups = new Array();
				callback.call(context);
			} else {
				alert(ret.error);
			}
			
		});*/
	},
	refresh: function(){
	
	},
	sendContactMessage: function(contactId,message,chat){
		var tmp = {
			from: User.id,
			contactId: contactId,
			message: message
		}
		debug(tmp);
	},
	sendGroupMessage: function(groupId,contactId,message,chat){
		var tmp = {
			from: User.id,
			groupId: groupId,
			contactId: contactId,
			message: message
		}
		debug(tmp);
	},
	inviteFriend: function(id){
	
	},
	encrypt: function(msg,contact){
		return msg;
	},
	decrypt: function(msg){
		return msg;
	}
}

/**
 *	ContactGroupSuper Super Object - not for instantiation!
 * @String id:		Contact ID (e.g."c123")
 * @String name:	Contact or Group name (e.g. "Hans" or "Teh Gang")
 * @String type:	"contact" or "group"
 * @Array unread:	Array of unread messages as plain JSON Object
 */
function ContactGroupSuper(id,name,type){
	var me = this;
	this.id = id;
	this.name = name;
	this.type = type;
	this.chat = null;
	this.domElem = null;
	this.unreadCount = 0;
	this.unreadCountElem = null;
	this.getDom = function(){
		if(this.domElem == null){
			debug("ContactGroupSuper.getDom: Contact / Group ID " + me.id);
			var tmpElem=null, tmpSpanElem=null, tmpTextElem=null;
			tmpElem = document.createElement('div');
			tmpElem.setAttribute("class", this.type);
			tmpElem.setAttribute("id", this.id);
			$(tmpElem).click(this.makeChatActive);
			tmpTextElem = document.createTextNode(this.name);
			tmpSpanElem = document.createElement('span');
			tmpSpanElem.setAttribute("class", "newMsgCount");
			tmpSpanElem.setAttribute("id", this.id + "NewMsgCount");
			if(this.unreadCount != 0){
				tmpSpanElem.appendChild(document.createTextNode("("+this.unreadCount+")"));
			}
			tmpElem.appendChild(tmpTextElem);
			tmpElem.appendChild(tmpSpanElem);
			this.unreadCountElem = tmpSpanElem;
			this.domElem = tmpElem;
		}
		return this.domElem;
	}
	this.createChat = function(unread){
		this.chat = new Chat(this,this.type,unread);
		this.setUnreadMessageCount(unread.length);
	}
	this.makeChatActive = function(e){
		debug("ContactGroupSuper.makeChatActive");
		Controller.makeChatActive(me.chat);
		me.setUnreadMessageCount(0);
		$(".contact, .group").removeClass("contactActive groupActive");
		$(me.domElem).addClass(me.type + "Active");
	}
	this.setUnreadMessageCount = function(count){
		me.unreadCount = count;
		me.updateUnreadMessages();
		
	}
	this.increaseUnreadMessageCount = function(){
		me.unreadCount += 1;
		me.updateUnreadMessages();
	}
	this.updateUnreadMessages = function(){
		debug("ContactGroupSuper.updateUnreadMessages");
		$(me.unreadCountElem).empty().append(document.createTextNode((me.unreadCount == 0 ? "" : "("+me.unreadCount+")")));
	}
	this.sendMessage = function(message){
		debug("ContactGroupSuper.sendMessage: " + message)
		var msgDate = new Date();
		switch(me.type){
			case "contact":
				if(me.symkey != null)
				{
					debug(me.symkey);
				} else {
					//RSA keyexchange
					$.getJSON("backend/actions.php", {"action" : "keyExchange", "uid":owner.id, "pubKey":"test"}, function(ret) {
						debug(ret);
					});
				}
				Connector.sendContactMessage(me.id, me.crypto.encrypt(message), me.chat);
				break;
			case "group":
				$.each(me.members, function(key,contact){
				// TODO! crypto object?
					Connector.sendGroupMessage(me.id, contact.id, contact.crypto.encrypt(message), me.chat);
				});
				break;
			default:
				debug("ConctactGroupSuper.sendMessage {switch default}");
		}
		me.chat.newMessage(message);
	}
	this.receiveMessage = function(message){
		me.chat.newMessage(message);
		if(Controller.activeChat != me.chat){
			me.increaseUnreadMessageCount();
		}
	}
}

/**
 *	Contact Object
 * @String id:		Contact ID (e.g."c123")
 * @String name:	Contact name (e.g."Hans")
 * @String pubKey:	Contacts public Key
 * @Boolean friend:	Is contact a friend? Only Friends are shown in list.
 * @Array unread:	Array of unread messages as plain JSON Object
 */
function Contact(id,name,pubKey,friend){
	ContactGroupSuper.call(this,id,name,"contact");
	this.symkey = null;
	this.pubKey = pubKey;
	this.friend = friend;
	this.crypto = new Crypto(pubKey,this);
}

/**
 *	Group Object
 * @String id:		Group ID (e.g."g123")
 * @String name:	Group name (e.g."Teh Gang")
 * @Array members:	Group Members in plain JSON (e.g.["c134","c325"])
 * @Array unread:	Unread messages in plain JSON Array
 */
function Group(id,name,members){
	ContactGroupSuper.call(this,id,name,"group");
	var me = this;
	this.members = [];
	$.each(members, function(key,val){
		me.members.push(Controller.getContactById(val));
	});
}

/**
 *	Chat Object
 * @Object owner:	Owners Contact or Group Object
 * @String type:	"contact" or "group"
 * @Array unread:	Old or unread messages as plain JSON Array (e.g. [{"from":"123425","date":"2012-08-30 15:22:51","msg":"Hi there!"}])
 */
function Chat(owner,type,messages){
	var me = this;
	this.owner = owner;
	this.type = type;
	this.messages = [];
	this.active = false;
	$.each(messages, function(key,message){
		var tmpMsg = new Message(message.from ,message.date, message.message);
		me.messages.push(tmpMsg);
	});
	this.chatDom = document.createElement("div");
	/**
	 * Receives a message for the chat in raw format
	 * @Object message: raw JSON object containing the message 
	 */
	this.newMessage = function(from,date,message){
		debug("Chat.newMessage: " + message);
		if(me.messages.length == 0){
			$(me.chatDom).empty();
		}
		var tmpMsg = new Message(from,date,message); // TODO: message.from => User
		me.messages.push(tmpMsg);
		me.chatDom.appendChild(tmpMsg.getDom());
	}
	/**
	 * Returns the DOM representation of the element
	 */
	this.getDom = function(){
		debug("Chat.getDom");
		$(me.chatDom).empty();
		$.each(me.messages, function(key,msg){
			me.chatDom.appendChild(msg.getDom());
		});
		if(me.messages.length == 0){
			me.chatDom.appendChild(document.createTextNode("no messages"));
		}
		return me.chatDom;
	}
}

/**
 *	Message Object
 * @Object from:	Senders Contact Object
 * @String date:	Date of sending
 * @String msg:		Message Text
 */
function Message(from,date,msg){
	var me = this;
	this.from = Controller.getContactById(from);
	this.date = date;
	this.message = msg;
	this.domElem = null;
	this.getDom = function(){
		if(this.domElem == null){
			var tmpMsgBody=null, tmpMsgHead=null, tmpMsgText=null;
			tmpMsgBody = document.createElement('div');
			tmpMsgBody.setAttribute('class','messageBody');
			tmpMsgHead = document.createElement('div');
			tmpMsgHead.setAttribute('class','messageHead');
			tmpMsgHead.appendChild(document.createTextNode(me.from.name + " " + me.date));
			tmpMsgText = document.createElement('div');
			tmpMsgText.setAttribute('class','messageText');
			tmpMsgText.appendChild(document.createTextNode(this.message));
			tmpMsgBody.appendChild(tmpMsgHead);
			tmpMsgBody.appendChild(tmpMsgText);
			this.domElem = tmpMsgBody;
		}
		return this.domElem;
	}
}

function showMessages(msg)
{
	console.log(msg);
}

