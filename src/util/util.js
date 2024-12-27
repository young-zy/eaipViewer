
export function extractVarFromJs(jsText, varName) {
	let arr= (new RegExp(`var ${varName}\s*=\s*((.|\n)*)`,"gm").exec(jsText));
	return JSON.parse(arr[1])
}

export function listToTDesignTree(arr) {
	let m = new Map()
	let roots = [];
	arr.forEach((item) => {
		m.set(item.id, item);
		item.children = [];
		item.value = item.id;
		item.label = item.name_cn;
	});
	arr.forEach((item) => {
		if (item.pId === "" || !m.has(item.pId)) {
			roots.push(item);
		} else {
			let parent = m.get(item.pId);
			parent.children.push(item);
		}
	})
	return roots;
}
