const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

describe('Board Manage features Test', function() {
    let driver;
    this.timeout(30000);

    before(async function() {
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(new chrome.Options())
            .build();
    });

    after(async function() {
        if (driver) await driver.quit();
    });

    it ('Init', async function() {
        await driver.get('http://localhost:3000/');
        await driver.wait(until.titleIs('TaskManager'), 5000);
        const title = await driver.getTitle();
        expect(title).to.equal('TaskManager');
        const loginButton = await driver.findElement(By.id('login-button'));
        await loginButton.click();
        await driver.findElement(By.id('username')).sendKeys('test', Key.TAB);
        await driver.findElement(By.id('password')).sendKeys('a', Key.TAB);
        await driver.findElement(By.css('button#submit')).click();
        await driver.wait(until.urlContains('/board'), 1000);
        const username = await driver.findElement(By.id('userDropdown')).getText();
        expect(username).to.equal('test');
    })

    it ('Board Creation/Deletion', async function() {
        await driver.findElement(By.id('sidebar-toggle')).click();
        await driver.findElement(By.id('board-create-button')).click();
        await driver.findElement(By.className('board-name-input')).sendKeys('record-testing', Key.ENTER);
        await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'record-testing')]"), 1000));
        await driver.sleep(500);

        const boardSelect = await driver.findElement(By.xpath("//span[contains(text(), 'record-testing')]"))
        boardSelect.click();
        const boardName = await driver.findElement(By.css('div.board-title')).getText();
        // expect(boardName).to.equal('record-testing');

        await driver.sleep(500);

        await driver.findElement(By.id('sidebar-toggle')).click();
        const deleteButton = await driver.findElement(
            By.xpath("//li[.//span[text()='record-testing']]//button[contains(@class, 'delete-board-button')]")
        );
        await deleteButton.click();
        await driver.sleep(500);
        expect(boardName).to.not.equal('record-testing');
        await driver.sleep(500);
    })

    it ('Board name Edit', async function() {

        let boardName = await driver.findElement(By.css('div.board-title'));
        const preBoardName = await boardName.getText();

        await driver.wait(until.elementLocated(By.id('edit-board-title-button')), 1000);

        await driver.findElement(By.id('edit-board-title-button')).click();
        await driver.findElement(By.className('edit-title-input')).sendKeys('-testing', Key.ENTER);

        await driver.sleep(500);

        boardName = await driver.findElement(By.css('div.board-title'));
        let curName = await boardName.getText();
        expect(curName).to.equal(preBoardName + '-testing');

        await driver.findElement(By.id('edit-board-title-button')).click();
        for (let i = 0; i < 100; i++) await driver.findElement(By.className('edit-title-input')).sendKeys(Key.BACK_SPACE);
        await driver.findElement(By.className('edit-title-input')).sendKeys(preBoardName, Key.ENTER);

        await driver.sleep(500);

        boardName = await driver.findElement(By.css('div.board-title'));
        curName = await boardName.getText();
        expect(await boardName.getText()).to.equal(preBoardName);
    })
});
