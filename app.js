import app from "./client.js";
import { getSSService, logInteraction, saveState } from "./datahandler.js";
const aiApiUrl = "https://ai.hackclub.com/chat/completions";
const headers = {
	"Content-Type": "application/json"
};
const lraj23BotTestingId = "C09GR27104V";
const lraj23UserId = "U0947SL6AKB";
const iWillBuryYouAliveInADarkAlleyAndLetTheRatsFeastUponYourCorpse = "i-will-bury-you-alive-in-a-dark-alley-and-let-the-rats-feast-upon-your-corpse";
const isCommunicating = (userId, SSService) => !SSService.signals.map(signal => [signal.sender, signal.receiver]).flat().reduce((product, id) => product * (+!(id === userId)), 1);
const receivingSignal = (userId, SSService) => SSService.signals.find(signal => signal.receiver === userId);
const communicationIsIn = (userId, SSService) => SSService.signals.find(signal => [signal.sender, signal.receiver].includes(userId));

app.message("", async ({ message }) => {
	let SSService = getSSService();
	const userId = message.user;
	if (!SSService.signalOptedIn.includes(userId)) {
		if (message.channel === lraj23BotTestingId) await app.client.chat.postEphemeral({
			channel: lraj23BotTestingId,
			user: userId,
			blocks: [
				{
					type: "section",
					text: {
						type: "mrkdwn",
						text: "You aren't opted in to Secret Signal Service! Opt in to \"Signals\" with /ssservice-edit-opts"
					}
				}
			],
			text: "You aren't opted in to Secret Signal Service! Opt in to \"Signals\" with /ssservice-edit-opts",
			thread_ts: ((message.thread_ts == message.ts) ? null : message.thread_ts)
		});
		return;
	}
	if (message.text.toLowerCase().includes("secret button"))
		await app.client.reactions.add({
			channel: message.channel,
			name: "brilliant-move",
			timestamp: message.ts
		});
	// if (message.ts - SSService.apiRequests[userId] < 1) {
	// 	await app.client.reactions.add({
	// 		channel: message.channel,
	// 		name: "you-sent-a-message-too-fast-so-no-ai-request-to-avoid-rate-limit",
	// 		timestamp: message.ts
	// 	});
	// } else SSService.apiRequests[userId] = message.ts;
	if (receivingSignal(userId, SSService)) {
		const signal = receivingSignal(userId, SSService);
		try {
			await app.client.reactions.add({
				channel: message.channel,
				name: signal.signal[signal.sent] || "end-of-signal-also-" + iWillBuryYouAliveInADarkAlleyAndLetTheRatsFeastUponYourCorpse,
				timestamp: message.ts
			});
		} catch (e) {
			console.error(e);
		}
		console.log(signal.sent, signal.signal.length);
		if (signal.sent > signal.signal.length) SSService.signals.splice(SSService.signals.indexOf(signal), 1);
		else signal.sent++;
	}
	// const pastMessages = (await app.client.conversations.history({
	// 	token: process.env.CEMOJIS_BOT_TOKEN,
	// 	channel: message.channel,
	// 	latest: message.ts * 1000,
	// 	limit: 30
	// })).messages.reverse();
	// console.log(message.text);
	// const response = await fetch(aiApiUrl, {
	// 	method: "POST",
	// 	headers,
	// 	body: JSON.stringify({
	// 		model: "openai/gpt-oss-120b",
	// 		messages: [
	// 			{
	// 				role: "system",
	// 				content: systemMessage + new Date(Date.now()).toString() + ":\n" + pastMessages.map(msg => "User " + msg.user + " said (on " + new Date(1000 * msg.ts).toString() + "): " + msg.text).join("\n")
	// 			},
	// 			{
	// 				role: "user",
	// 				content: message.text
	// 			}
	// 		]
	// 	})
	// });
	// const data = await response.json();
	// if (data.error) if (data.error.message) if (data.error.message.split(":")[0] === "Rate limit exceeded") {
	// 	await app.client.reactions.add({
	// 		channel: message.channel,
	// 		name: "sorry-my-ai-api-got-rate-limited",
	// 		timestamp: message.ts
	// 	});
	// 	if (SSService.explanationOptedIn.includes(userId))
	// 		await app.client.chat.postEphemeral({
	// 			channel: message.channel,
	// 			user: userId,
	// 			text: "Your message was not reacted to because my AI API got rate limited. :sorry-my-ai-api-got-rate-limited:",
	// 			thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
	// 		});
	// 	return;
	// }
	// console.log(data.choices[0].message);
	// let reactions = data.choices[0].message.content.split(" ");
	// reactions = reactions.filter((reaction, i) => reactions.indexOf(reaction) === i);
	// reactions.forEach(async reaction => {
	// 	if (![...mainEmojis, ...sideEmojis].includes(reaction)) return;
	// 	const rand = Math.random();
	// 	if (rand < chances[reaction] * magicFactor) {
	// 		let unusedIds = new Array(SSService.powerUps.length).fill(null).map((val, i) => i);
	// 		for (let i = 0; i < SSService.powerUps.length; i++) {
	// 			if (SSService.powerUps.map(power => power.id).includes(i)) unusedIds.splice(unusedIds.indexOf(i), 1);
	// 			else break;
	// 		}
	// 		SSService.powerUps.push({
	// 			id: unusedIds[0],
	// 			owner: userId,
	// 			type: reaction,
	// 			active: false
	// 		});
	// 		reaction = "magical-" + reaction;
	// 	}
	// 	console.log(rand, reaction);
	// 	await app.client.reactions.add({
	// 		channel: message.channel,
	// 		name: reaction,
	// 		timestamp: message.ts
	// 	});
	// });
	saveState(SSService);
});

app.command("/ssservice-edit-opts", async interaction => {
	await interaction.ack();
	const userId = interaction.payload.user_id;
	let SSService = getSSService();
	const optInLevels = Object.entries({
		none: "Nothing",
		// data: "Only data :magical-" + mainEmojis[4] + ":",
		signal: "Signals",
		// explain: "EVERYTHING! :magical-" + mainEmojis[1] + ":"
	});
	const currentOpted = (SSService.signalOptedIn.includes(userId) ? "signal" : "none");
	await interaction.client.chat.postEphemeral({
		channel: interaction.command.channel_id,
		user: userId,
		text: "Choose which type of opt-in you want to have:",
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "Choose which type of opt-in you want to have:"
				},
				accessory: {
					type: "static_select",
					placeholder: {
						type: "plain_text",
						text: "Required",
						emoji: true
					},
					options: optInLevels.map(level => ({
						text: {
							type: "plain_text",
							text: level[1],
							emoji: true
						},
						value: level[0]
					})),
					initial_option: {
						text: {
							type: "plain_text",
							text: Object.fromEntries(optInLevels)[currentOpted],
							emoji: true
						},
						value: currentOpted
					},
					action_id: "ignore-opt-in-level"
				}
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: ":x: Cancel",
							emoji: true
						},
						value: "cancel",
						action_id: "cancel"
					},
					{
						type: "button",
						text: {
							type: "plain_text",
							text: ":white_check_mark: Go!",
							emoji: true
						},
						value: "confirm",
						action_id: "confirm-opt-change"
					}
				]
			}
		]
	});
});

app.action(/^ignore-.+$/, async interaction => await interaction.ack());

app.action("cancel", async interaction => [await interaction.ack(), await interaction.respond({ "delete_original": true })]);

app.action("confirm-opt-change", async interaction => {
	await interaction.ack();
	let SSService = getSSService();
	const userId = interaction.body.user.id;
	console.log(interaction.body.state.values);
	let optInLevel = interaction.body.state.values[Object.keys(interaction.body.state.values)[0]]["ignore-opt-in-level"].selected_option.value || "none";
	console.log(optInLevel);

	switch (optInLevel) {
		case "none":
			await interaction.respond("<@" + userId + "> set their opts to nothing. The bot will no longer interact with you whatsoever.");
			if (SSService.signalOptedIn.includes(userId)) SSService.signalOptedIn.splice(SSService.signalOptedIn.indexOf(userId), 1);
			break;
		case "signal":
			await interaction.respond("<@" + userId + "> set their opts to signals. The bot will be able to react to your messages and send you DMs related to signals that other users are trying to send you. You will also be able to send signals to other users through this bot. The bot will not send you messages or interact otherwise.");
			if (!SSService.signalOptedIn.includes(userId)) SSService.signalOptedIn.push(userId);
			break;
	}

	saveState(SSService);
});

app.command("/ssservice-send-signal", async interaction => {
	await interaction.ack();
	const SSService = getSSService();
	const userId = interaction.payload.user_id;
	if (!SSService.signalOptedIn.includes(userId))
		return await interaction.respond("You aren't opted into the Secret Signal Service's Signals! Opt in to \"Signals\" first with /ssservice-edit-opts before trying to send signals!");
	if (isCommunicating(userId, SSService))
		return await interaction.respond("You can't send another signal until your first signal completes. Ping or DM <@" + lraj23UserId + "> and ask him to manually end your signal for now.");
	await interaction.client.chat.postEphemeral({
		channel: interaction.command.channel_id,
		user: userId,
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "Choose someone to send a signal to:"
				},
				accessory: {
					type: "users_select",
					placeholder: {
						type: "plain_text",
						text: "Required",
						emoji: true
					},
					action_id: "ignore-signal-receiver"
				}
			},
			{
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "ignore-signal-text",
					placeholder: {
						type: "plain_text",
						text: "Max 32 characters"
					}
				},
				label: {
					type: "plain_text",
					text: "Type the signal you want to send:",
					emoji: true
				}
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: ":x: Cancel",
							emoji: true
						},
						value: "cancel",
						action_id: "cancel"
					},
					{
						type: "button",
						text: {
							type: "plain_text",
							text: ":white_check_mark: Go!",
							emoji: true
						},
						value: "confirm",
						action_id: "confirm"
					}
				]
			}
		],
		text: "Type the signal you want to send (Max 32 chars):"
	});
});

app.action("confirm", async interaction => {
	await interaction.ack();
	let SSService = getSSService();
	const userId = interaction.body.user.id;
	const channelId = interaction.body.channel.id;
	const givenInfo = interaction.body.state.values;
	console.log(givenInfo);
	let signalMsg = Object.entries(givenInfo).find(info => info[1]["ignore-signal-text"])[1]["ignore-signal-text"].value;
	let receiver = Object.entries(givenInfo).find(info => info[1]["ignore-signal-receiver"])[1]["ignore-signal-receiver"].selected_user;
	const warn = msg => interaction.client.chat.postEphemeral({
		channel: channelId,
		user: userId,
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: msg
				},
				accessory: {
					type: "button",
					text: {
						type: "plain_text",
						text: "Close"
					},
					action_id: "cancel"
				}
			}
		],
		text: msg
	});

	if (receiver === null)
		return await warn("Choose someone to send a signal to!");

	if (!SSService.signalOptedIn.includes(receiver))
		return await warn("<@" + receiver + "> is not opted in. Try someone else or tell them to opt in to \"Signals\" with /ssservice-edit-opts");

	if (signalMsg === null)
		return await warn("Type a signal!");

	if (signalMsg.length > 32)
		return await warn("The signal must be up to 32 characters long!");

	if (isCommunicating(receiver, SSService))
		return await warn("You can't send a signal to <@" + receiver + "> right now because they are currently communicating with someone else. Ping or DM <@" + lraj23UserId + "> and ask him to manually end your signal for now.");

	SSService.signals.push({
		sender: userId,
		receiver,
		signal: signalMsg,
		sent: 0
	});
	await interaction.respond("<@" + userId + "> sent a signal to <@" + receiver + "> with this message: \n" + signalMsg);
	await interaction.client.chat.postMessage({
		channel: receiver,
		text: "<@" + userId + "> has sent you a signal that is " + signalMsg.length + " characters long. Send messages in any channel with this bot to begin to understand the signal. Guess the signal with <a command that doesn't exist yet>"
	});
	saveState(SSService);
});

app.command("/ssservice-guess-signal", async interaction => {
	await interaction.ack();
	const SSService = getSSService();
	const userId = interaction.payload.user_id;
	if (userId !== lraj23UserId)
		return await interaction.respond("This feature is still in development...");
	if (!SSService.signalOptedIn.includes(userId))
		return await interaction.respond("You aren't opted into the Secret Signal Service's Signals! Opt in to \"Signals\" first with /ssservice-edit-opts before trying to send signals!");
	if (!receivingSignal(userId, SSService))
		return await interaction.respond("You can't guess the signal if you aren't receiving one! Try just not using this command until someone sends you a signal.");
	const signal = receivingSignal(userId, SSService);
	await interaction.client.chat.postEphemeral({
		channel: interaction.command.channel_id,
		user: userId,
		blocks: [
			{
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "ignore-guess-text",
					placeholder: {
						type: "plain_text",
						text: "Hint: length is " + signal.signal.length + " characters"
					}
				},
				label: {
					type: "plain_text",
					text: "Guess the signal sent to you by <@" + signal.sender + ">",
					emoji: true
				}
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: ":x: Cancel",
							emoji: true
						},
						value: "cancel",
						action_id: "cancel"
					},
					{
						type: "button",
						text: {
							type: "plain_text",
							text: ":white_check_mark: Go!",
							emoji: true
						},
						value: "confirm",
						action_id: "confirm-guess-signal"
					}
				]
			}
		],
		text: "Guess the signal sent to you by <@" + signal.sender + "> (Hint: it's " + signal.signal.length + " chars long):"
	});
});

app.action("confirm-guess-signal", async interaction => {
	await interaction.ack();
	let SSService = getSSService();
	const userId = interaction.body.user.id;
	const channelId = interaction.body.channel.id;
	const givenInfo = interaction.body.state.values;
	const signal = receivingSignal(userId, SSService);
	console.log(givenInfo);
	let guess = Object.entries(givenInfo).find(info => info[1]["ignore-guess-text"])[1]["ignore-guess-text"].value;
	const warn = msg => interaction.client.chat.postEphemeral({
		channel: channelId,
		user: userId,
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: msg
				},
				accessory: {
					type: "button",
					text: {
						type: "plain_text",
						text: "Close"
					},
					action_id: "cancel"
				}
			}
		],
		text: msg
	});

	if (guess === null)
		return await warn("Type a guess!");

	if (guess.length !== signal.signal.length)
		return await warn("The signal is exactly " + signal.signal.length + " characters long, while your guess is " + guess.length + " characters. Fix that!");

	const isCorrect = guess === signal.signal;
	if (isCorrect) {
		SSService.signals.splice(SSService.signals.indexOf(signal), 1);
		await interaction.respond("You got the signal right!!!");
		await interaction.client.chat.postMessage({
			channel: signal.sender,
			text: "<@" + userId + "> has guessed your signal correctly!"
		});
	} else {
		await interaction.respond("That's wrong...");
	}
	saveState(SSService);
});

app.command("/ssservice-leaderboard", async interaction => [await interaction.ack(), await interaction.respond("This is the Secret Signal Service leaderboard! :secret-signal-service:\n\n" + Object.entries(getSSService().coins).sort((a, b) => b[1] - a[1]).map(user => "<@" + user[0] + "> has " + user[1] + " :secret-signal-service:!").join("\n"))]);

app.message(/secret button/i, async ({ message }) => {
	await app.client.chat.postEphemeral({
		channel: message.channel,
		user: message.user,
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "<@" + message.user + "> mentioned the secret button! Here it is:"
				}
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Secret Button"
						},
						action_id: "button_click"
					}
				]
			}
		],
		text: "<@" + message.user + "> mentioned the secret button! Here it is:",
		thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
	});
});

app.action("button_click", async ({ body, ack, respond }) => {
	await ack();
	await app.client.chat.postEphemeral({
		channel: body.channel.id,
		user: body.user.id,
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "You found the secret button. Here it is again."
				}
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Secret Button"
						},
						action_id: "button_click"
					}
				]
			}
		],
		text: "You found the secret button. Here it is again.",
		thread_ts: body.container.thread_ts || undefined
	});
});