const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs');
const sizeOf = require('image-size');

fastify.register(require('fastify-static'), {
	root: path.join(__dirname, 'public'),
	prefix: '/public/',
});
fastify.register(require('fastify-cors'), {
	origin: true,
	methods: 'GET',
});

const imagesPath = path.join(__dirname, 'public', 'img');
const banners = fs
	.readdirSync(imagesPath)
	.map(fileName => {
		const { width, height } = sizeOf(path.join(imagesPath, fileName));
		return {
			url: 'http://ya.ru',
			curl: `http://0.0.0.0:3000/public/img/${fileName}`,
			w: width,
			h: height,
			type: 'BANNER_IMAGE',
		};
	})
	.sort((a, b) => (a.h > b.h ? 1 : b.h > a.h ? -1 : 0));

const imgResponse = id => {
	const response = {};
	const intId = parseInt(id.slice('SLOT-'.length), 10);
	// HTML as CODE
	if (id === 'SLOT-666') {
		response[id] = {
			html: '<div><strong style="color: red">test</strong></div>',
			w: 320,
			h: 60,
			type: 'BANNER_HTML',
		};

	// DUMMY - HTML as LINK
	} else if(id === 'SLOT-777') {
		response[id] = {
			curl: 'https://storage.ubex.io/backfill/240x400/index.html',
			w: 320,
			h: 60,
			type: 'BANNER_DUMMY',
		};
	// IMAGE
	} else {
		response[id] = banners[intId] ? banners[intId] : {};
	}

	return response;
};

// Declare a route
fastify.get('/v1/slot/', async ({ query: { id } }) => imgResponse(id));
fastify.get('/render', function (req, reply) {
	reply.sendFile('r.html') // serving path.join(__dirname, 'public', 'myHtml.html') directly
});
// Run the server!
const start = async () => {
	try {
		await fastify.listen(3000);
		fastify.log.info(`server listening on ${fastify.server.address().port}`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
