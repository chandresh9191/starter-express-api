const request = require('request');

async function wallpaper(req, res) {
    return new Promise(async(resolve, reject) => {
        try {
            var find = await databaseClass.findDataNew("livewallpaper", {}, {
                _id: 0
            }, {}, 0, 0);

            let shuffled = find
                .map((a) => ({
                    sort: Math.random(),
                    value: a
                }))
                .sort((a, b) => a.sort - b.sort)
                .map((a) => a.value)
            console.log("find ---->", find.length);
            return resolve({
                status: 200,
                msg: 'Live Wallpaper Data',
                data: shuffled
            });

        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
    wallpaper
}