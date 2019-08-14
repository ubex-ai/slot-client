import { addLocaleData } from 'react-intl';
import ch from './ch.json';
import de from './de.json';
import en from './en.json';
import fr from './fr.json';
import hi from './hi.json';
import it from './it.json';
import jp from './jp.json';
import pt from './pt.json';
import ru from './ru.json';
import ua from './ua.json';
addLocaleData({ locale: 'ru', pluralRuleFunction: () => '' });
addLocaleData({ locale: 'de', pluralRuleFunction: () => '' });
addLocaleData({ locale: 'en', pluralRuleFunction: () => '' });
addLocaleData({ locale: 'fr', pluralRuleFunction: () => '' });
addLocaleData({ locale: 'hi', pluralRuleFunction: () => '' });
addLocaleData({ locale: 'it', pluralRuleFunction: () => '' });
addLocaleData({ locale: 'jp', pluralRuleFunction: () => '' });
addLocaleData({ locale: 'pt', pluralRuleFunction: () => '' });
addLocaleData({ locale: 'ru', pluralRuleFunction: () => '' });
addLocaleData({ locale: 'ua', pluralRuleFunction: () => '' });
export const translations = {
	ch,
	de,
	en,
	fr,
	hi,
	it,
	jp,
	pt,
	ru,
	ua,
};
