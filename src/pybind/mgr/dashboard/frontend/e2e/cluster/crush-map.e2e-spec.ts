import { $, browser } from 'protractor';
import { Helper } from '../helper.po';
import { CrushMapPageHelper } from './crush-map.po';

describe('CRUSH map page', () => {
  let crushmap: CrushMapPageHelper;

  beforeAll(() => {
    crushmap = new CrushMapPageHelper();
  });

  afterEach(async () => {
    await Helper.checkConsole();
  });

  describe('breadcrumb test', () => {
    beforeAll(async () => {
      await crushmap.navigateTo();
    });

    it('should open and show breadcrumb', async () => {
      await expect(crushmap.getBreadcrumbText()).toEqual('CRUSH map');
    });
  });
  describe('fields check', () => {
    beforeAll(async () => {
      await crushmap.navigateTo();
    });

    it('should check that title & table appears', async () => {
      // Check that title (CRUSH map viewer) appears
      await expect(crushmap.getPageTitle()).toMatch('CRUSH map viewer');

      // Check that title appears once OSD is clicked
      await crushmap.getCrushNode(1).click();

      const label = await $('legend').getText(); // Get table label
      await expect(crushmap.getCrushNode(1).getText()).toEqual(label);

      // Check that table appears once OSD is clicked
      await browser.wait(Helper.EC.visibilityOf($('.datatable-body')));
      await expect($('.datatable-body').isDisplayed()).toBe(true);
    });
  });
});
