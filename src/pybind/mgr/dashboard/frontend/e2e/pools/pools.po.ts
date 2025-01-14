import { $, browser, by, element, protractor } from 'protractor';
import { Helper } from '../helper.po';
import { PageHelper } from '../page-helper.po';

const EC = protractor.ExpectedConditions;
const pages = {
  index: '/#/pool',
  create: '/#/pool/create'
};

export class PoolPageHelper extends PageHelper {
  pages = pages;

  private isPowerOf2(n: number): boolean {
    // tslint:disable-next-line: no-bitwise
    return (n & (n - 1)) === 0;
  }

  @PageHelper.restrictTo(pages.index)
  async exist(name: string, oughtToBePresent = true) {
    const tableCell = await this.getTableCellByContent(name);
    const waitFn = oughtToBePresent ? EC.visibilityOf(tableCell) : EC.invisibilityOf(tableCell);
    try {
      await browser.wait(waitFn, Helper.TIMEOUT);
    } catch (e) {
      const visibility = oughtToBePresent ? 'invisible' : 'visible';
      const msg = `Pool "${name}" is ${visibility}, but should not be. Waiting for a change timed out`;
      return Promise.reject(msg);
    }
    return Promise.resolve();
  }

  @PageHelper.restrictTo(pages.create)
  async create(name: string, placement_groups: number, ...apps: string[]): Promise<any> {
    const nameInput = $('input[name=name]');
    await nameInput.clear();
    if (!this.isPowerOf2(placement_groups)) {
      return Promise.reject(`Placement groups ${placement_groups} are not a power of 2`);
    }
    await nameInput.sendKeys(name);
    await element(by.cssContainingText('select[name=poolType] option', 'replicated')).click();

    await expect(element(by.css('select[name=poolType] option:checked')).getText()).toBe(
      ' replicated '
    );
    await $('input[name=pgNum]').sendKeys(
      protractor.Key.CONTROL,
      'a',
      protractor.Key.NULL,
      placement_groups
    );
    await this.setApplications(apps);
    await element(by.css('cd-submit-button')).click();

    return Promise.resolve();
  }

  async edit_pool_pg(name: string, new_pg: number): Promise<void> {
    if (!this.isPowerOf2(new_pg)) {
      return Promise.reject(`Placement groups ${new_pg} are not a power of 2`);
    }
    const elem = await this.getTableCellByContent(name);
    await elem.click(); // select pool from the table
    await element(by.cssContainingText('button', 'Edit')).click(); // click edit button
    await expect(this.getBreadcrumbText()).toEqual('Edit'); // verify we are now on edit page
    await $('input[name=pgNum]').sendKeys(protractor.Key.CONTROL, 'a', protractor.Key.NULL, new_pg);
    await element(by.css('cd-submit-button')).click();
    const str = `${new_pg} active+clean`;
    await browser.wait(
      EC.visibilityOf(this.getTableRow(name)),
      Helper.TIMEOUT,
      'Timed out waiting for table row to load'
    );
    await browser.wait(
      EC.textToBePresentInElement(this.getTableRow(name), str),
      Helper.TIMEOUT,
      'Timed out waiting for placement group to be updated'
    );
  }

  private async setApplications(apps: string[]) {
    if (!apps || apps.length === 0) {
      return;
    }
    await element(by.css('.float-left.mr-2.select-menu-edit')).click();
    await browser.wait(
      Helper.EC.visibilityOf(element(by.css('.popover-content.popover-body'))),
      Helper.TIMEOUT
    );
    apps.forEach(
      async (app) => await element(by.cssContainingText('.select-menu-item-content', app)).click()
    );
  }

  @PageHelper.restrictTo(pages.index)
  async delete(name: string): Promise<any> {
    const tableCell = await this.getTableCellByContent(name);
    await tableCell.click();
    await $('.table-actions button.dropdown-toggle').click(); // open submenu
    await $('li.delete a').click(); // click on "delete" menu item
    const confirmationInput = () => $('#confirmation');
    await browser.wait(() => EC.visibilityOf(confirmationInput()), Helper.TIMEOUT);
    await this.clickCheckbox(confirmationInput());
    await element(by.cssContainingText('button', 'Delete Pool')).click(); // Click Delete item

    return Promise.resolve();
  }
}
