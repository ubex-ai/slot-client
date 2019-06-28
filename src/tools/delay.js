export default function (val) {
	return new Promise(resolve => setTimeout(resolve, val));
}
