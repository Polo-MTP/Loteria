import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsperaAnfitrionComponent } from './espera-anfitrion.component';

describe('EsperaAnfitrionComponent', () => {
  let component: EsperaAnfitrionComponent;
  let fixture: ComponentFixture<EsperaAnfitrionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsperaAnfitrionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EsperaAnfitrionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
