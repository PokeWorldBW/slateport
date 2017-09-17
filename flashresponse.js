var exports = {
	link: "http://pastebin.com/zEKg6c3P",
	settings: {
		on: false,
		channels: [],
		words: [],
		message: ""
	},
	loadFlashSettings: function() {
        cleanFile('flashautoresponse.json');
        try {
            this.settings = JSON.parse(sys.getFileContent('flashautoresponse.json'));
        } catch (e) { /* nothing */ };
    },
	saveFlashSettings: function saveSettings() {
        if (!sys.isSafeScripts()) {
            sys.writeToFile('flashautoresponse.json', JSON.stringify(this.settings));
        }
    },
    readable: function readable(arr, last_delim) {
        if (!Array.isArray(arr))
            return arr;
        if (arr.length > 1) {
            return arr.slice(0, arr.length - 1).join(", ") + " " + last_delim + " " + arr.slice(-1)[0];
        } else if (arr.length == 1) {
            return arr[0];
        } else {
            return "";
        }
    },
	commandHandler: function(command, commandData, channel) {
		if (command === "flashcommands" || command === "fcommands" || command === "frcommands") {
			[
				["fcommands", "To see the commands for flash auto response"],
				["fr[on/off]", "To toggle flash auto response on and off"],
				["frchannels", "To view the channels you auto respond in"],
				["[add/remove]frchannel [channel]", "To add or remove channels for you to auto respond in"],
				["frmessage [message]", "To set the message you respond with when flashed"],
				["frstalk [word]", "To set words you auto respond to"],
				["unfrstalk [word]", "To remove words you auto respond to"],
				["frstalks", "To see what words you auto respond to"]
			].forEach(function(command) {
				sendMessage(commandsymbol + command[0] + ": " + command[1]);
			});
			return true;
		}
		if (command == "fron") {
			this.settings.on = true;
			sendBotMessage("You turned on the flash auto response script.");
			this.saveFlashSettings();
			return true;
		}
		if (command == "froff") {
			this.settings.on = false;
			sendBotMessage("You turned off the flash auto response script.");
			this.saveFlashSettings();
			return true;
		}
		if (command === "frchannels") {
			sendBotMessage("You will auto respond in " + this.readable(this.settings.channels, "and") + ".");
			return true;
		}
        if (command === "addfrchannel") {
            var nfrchannel = commandData;
            if (nfrchannel.search(/, /g) !== -1 || nfrchannel.search(/ ,/g) !== -1) {
                nfrchannel = nfrchannel.replace(/, /g, ",")
                    .replace(/ ,/g, ",");
            }
            nfrchannel = nfrchannel.split(",");
            this.settings.channels = Utilities.eliminateDuplicates(nfrchannel.concat(this.settings.channels));
            this.saveFlashSettings();
            sendBotMessage("You added " + commandData + " to your flash autoresponse channels!");
			return true;
        }
        if (command === "removefrchannel") {
            commandData = commandData.toLowerCase();
            for (var x = 0; x < this.settings.channels.length; x++) {
                if (this.settings.channels[x].toLowerCase() === commandData) {
                    this.settings.channels.splice(x, 1);
                    this.saveFlashSettings();
                    sendBotMessage("You removed " + commandData + " from your flash autoresponse channels!");
                    return true;
                }
            }
            sendBotMessage(commandData + " is not a flash autoresponse channel!");
			return true;
        }
		if (command === "frmessage") {
			if (!commandData) {
				sendBotMessage("The message you are currently responding with is: " + this.settings.message);
				return true;
			}
			this.settings.message = commandData;
			this.saveFlashSettings();
			sendBotMessage("You set your flash auto response message to " + this.settings.message);
			return true;
		}
        if (command === "frstalk") {
			if (!commandData) return true;
            var nstalkwords = commandData;
            if (nstalkwords.search(/, /g) !== -1 || nstalkwords.search(/ ,/g) !== -1) {
                nstalkwords = nstalkwords.replace(/, /g, ",")
                    .replace(/ ,/g, ",");
            }
            nstalkwords = nstalkwords.split(",");
            this.settings.words = Utilities.eliminateDuplicates(nstalkwords.concat(this.settings.words));
            this.saveFlashSettings();
            sendBotMessage("You will now auto respond when someone says " + commandData + "!");
			return true;
        }
        if (command === "unfrstalk") {
			if (!commandData) return true;
            commandData = commandData.toLowerCase();
            for (var x = 0; x < this.settings.words.length; x++) {
                if (this.settings.words[x].toLowerCase() === commandData) {
                    this.settings.words.splice(x, 1);
                    this.saveFlashSettings();
                    sendBotMessage("You will no longer auto respond when someone says " + commandData + "!");
                    return true;
                }
            }
            sendBotMessage("You are not auto responding to " + commandData + "!");
			return true;
        }
		if (command === "frstalks") {
			sendBotMessage("You are auto responding to " + this.readable([client.ownName()].concat(this.settings.words), "and") + ".");
			return true;
		}
	},
	beforeChannelMessage: function(message, channel, html) {
		if (this.settings.channels.length > 0) {
			if (this.settings.channels.map(function (channel) { return channel.toLowerCase(); }).indexOf(client.channelName(channel).toLowerCase()) === -1)
				return;
		}
		if (this.settings.on === false || !this.settings.message || html === true) return;
		
		var pos = message.indexOf(": ");
		var playname = message.substring(0, pos),
			playmessage = message.slice(pos + 2);
			
		if (playname === client.ownName() || client.id(playname) === -1) return;
		
		if ((new RegExp(client.ownName(), "i")).test(playmessage)) {
			client.network().sendChanMessage(channel, this.settings.message);
			return;
		}
		for (var i = 0; i < this.settings.words.length; i++) {
			if ((new RegExp(this.settings.words[i], "i")).test(playmessage)) {
				client.network().sendChanMessage(channel, this.settings.message);
				break;
			}
		};
	}
};
exports.loadFlashSettings();
module.exports = exports;
