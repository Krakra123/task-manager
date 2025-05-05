const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

describe('Get in Task Manager App Test', function() {
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

    it('Title test - TaskManager', async function() {
        await driver.get('http://localhost:3000/');
        // Chờ title đúng “Task Manager” (thay bằng title thật của bạn)
        await driver.wait(until.titleIs('TaskManager'), 5000);
        const title = await driver.getTitle();
        expect(title).to.equal('TaskManager');
    });

    it ('Login test', async function() {
        const loginButton = await driver.findElement(By.id('login-button'));
        await loginButton.click();
        await driver.findElement(By.id('username')).sendKeys('test', Key.TAB);
        await driver.findElement(By.id('password')).sendKeys('a', Key.TAB);
        await driver.findElement(By.css('button#submit')).click();
        await driver.wait(until.urlContains('/board'), 1000);
        const username = await driver.findElement(By.id('userDropdown')).getText();
        expect(username).to.equal('test');
    });
});
