import app from "./client.js";
import { getSSService, logInteraction, saveState } from "./datahandler.js";
const aiApiUrl = "https://ai.hackclub.com/chat/completions";
const headers = {
	"Content-Type": "application/json"
};
const lraj23BotTestingId = "C09GR27104V";
const lraj23UserId = "U0947SL6AKB";
const iWillBuryYouAliveInADarkAlleyAndLetTheRatsFeastUponYourCorpse = "i-will-bury-you-alive-in-a-dark-alley-and-let-the-rats-feast-upon-your-corpse";

app.message("", async ({ message }) => {
	let SSService = getSSService();
	const userId = message.user;
	let activeSignal = SSService => SSService.signals.find(signal => signal.receiver === userId);
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
	if (message.ts - SSService.apiRequests[userId] < 1) {
		await app.client.reactions.add({
			channel: message.channel,
			name: "you-sent-a-message-too-fast-so-no-ai-request-to-avoid-rate-limit",
			timestamp: message.ts
		});
	} else SSService.apiRequests[userId] = message.ts;
	if (activeSignal(SSService)) {
		await app.client.reactions.add({
			channel: message.channel,
			name: (activeSignal(SSService).signal[activeSignal(SSService).sent] || iWillBuryYouAliveInADarkAlleyAndLetTheRatsFeastUponYourCorpse),
			timestamp: message.ts
		});
		console.log(activeSignal(SSService).sent, activeSignal(SSService).signal.length);
		if (activeSignal(SSService).sent >= activeSignal(SSService).signal.length) SSService.signals.splice(SSService.signals.indexOf(activeSignal(SSService)), 1);
		else activeSignal(SSService).sent++;
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