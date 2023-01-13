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
        - config.json
        - index.js
    - amusementclub2.0
        - index.js
```
This layout is required so that Ayano can start and manage the Amusement Club process, and is also used for some file imports from amusement. So do not rename the `amusementclub2.0` folder or some commands may/will break!
#### Config
The ayano config is a mix of the development config included with Amusement Club and one specifically for ayano. If you are moving from development to an Ayano run instance there will be some changes needed for a successful transition.

<details><summary>Config Fields</summary>

The following is taken from `./config.dest.json` but comments are added for clarity

```json
    "grouptimeout": 1000,
    "tick": 2500,
    "shards": 1, // The number of Amusement Shards
    "database": "", // Previously in Amusement, move the DB address here, it will be passed to ayano and Amusement
    "shard": { //This is effectively the config from Amusement Club, with some items moved to the base json
        "token": "DISCORD_VALID_BOT_TOKEN_GOES_HERE", // This is your Amusement Token
        "prefix": "/", // Amusement Bot Prefix
        "baseurl": "https://amusementclub.nyc3.digitaloceanspaces.com", // Card Base URL
        "shorturl": "https://amuse.noxc.dev", // Card Short URL, if you don't have one, re-use the above
        "debug": false,
        "invite": "", // Invite link to support server/some discord server
        "maintenance": true, // Maintenance is enabled by default and disabled once bot is ready
        "auctionLock": false, // When enabled, this keeps new auctions from being made
        "uniqueFrequency": 12, // *Memories of* effects will give a guaranteed missing every X use here
        "guildLogChannel": "DISCORD_VALID_CHANNEL_ID_GOES_HERE", // Log guild joins/leaves
        "adminGuildID": "DISCORD_VALID_GUILD_ID_GOES_HERE", // Main Admin guild for sudo commands
        "auditc": {
            "channel": ["DISCORD_VALID_CHANNEL_ID_GOES_HERE", "CAN TAKE MULTIPLE"], //Channels where audit commands work
            "taglogchannel": "DISCORD_VALID_CHANNEL_ID_GOES_HERE" // Channel where tag logs are sent
        },
        "autoAuction": {
            "auctionCount": 100,
            "auctionMultiplier": 0.9,
            "auctionLength": 12,
            "auctionUserID": "DISCORD_VALID_USER_ID_GOES_HERE WILL EMPTY CARDS"
        },
        "evalc": {
            "cardPrices": [ 30, 80, 150, 400, 1000, 2500 ],
            "evalUserRate": 0.25,
            "evalVialRate": 0.055,
            "aucEval": {
                "minSamples": 4,
                "maxSamples": 16,
                "minBounds": 0.5,
                "maxBounds": 5.0,
                "aucFailMultiplier": 0.90,
                "evalUpdateChannel": "DISCORD_VALID_CHANNEL_ID_GOES_HERE"
            }
        },
        "dbl": {
            "token": "",
            "port": 2727,
            "pass": "",
            "topggUrl": "",
            "dblUrl": ""
        },
        "analytics": {
            "mixpanel": ""
        },
        "metac": {
            "sauceNaoToken": "",
            "danbooruToken": ""
        }
    },
    "ayanobot": {
        "token": "", // Ayano's bot token goes here
        "prefix": "ayy", // Prefix for Ayano, which still uses message commands and not slash commands
        "reportchannel": "", // Channel for error and startup messages to go to
        "admins": [], // Deprecated, use Amusement Roles in place of this
        "mods": [] // Deprecated, use Amusement Roles in place of this
    },
    "aws": {
        "endpoint": "nyc3.digitaloceanspaces.com",
        "bucket": "amusementclub",
        "s3accessKeyId": "",
        "s3secretAccessKey": "",
        "cardroot": "cards/"
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

`reconnect` - This restarts the Amusement Club instance

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

`banword` - Adds a word to the banned word list, keeping it from being used in tags
- To ban a word (e.g. lame) `ayy banword lame`

`unbanword` - Removes a word from the banned word list
- To unban a word (e.g. lame) `ayy unbanword lame`

