import { Selector } from 'testcafe';

fixture`Use build-in assertions`.page`http://0.0.0.0:8080/`;

class Page {
	constructor() {
		this.slots = Selector('div').withAttribute('data-ubex-slot');
	}
}

const page = new Page();

test('Common tests', async  t => {
	await  t
		.expect(page.slots.count)
		.gte(0)
		.expect(page.slots.withAttribute('data-ubex-inv').exists)
		.ok();
	for (var i = 0; i < page.slots.count; i++)
		await t.expect(page.slots.nth(i).find('.ubx-wrapper').exists).ok();
});

