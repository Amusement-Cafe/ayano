# This branch is under development and is not meant to be used until this notice is removed

---

**Ayano** is a bot designed to manage [Amusement Club](https://github.com/Amusement-Cafe/amusementclub2.0) and is required for card management, voting webhooks, and remote management of the Amusement Club process.

## Setup
#### Directory Layout
Ayano requires AmusementClub2.0 to be downloaded as well and setup in a shared folder.
```
- Amusement Club
    - ayano
        - data
            - cards.json
            - collections.json
            - ...
        - config.json
        - index.js
        - ...
    - amusementclub2.0
        - index.js
        - ...
```
This layout is required so that Ayano can start and manage the Amusement Club process, and is also used for some file imports from amusement. So do not rename the `amusementclub2.0` folder or some commands may/will break!
#### Config
The ayano config is a mix of the development config included with Amusement Club and one specifically for ayano. If you are moving from development to an Ayano run instance there will be some changes needed for a successful transition.

<details><summary>Config Fields</summary>

The following is taken from `./config.dest.json` but comments are added for clarity

```js
    {
    "grouptimeout": 1000, //This sets how long before ayano sends a message after receiving one to send
    "database": "", //This was originally bot in amusement, place it here for ayano.
    "amusement": {
        "analytics": {
            "mixpanel": ""
        },
        "auction": {
            "auctionFeePercent": 10, //Set the auction fee in percentage
            "auto": {
                "count": 100, // How many auctions will auto-auction keep listed
                "multiplier": 0.9, // How far above or below eval will the auctions list at
                "length": 12, // How long will they last (in hours)
                "userID": "DISCORD_VALID_USER_ID_GOES_HERE WILL EMPTY CARDS" // The user to remove cards from
            },
            "lock": false // Is auctioning cards locked?
        },
        "bot": {
            "token": "DISCORD_VALID_BOT_TOKEN_GOES_HERE", // Bot token for amusement
            "shards": 1, // How many shards amusement will use
            "prefix": "/", // With slash commands this is useless basically
            "invite": "", // The invite link for your bot
            "maintenance": true, // Is bot under maintenance? Sets to false when bot is ready to receive commands
            "debug": true,
            "adminGuildID": "DISCORD_VALID_GUILD_ID_GOES_HERE" // The sudo commands will be guild commands here
        },
        "channels": {
            "tagLog": "DISCORD_VALID_CHANNEL_ID_GOES_HERE", // Where tag auditing reports go to
            "guildLog": "DISCORD_VALID_CHANNEL_ID_GOES_HERE", // Where amusement join/leaves are logged
            "evalUpdate" :"DISCORD_VALID_CHANNEL_ID_GOES_HERE" // Where eval updates are posted
        },
        "effects": {
            "uniqueFrequency": 10 // How many uses of memories effects before a missing card is guaranteed
        },
        "evals": {
            "auction": {
                "minSamples": 4, //The minimum auctions needed before an eval update
                "maxSamples": 16, //The maximum values that can be held at a time
                "minBounds": 0.5, // Min deviation
                "maxBounds": 5.0, // Max deviation
                "aucFailMultiplier": 0.90 // Multiplier on cards for auctions not selling
            },
            "cardPrices": [ 30, 80, 150, 400, 1000, 2500 ],
            "evalUserRate": 0.25,
            "evalVialRate": 0.055
        },
        "links": {
            "baseurl": "https://amusementclub.nyc3.digitaloceanspaces.com", // Long card URL
            "shorturl": "https://amuse.noxc.dev", // Short card URL
            "topggUrl": "", // Voting link for top.gg
            "dblUrl": "" // Voting link for discorbotlist
        },
        "rng": {
            "legendary": 0.01 // Like col rarity, what does Math.random() need to roll below for a chance of a legendary
        },
        "sourcing": {
            "sauceNaoToken": ""
        },
        "symbols": { // This has been removed from index.js to allow more easy access
            "tomato": "`🍅`",
            "vial": "`🍷`",
            "lemon": "`🍋`",
            "star": "★",
            "auc_sbd": "🔹",
            "auc_lbd": "🔷",
            "auc_sod": "🔸",
            "auc_wss": "▫️",
            "accept": "✅",
            "decline": "❌",
            "red_circle": "`🔴`",
            "amu_plus": "➕"
        }
    },
    "ayanobot": {
        "token": "DISCORD_VALID_BOT_TOKEN_GOES_HERE", // Ayano's bot token goes here
        "prefix": "ayy", // Ayano still uses message content so this is needed
        "reportchannel": "" // Where ayano will post it's messages
    },
    "aws": {
        "endpoint": "nyc3.digitaloceanspaces.com",
        "bucket": "amusementclub",
        "s3accessKeyId": "",
        "s3secretAccessKey": "",
        "cardroot": "cards/"
    },
    "webhooks": {
        "dbl": {
            "token": "",
            "port": 2727,
            "pass": ""
        },
        "kofi": {
            "verification": "KO-FI VERIFICATION TOKEN GOES HERE"
        }
    }
}

```
</details>

#### Running
Once you have setup your config, run `npm i` in both the Ayano and Amusement folders, then run `npm start` inside the ayano folder. This should start the Ayano CLI, for commands see below.


## Commands
All commands besides the first can be run in a server with Ayano and correct permissions using the prefix set in your config, e.g `ayy start`

`watch` - This starts Ayano

`stopwatch` - This stops Ayano

`start` - This starts the Amusement Club Instancing

`stop` - This shuts down Amusement Club

`restart` - This restarts the Amusement Club instance

`ayrestart` - This restarts the Ayano instance

`git pull` - This pulls the latest update of the current amusement branch

`listen` - Start the webhook listeners for votes/kofi

`stress` - Sends test messages over the info event bus

`flushdata` - Dumps all data and refreshes it (collections, cards, promos, boosts, banned words)

`promo` - Create a new promo event for Amusement Club
- To create a new promo `ayy promo ColName -s StartDate -e EndDate -c Currency Emoji`, the start date can be "today", and end date needs to be formatted in YYYY-MM-DD format.

`boost` - Create a new boosted query for Amusement Club
- To create a new boost `ayy boost BoostName --query"Card Query to Filter Cards" --start=StartDate --end=EndDate` Date formats are the same as above, you can also use YYYY/M/DD for end

`update` - Update a collection or add a new one to Amusement Club
- To update or add a collection `ayy update --col=ColName` if it is a promo collection add `--promo=true`

`rename` - Rename a card in Amusement Club
- To rename a card `ayy rename card query, New Name`

`alias` - Add an alias to a collection
- To add an alias `ayy alias ColID, alias`

`coldisplay` - Change the display name of a collection
- To change the display `ayy coldisplay colID, New Display Name`

`banword` - Adds a word to the banned word list, keeping it from being used in tags
- To ban a word (e.g. lame) `ayy banword lame`

`unbanword` - Removes a word from the banned word list
- To unban a word (e.g. lame) `ayy unbanword lame`

