import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresasComponent } from './empresas';

describe('Empresas', () => {
  let component: EmpresasComponent;
  let fixture: ComponentFixture<EmpresasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpresasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
