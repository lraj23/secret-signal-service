import app from "./client.js";
import { getSSService, logInteraction, saveState } from "./datahandler.js";
import { block } from "./blocks.js";
const lraj23BotTestingId = "C09GR27104V";
const lraj23UserId = "U0947SL6AKB";
const iWillBuryYouAliveInADarkAlleyAndLetTheRatsFeastUponYourCorpse = "i-will-bury-you-alive-in-a-dark-alley-and-let-the-rats-feast-upon-your-corpse";
const isCommunicating = (userId, SSService) => !SSService.signals.map(signal => [signal.sender, signal.receiver]).flat().reduce((product, id) => product * (+!(id === userId)), 1);
const receivingSignal = (userId, SSService) => SSService.signals.find(signal => signal.receiver === userId);
const communicationIsIn = (userId, SSService) => SSService.signals.find(signal => [signal.sender, signal.receiver].includes(userId));
const roundToTwo = n => Math.round((n + Number.EPSILON) * 100) / 100;
console.log(block("test"));

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
	console.log(message.text);
	if (message.text.toLowerCase().includes("secret button"))
		await app.client.reactions.add({
			channel: message.channel,
			name: "brilliant-move",
			timestamp: message.ts
		});
	if (receivingSignal(userId, SSService)) {
		const signal = receivingSignal(userId, SSService);
		signal.senderCoins = roundToTwo(signal.senderCoins - 2 / 3);
		signal.receiverCoins = signal.receiverCoins - 1;
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
		if (signal.sent > signal.signal.length) {
			SSService.coins[signal.receiver] = SSService.coins[signal.receiver] ? SSService.coins[signal.receiver] - 8 : -8;
			SSService.signals.splice(SSService.signals.indexOf(signal), 1);
		}
		else signal.sent++;
	}
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
	await interaction.respond({
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
		return await interaction.respond("You can't send another signal until your first signal completes. If you sent someone a signal, wait for them to guess or for the signal to expire. If someone sent you a signal, try running /ssservice-guess-signal to guess what signal they're sending you.");
	await interaction.respond({
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

	if (receiver === userId)
		return await warn("Sorry, you can no longer send signals to yourself...");

	if (!SSService.signalOptedIn.includes(receiver))
		return await warn("<@" + receiver + "> is not opted in. Try someone else or tell them to opt in to \"Signals\" with /ssservice-edit-opts");

	if (signalMsg === null)
		return await warn("Type a signal!");

	if (signalMsg.length > 32)
		return await warn("The signal must be up to 32 characters long!");

	if (isCommunicating(receiver, SSService))
		return await warn("You can't send a signal to <@" + receiver + "> right now because they are currently communicating with someone else. Ping or DM <@" + lraj23UserId + "> and ask him to manually end your signal for now.");

	const senderCoins = roundToTwo(signalMsg.length * 2 / 3);
	const receiverCoins = signalMsg.length;
	SSService.signals.push({
		sender: userId,
		receiver,
		signal: signalMsg,
		sent: 0,
		senderCoins,
		receiverCoins
	});
	await interaction.respond("<@" + userId + "> sent a signal to <@" + receiver + "> (worth " + senderCoins + " to you and " + receiverCoins + " to them) with this message: \n" + signalMsg);
	await interaction.client.chat.postMessage({
		channel: receiver,
		text: "<@" + userId + "> has sent you a signal that is " + signalMsg.length + " characters long. Send messages in any channel with this bot to begin to understand the signal. Guess the signal with /ssservice-guess-signal"
	});
	saveState(SSService);
});

app.command("/ssservice-guess-signal", async interaction => {
	await interaction.ack();
	const SSService = getSSService();
	const userId = interaction.payload.user_id;
	if (!SSService.signalOptedIn.includes(userId))
		return await interaction.respond("You aren't opted into the Secret Signal Service's Signals! Opt in to \"Signals\" first with /ssservice-edit-opts before trying to send signals!");
	if (!receivingSignal(userId, SSService))
		return await interaction.respond("You can't guess the signal if you aren't receiving one! Try just not using this command until someone sends you a signal.");
	const signal = receivingSignal(userId, SSService);
	await interaction.respond({
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
		SSService.coins[userId] = (SSService.coins[userId] || 0) + signal.receiverCoins;
		SSService.coins[signal.sender] = (SSService.coins[signal.sender] || 0) + signal.senderCoins;
		SSService.signals.splice(SSService.signals.indexOf(signal), 1);
		await interaction.respond("You got the signal right!!!");
		await interaction.client.chat.postMessage({
			channel: signal.sender,
			text: "<@" + userId + "> has guessed your signal correctly!"
		});
	} else {
		signal.receiverCoins = roundToTwo((signal.receiverCoins - 4) * 0.67);
		await interaction.respond("That's wrong... Your guess's worth just dropped by " + roundToTwo(4 + signal.receiverCoins * 33 / 67) + " :siege-coin:!");
	}
	saveState(SSService);
});

app.command("/ssservice-leaderboard", async interaction => [await interaction.ack(), await interaction.respond("This is the Secret Signal Service leaderboard! :siege-coin:\n\n" + Object.entries(getSSService().coins).sort((a, b) => b[1] - a[1]).map(user => "<@" + user[0] + "> has " + roundToTwo(user[1]) + " :siege-coin:!").join("\n"))]);

app.command("/ssservice-signal-value", async interaction => {
	await interaction.ack();
	const SSService = getSSService();
	const userId = interaction.payload.user_id;
	if (!isCommunicating(userId, SSService))
		return await interaction.respond("You can't check the value of your current communication if you're not in one! Try running /ssservice-send-signal to send a signal to someone, then check out the value of your signal.");
	const signal = communicationIsIn(userId, SSService);
	if (signal.sender === userId)
		await interaction.respond("You sent a signal to <@" + signal.receiver + "> with a length of " + signal.signal.length + " characters. It was originally worth " + roundToTwo(signal.signal.length * 2 / 3) + " :siege-coin: for you. Now, it is worth " + signal.senderCoins + " :siege-coin:! Also, the message you signaled was:\n" + signal.signal);
	else
		await interaction.respond("You were sent a signal by <@" + signal.sender + "> with a length of " + signal.signal.length + " characters. It was originally worth " + signal.signal.length + " :siege-coin: for you. Now, it is worth " + signal.receiverCoins + " :siege-coin:!");
});

app.command("/ssservice-shop", async interaction => {
	await interaction.ack();
	const SSService = getSSService();
	const userId = interaction.payload.user_id;
	if (userId !== lraj23UserId)
		return await interaction.respond("Sorry, this is still in development...");
	if (!SSService.signalOptedIn.includes(userId))
		return await interaction.respond("You can't access the shop if you aren't opted in! Opt in to \"Signals\" first with /ssservice-edit-opts. (This doesn't mean you don't have coins, you just aren't allowed to spend them).");
	const shopItems = Object.entries({
		"boost-2x-1hr": ["Boost #1 test - 2x for 1hr", 12],
		"boost-1.5x-1.5hr": ["Boost #2 test - 1.5x for 1.5hr", 14],
		"boost-3x-0.75hr": ["Boost #3 test - 3x for 0.75hr", 15],
		"boost-67x-0.067hr": ["Boost #4 test - 67x for 0.067hr", 27]
	});
	await interaction.respond({
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "*Choose what items you want to buy* (you have " + SSService.coins[userId] + " :siege-coin:):"
				}
			},
			{
				type: "divider"
			},
			...(shopItems.map(shopItem => [
				{
					type: "section",
					text: {
						type: "plain_text",
						text: shopItem[1][1] + " :siege-coin: - " + shopItem[1][0] + " (0 in cart)"
					}
				},
				{
					type: "actions",
					elements: [
						{
							type: "button",
							text: {
								type: "plain_text",
								text: ":heavy_plus_sign: Add to cart",
								emoji: true
							},
							value: "increase-to-cart-" + shopItem[0],
							action_id: "increase-to-cart-" + shopItem[0]
						}
					]
				},
				{
					type: "divider"
				}
			]).flat()),
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "Total Cost: 0 :siege-coin:"
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
							text: ":moneybag: Buy!",
							emoji: true
						},
						value: "confirm",
						action_id: "confirm-buy-items"
					}
				]
			}
		],
		text: "Choose what items you want to buy:"
	});
});

app.action(/^increase-to-cart-.+$/, async ({ ack }) => await ack());

app.action("confirm-buy-items", async ({ ack }) => await ack());

app.command("/ssservice-help", async interaction => [await interaction.ack(), await interaction.respond("This is the Secret Signal Service bot! The point of this is to earn coins and climb the leaderboard. You get these after sending a signal to someone or receiving a signal. Guessing the signal correctly rewards both the sender and receiver with :siege-coin: (unless the receiver guesses wrong too many times). Since this reacts to messages of users in public channels, and <https://hackclub.slack.com/archives/C0188CY57PZ/p1759957641808149|#meta really doesn't like that>, you have to opt IN for it to work. The bot must also be in the channel you are sending messages in.\nFor more information, check out the readme at https://github.com/lraj23/secret-signal-service"), interaction.payload.user_id === lraj23UserId ? await interaction.respond("Test but only for <@" + lraj23UserId + ">. If you aren't him and you see this message, DM him IMMEDIATELY about this!") : null]);

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