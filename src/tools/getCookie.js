// возвращает cookie с именем name, если есть, если нет, то undefined
export default function getCookie(name) {
	const matches = document.cookie.match(
		new RegExp(`(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`),
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
}