import app from "./client.js";
import { getSSService, logInteraction, saveState } from "./datahandler.js";
const aiApiUrl = "https://ai.hackclub.com/chat/completions";
const headers = {
	"Content-Type": "application/json"
};
const lraj23BotTestingId = "C09GR27104V";
const lraj23UserId = "U0947SL6AKB";
const iWillBuryYouAliveInADarkAlleyAndLetTheRatsFeastUponYourCorpse = "i-will-bury-you-alive-in-a-dark-alley-and-let-the-rats-feast-upon-your-corpse";

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
							text: "Secret Button :" + mainEmojis[0] + ":"
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
					text: "You found the secret button :" + mainEmojis[0] + ": Here it is again."
				}
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Secret Button :" + mainEmojis[0] + ":"
						},
						action_id: "button_click"
					}
				]
			}
		],
		text: "You found the secret button :" + mainEmojis[0] + ": Here it is again.",
		thread_ts: body.container.thread_ts || undefined
	});
});