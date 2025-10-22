import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageGroup } from './manage-group';

describe('ManageGroup', () => {
  let component: ManageGroup;
  let fixture: ComponentFixture<ManageGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
