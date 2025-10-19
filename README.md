# Secret Signal Service

### Main Purpose

The point of this bot is to allow you to send signals to other users in an attempt to earn coins and climb the leaderboard. When you send a signal to someone, the bot will react to all their next few messages with the next character of the signal (if possible). The longer it takes for the signal receiver to guess the message correctly, the less reward both parties will receive. Additionally, guessing wrong decreases the receiver's signal value quite a bit.

### Commands

Since this bot direct messages you and reacts to your messages, and "a lot of people" (I'm talking about [that *one* #meta thread](https://hackclub.slack.com/archives/C0188CY57PZ/p1759957641808149)) probably don't like that, you can only participate if you opt in.

#### /ssservice-edit-opts
This command allows you to change what level you wanted to be opted in to. Currently, there are only two: not opted in and opted in to "everything." Opted in to nothing means that the bot won't really interact with you, while the "Signals" level allows you to: send signals to people, receive DMs about signals sent to or by you, and get reactions for signals sent to you.

#### /ssservice-send-signal
This command allows you to send a signal to someone else. It only works if you're opted in on the "Signal" level, however. This brings up an interface to select someone to send the signal to, and the signal itself (which must be under 32 characters). As long as: (1) you chose someone to send to, (2) they are opted in on the "Signal" level, (3) you typed a signal, (4) the signal is at most 32 characters long, and (5) the receiver is not already in a communication, you will be able to send them a signal. They get a DM that @'s the sender and also tells them the length of the signal.

#### /ssservice-guess-signal
This command allows you to guess the signal sent to you. It only works if you're opted in on the "Signal" level and someone has sent you a still-pending signal. This brings up an interface to guess the signal, and it tells you who sent you the signal and the length of the signal. As long as: (1) you typed a guess and (2) your guess is the right length, you will be able to guess. If you guess correctly, you will get the amount of coins in the value of the signal (often the number of characters left in the signal), and the sender will get their amount of coins in the value of hte signal (often 2/3 times the number of characters left in the signal). The sender will also get a DM that you guessed their signal correct. If you guess wrong, your value of coins will decrease quite a bit (subtract 4 then multiply by 0.67).

#### /ssservice-leaderboard
This command shows you the list of all the people's coins on the leaderboard. Earn coins by getting correctly guessed signals.

#### /ssservice-signal-value
This command allows you to view information about your current signal. It only works if you're currently in a still-pending signal (that either you sent OR received). If you received the signal, it will tell you who sent it, how long the signal is, how much the signal was originally worth for you, and how much the signal value for you is now. If you SENT the signal, it will tell you who you sent it to, how long the signal is, how much the signal was originally worth for you, how much the signal value for you is now, and the actual signal message you sent.

#### /ssservice-help
This command helps you navigate the bot. It basically redirects you to this repository though, so no need to run it after seeing it here.

### Links, Channels, etc.

The dedicated channel for testing this bot is [#lraj23-bot-testing](https://hackclub.slack.com/archives/C09GR27104V). The GitHub repo is literally [right here](https://www.github.com/lraj23/secret-signal-service). My Hackatime project for this bot is called secret-signal-service.