$(document).ready(function(){
	openpgp.init();
	$(window).resize(UI.makePageLayout);
	UI.makePageLayout();
	UI.showChat();
	Controller.init();
});

debug = function(param){
	console.log(param);
}
//debug = function(){}

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
		debug("Controller: => Connector.load")
		Connector.load(this.loaded,this);
	},
	loaded: function(){
		debug("Controller.loaded: Data loaded. Continue Initialization.");
		$.each(Connector.contacts, function(key,contact){
			var tmpContact = new Contact(contact.id,contact.name,contact.publicKey,contact.friend,contact.unread);
			Controller.contacts[contact.id] = tmpContact;
			if(contact.friend == true){
				Controller.contactListFriends.appendChild(tmpContact.getDom());
			}
		});
		$.each(Connector.groups, function(key,group){
			var tmpGroup = new Group(group.id,group.name,group.members,group.unread);
			Controller.groups[group.id] = tmpGroup;
			Controller.contactListGroups.appendChild(tmpGroup.getDom());
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
		//chat.active = true;
		this.activeChat = chat;
		$(this.messageList).empty().append(chat.getDom());
	},
	sendMessageClick: function(e){
		debug("Controller: sendMessageClick. Active Chat:");
		debug(Controller.activeChat);
		if(Controller.activeChat != null){
			Controller.activeChat.sendMessage(Controller.textField.value);
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
	}
}

Connector = {
	contacts: null,
	groups: null,
	load: function(callback,context){
		debug("Connector.load");
		$.getJSON('contacts.json', function(data){
			Connector.contacts = data.contacts;
			Connector.groups = data.groups;
			callback.call(context);
		});
	},
	refresh: function(){
	
	},
	sendMessage: function(to,chat,msg){
		
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
function ContactGroupSuper(id,name,type,unread){
	var me = this;
	this.id = id;
	this.name = name;
	this.type = type;
	this.chat = new Chat(this,this.type,unread);
	this.domElem = null;
	this.unreadCount = unread.length;
	this.unreadCountElem = null;
	this.getDom = function(){
		if(this.domElem == null){
			debug("ContactGroupSuper.getDom: Contact / Group ID " + me.id)
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
}

/**
 *	Contact Object
 * @String id:		Contact ID (e.g."c123")
 * @String name:	Contact name (e.g."Hans")
 * @String pubKey:	Contacts public Key
 * @Boolean friend:	Is contact a friend? Only Friends are shown in list.
 * @Array unread:	Array of unread messages as plain JSON Object
 */
function Contact(id,name,pubKey,friend,unread){
	ContactGroupSuper.call(this,id,name,"contact",unread);
	this.symkey = null;
	this.pubKey = pubKey;
	this.friend = friend;
}

/**
 *	Group Object
 * @String id:		Group ID (e.g."g123")
 * @String name:	Group name (e.g."Teh Gang")
 * @Array members:	Group Members in plain JSON (e.g.["c134","c325"])
 * @Array unread:	Unread messages in plain JSON Array
 */
function Group(id,name,members,unread){
	ContactGroupSuper.call(this,id,name,"group",unread);
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
	 * Sends a message to the chat participants
	 * @String message: The message object as raw string
	 */
	this.sendMessage = function(message){
		debug("Chat.sendMessage: " + message);
		switch(this.type){
			case "contact":
				debug("Chat: send msg to contact");
				if(owner.symkey != null)
				{
					debug(owner.symkey);
				} else {
					//RSA keyexchange
					$.getJSON("backend/action.php", {"action" : "keyExchange", "uid":owner.id, "pubKey":"test"}, function(ret) {
						debug(ret);
					});
				}
				
				
				//debug(openpgp.write_encrypted_message(pair, message));
				break;
			case "group":
				
				break;
			default:
				console.log("Wrong chat type in " + me.owner.id);
				break;
		}
	}
	/**
	 * Receives a message for the chat in raw format
	 * @Object message: raw JSON object containing the message 
	 */
	this.receiveMessage = function(message){
		debug("Chat.receiveMessage: " + message.message);
		if(me.messages.length == 0){
			$(me.chatDom).empty();
		}
		var tmpMsg = new Message(message.from,message.date,message.message);
		me.messages.push(tmpMsg);
		me.chatDom.appendChild(tmpMsg.getDom());
		if(Controller.activeChat != me){
			me.owner.increaseUnreadMessageCount();
		}
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
	this.fromId = from;
	this.from = null;
	this.date = date;
	this.message = msg;
	this.domElem = null;
	this.getDom = function(){
		if(this.domElem == null){
			this.from = Controller.getContactById(this.fromId);
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



