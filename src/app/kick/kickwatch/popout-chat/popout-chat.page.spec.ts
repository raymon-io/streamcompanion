import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopoutChatPage } from './popout-chat.page';

describe('PopoutChatPage', () => {
  let component: PopoutChatPage;
  let fixture: ComponentFixture<PopoutChatPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PopoutChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
