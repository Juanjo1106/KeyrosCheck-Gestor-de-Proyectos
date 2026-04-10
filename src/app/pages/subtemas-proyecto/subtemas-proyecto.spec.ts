import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtemasProyecto } from './subtemas-proyecto';

describe('SubtemasProyecto', () => {
  let component: SubtemasProyecto;
  let fixture: ComponentFixture<SubtemasProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtemasProyecto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtemasProyecto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
