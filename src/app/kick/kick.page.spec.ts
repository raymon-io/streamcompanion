import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KickPage } from './kick.page';

describe('KickPage', () => {
  let component: KickPage;
  let fixture: ComponentFixture<KickPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(KickPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
