const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

describe('Task Manage features Test', function() {
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

        await driver.findElement(By.id('sidebar-toggle')).click();
        await driver.findElement(By.id('board-create-button')).click();
        await driver.findElement(By.className('board-name-input')).sendKeys('record-testing', Key.ENTER);
        await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'record-testing')]"), 1000));
        await driver.sleep(500);

        const boardSelect = await driver.findElement(By.xpath("//span[contains(text(), 'record-testing')]"))
        boardSelect.click();
    })

    it ('Task Creation', async function() {
        await driver.sleep(1000);
        for (let i = 0; i < 3; i++) {
            await driver.findElement(By.id('column-create-button')).click();
            await driver.findElement(By.id('board-column-creation-input')).sendKeys('column 0', i, Key.ENTER);
            await driver.sleep(300);
        }

        for (let i = 0; i < 3; i++) {
            await driver.findElement(By.id('task-add-button')).click();
            await driver.findElement(By.id('task-creation-input')).sendKeys('task 0', i, Key.ENTER);
            await driver.sleep(300);
        }

        await driver.findElement(By.className('task')).click();
        await driver.sleep(300);

        for (let i = 0; i < 10; i++) {
            await driver.findElement(By.className('task-desc')).sendKeys("this is testing", Key.ENTER);
        }

        await driver.findElement(By.className('edit-task-submit')).click();

        await driver.sleep(1000);

        await driver.findElement(By.className('task')).click();

        await driver.sleep(1000);

        await driver.findElement(By.className('edit-task-submit')).click();
    })

    it ('End', async function() {
        await driver.sleep(1000);

        await driver.findElement(By.id('sidebar-toggle')).click();
        const deleteButton = await driver.findElement(
            By.xpath("//li[.//span[text()='record-testing']]//button[contains(@class, 'delete-board-button')]")
        );
        await deleteButton.click();
        await driver.sleep(500);
    })
});
