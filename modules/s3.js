
//this is old and has to be changed

scanCards = async (callback, allCards, root, marker, collected = [], cols = []) => {
    let params = {Bucket: 'amusementclub', MaxKeys: 2000};

    if(marker)
        params.Marker = marker;

    s3.listObjects(params, async (err, data) => {
        if(err) console.log(err);

        let len = 0;
        data.Contents.map(object => {
            let item = object.Key.split('.')[0];
            let ext = object.Key.split('.')[1];
            if(ext && acceptedExts.includes(ext) &&
                item.startsWith(root) && !allCards.includes(item)){
                let split = item.split('/');
                if(split.length == 3) {
                    let card = getCardObject(split[2] + '.' + ext, split[1]);
                    collected.push(card);
                    let col = cols.filter(c => c.name == split[1])[0];
                    if(!col) cols.push({name: split[1], special: root == 'promo', compressed: ext == 'jpg'});
                    else if(!card.craft && ext == 'jpg') col.compressed = true;
                    len++;
                }
            }
        });

        callback(len, collected.length);

        if (data.IsTruncated) {
            let marker = data.Contents[data.Contents.length - 1].Key;
            let res = await loadFilesFromS3(callback, allCards, root, marker, collected, cols);
            return resolve(res);
        } else {
            cols.forEach(item => {
                if (!collections.parseCollection(item.name).length)
                    collections.addCollection(item.name, item.special, item.compressed);
            });
            resolve(collected);
        }
    });
}

getCardObject = (name, collection) => {
    name = name
        .replace(/ /g, '_')
        .replace(/'/g, '')
        .trim()
        .toLowerCase()
        .replace(/&apos;/g, "");

    let split = name.split('.');
    let craft = name.substr(1, 2) === "cr";

    collection = collection.replace(/=/g, '');
    return {
        "name": craft? split[0].substr(4) : split[0].substr(2),
        "collection": collection,
        "level": parseInt(name[0]),
        "animated": split[1] === 'gif',
        "craft": craft
    }
}

module.exports = {

}