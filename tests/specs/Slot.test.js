import {assert} from 'chai';
import Slot from "../../src/Slot";


describe('AdSlot', () => {
    const adSlot = Slot();

    it('should be exist', async () => {
        assert.typeOf(adSlot, 'object', 'Объект инициализирован');
    });

    it('На странице есть контейнеры', function () {
        assert.isAbove(document.getElementsByClassName('ubex-slot').length, 0, 'На странице есть контейнеры');
    });

    it('Для каждого контейнера есть объект Slot в slots с id слота и клиента', function () {

    });

    // Определить платформу и размер экрана
    it('Должен уметь определять платформу', () => {
        assert.typeOf(adSlot.getPlafrorm, 'function');
        const platfrorm = adSlot.getPlafrorm();
        assert.typeOf(platfrorm, 'string');
        assert.equal(platfrorm, 'desktop');
    });

    it('Должен уметь определять размеры экрана', () => {
        assert.typeOf(adSlot.screen, 'object');
        assert.typeOf(adSlot.screen.getSize, 'function');
        assert.typeOf(adSlot.screen.getSize(), 'array');
        assert.lengthOf(adSlot.screen.getSize(), 2);
    });

    // 2. Отправить запрос за рекламой с данными о платформе и экране
    it('Должен уметь отправить запрос за кодом с рекламой', (done) => {
        assert.typeOf(adSlot.fetchCode, 'function');
        adSlot.fetchCode().then(done);
    });
    // 3. Получить код баннера.
    // 4. Создать iframe на месте вызова и положить туда код баннера
    // 5. Подключить код pixel рядом с баннером
});