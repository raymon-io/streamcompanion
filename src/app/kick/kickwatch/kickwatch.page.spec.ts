import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KickwatchPage } from './kickwatch.page';

describe('KickwatchPage', () => {
  let component: KickwatchPage;
  let fixture: ComponentFixture<KickwatchPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(KickwatchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
