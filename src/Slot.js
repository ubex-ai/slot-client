const Slot = function (containerElement, sendRequest) {

    const self = {
        container: containerElement,
        id: containerElement.dataset.ubexSlot,
        client: containerElement.dataset.ubexClient,
        size: {
            w: parseInt(containerElement.style.width),
            h: parseInt(containerElement.style.height)
        }
    };

    const updateInterval = setInterval(() => {
        self.render();
    }, 15 * 1000);

    self.container.style.position = 'relative';
    self.container.style.display = 'block';

    self.getCode = (container, callback) => {
        return sendRequest(UBEX_URL + '/get-slot', {...self.size}).then(res => {
            console.log('slot code updated');
            container.innerHTML = res.response;
            if (typeof callback == 'function') {
                callback();
            }
        }).catch(console.error);
    };

    self.ui = () => {
        self.uiContainer = document.createElement('div');
        const header = document.createElement('div');
        header.innerText = 'Скрыть рекаламу:';
        header.style.fontWeight = 'bold';
        header.style.fontSize = '12px';
        header.style.marginBottom = '5px';
        self.uiContainer.appendChild(header);
        self.closeBtn = self.uiBtn('Закрыть', self.toggleUI);
        self.closeBtn.style.right = 0, self.closeBtn.style.top = 0;
        self.closeBtn.style.position = 'absolute';
        self.closeBtn.style.display = 'none';
        self.uiContainer.style.position = 'absolute';
        self.uiContainer.style.height = '100%';
        self.uiContainer.style.width = '100%';
        self.uiContainer.style.left = 0, self.uiContainer.style.top = 0;
        self.uiContainer.style.paddingTop = '30px';
        self.uiContainer.style.backgroundColor = '#dedede';
        self.uiContainer.style.display = 'none';
        self.uiContainer.style.padding = '5px';
        self.uiContainer.style.paddingTop = '30px';

        self.container.addEventListener('mouseenter', function () {
            self.closeBtn.style.display = 'block';
        });
        self.container.addEventListener('mouseleave', function () {
            if (self.uiContainer.style.display !== 'block') {
                self.closeBtn.style.display = 'none';
            }
        });

        const btns = [
            self.uiBtn('Advertising closes content', closeAdAndSendRequest.bind(this, 1)),
            self.uiBtn('Viewed several times', closeAdAndSendRequest.bind(this, 2)),
            self.uiBtn('Unacceptable advertising', closeAdAndSendRequest.bind(this, 3)),
            self.uiBtn('Not interested', closeAdAndSendRequest.bind(this, 4))
        ];

        for (var i = 0; i < btns.length - 1; i++) {
            self.uiContainer.appendChild(btns[i]);
        }
        self.container.appendChild(self.uiContainer);
        self.container.appendChild(self.closeBtn);
    };

    function closeAdAndSendRequest(t, postMsg) {
        sendRequest(UBEX_URL + '/close-slot', {t: t});
        const msg = document.createElement('div');
        msg.style.fontWeight = 'bold';
        msg.style.textAlign = 'center';
        msg.innerText = typeof postMsg == 'string' ? postMsg : 'Объявление скрыто';
        self.uiContainer.innerText = '';
        self.uiContainer.appendChild(msg);
        setTimeout(() => {
            self.render();
        }, 1500);
    }

    self.toggleUI = () => {
        console.log('toggle ui');
        self.uiContainer.style.display = self.uiContainer.style.display === 'none' ? 'block' : 'none'
    };

    self.uiBtn = (text, callback) => {
        const btn = document.createElement('div');
        btn.innerText = text;
        btn.style.padding = '2px 4px';
        btn.style.backgroundColor = '#fff';
        btn.style.marginBottom = '5px';
        btn.style.fontSize = '12px';
        btn.style.cursor = 'pointer';
        btn.addEventListener('mouseenter', function () {
            btn.style.backgroundColor = '#6bb1ff'
        });
        btn.addEventListener('mouseleave', function () {
            btn.style.backgroundColor = '#fff'
        });
        btn.onclick = callback;
        return btn;
    };

    self.render = () => {
        self.getCode(self.container, () => self.ui());
    };

    self.render();
    console.log('slot init. id: ' + self.id);

    return self;
};

export default Slot;
