import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemasProyecto } from './temas-proyecto';

describe('TemasProyecto', () => {
  let component: TemasProyecto;
  let fixture: ComponentFixture<TemasProyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemasProyecto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemasProyecto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
