const blocks = {};

function getBlock(blockName, data) {
	let block = blocks[blockName];
	if (!block) return {};
	if (!data) data = {};
	console.log("haha");

	return JSON.parse(JSON.stringify({
		test: "hehe",
		what: "is_happening",
		please: [
			"work",
			"and",
			"function"
		],
		also: {
			this: {
				is: {
					pretty: "strange"
				}
			}
		}
	}), (key, value) => {
		if (typeof value === "string") {
			if (value.startsWith("r:")) {
				let k = value.slice(2);
				value = ((k in data) ? data[k] : value);
				if (typeof value !== "string") return value;
			}
			return value.replace(/{(.+?)}/g, (_, k) => (
				(typeof data[k] === "undefined") ? "{" + k + "}" : data[k]
			));
		} else return value;
	});
}

export {
	getBlock as block
};